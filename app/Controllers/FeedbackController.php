<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Config;
use App\Core\Controller;
use App\Core\Csrf;
use App\Core\Mailer;
use App\Core\Validator;
use App\Models\Feedback;
use Throwable;

/**
 * Bug reports and feature suggestions. Open to guests: casual visitors
 * are often the ones who hit a bug and won't make an account to report it.
 */
final class FeedbackController extends Controller
{
    // Submission times this session, for the per-session limit.
    private const SESSION_SUBMISSIONS = 'feedback_submissions';

    // Which kind was just sent, so the redirect can thank the player.
    private const SESSION_SENT = 'feedback_sent';

    private const SESSION_LIMIT = 5;
    private const LIMIT_WINDOW_SECONDS = 3600;

    // Past this many reports an hour from everyone, reports are still
    // saved but notification emails pause.
    private const EMAIL_FLOOD_LIMIT = 20;

    public function show(): void
    {
        $sent = $_SESSION[self::SESSION_SENT] ?? null;
        unset($_SESSION[self::SESSION_SENT]);

        $this->renderForm(self::kindFrom($_GET['type'] ?? null), [
            'sent' => is_string($sent) ? $sent : null,
            'old' => [
                'page_url' => self::pageUrlFrom($_GET['from'] ?? null),
            ],
        ]);
    }

    public function store(): void
    {
        if (!Csrf::validate(self::postString('csrf_token'))) {
            http_response_code(403);

            $this->view('errors/403', [
                'pageTitle' => 'Request Denied',
            ]);

            return;
        }

        $kind = self::kindFrom($_POST['kind'] ?? null);
        $userId = Auth::activeId();
        $isBug = $kind === 'bug';

        $feedback = [
            'kind' => $kind,
            'summary' => trim(self::postString('summary')),
            'details' => trim(self::postString('details')),
            // Bug-only fields are ignored on a suggestion.
            'expected' => $isBug ? trim(self::postString('expected')) : '',
            'attachment' => $isBug ? rtrim(self::postString('attachment')) : '',
            // Signed-in players are linked to their account instead.
            'contact_email' => $userId === null
                ? strtolower(trim(self::postString('contact_email')))
                : '',
        ];

        $pageUrl = self::pageUrlFrom($_POST['page_url'] ?? null);

        /*
         * Honeypot: a field people can't see, that bots fill in. Answer as
         * if it worked, so the bot has no reason to try something else.
         */
        if (trim(self::postString('website')) !== '') {
            $this->redirectToThanks($kind);

            return;
        }

        if ($this->hasReachedSessionLimit()) {
            http_response_code(429);

            $this->renderForm($kind, [
                'errors' => [
                    'form' => 'You have sent several reports in the last hour. '
                        . 'Please try again later.',
                ],
                'old' => $feedback + ['page_url' => $pageUrl],
            ]);

            return;
        }

        $errors = Validator::feedback($feedback);

        if ($errors !== []) {
            http_response_code(422);

            $this->renderForm($kind, [
                'errors' => $errors,
                'old' => $feedback + ['page_url' => $pageUrl],
            ]);

            return;
        }

        $feedbackModel = new Feedback();

        $feedbackId = $feedbackModel->create([
            'kind' => $kind,
            'user_id' => $userId,
            'contact_email' => self::nullIfEmpty($feedback['contact_email']),
            'summary' => $feedback['summary'],
            'details' => $feedback['details'],
            'expected' => self::nullIfEmpty($feedback['expected']),
            'attachment' => self::nullIfEmpty($feedback['attachment']),
            'page_url' => $pageUrl,
            'user_agent' => self::userAgent(),
        ]);

        $this->recordSubmission();

        $this->notify($feedbackModel, $feedbackId, $feedback, $pageUrl, $userId);

        $this->redirectToThanks($kind);
    }

    /**
     * @param array<string, mixed> $data
     */
    private function renderForm(string $kind, array $data = []): void
    {
        $this->view('feedback/create', [
            'pageTitle' => $kind === 'bug' ? 'Report A Bug' : 'Suggest A Feature',
            'kind' => $kind,
            'isSignedIn' => Auth::activeId() !== null,
            ...$data,
        ]);
    }

    /**
     * Emails the report to the address in FEEDBACK_EMAIL. The report is
     * already saved, so a failed email is logged, never shown to the player.
     *
     * @param array<string, string> $feedback
     */
    private function notify(
        Feedback $feedbackModel,
        int $feedbackId,
        array $feedback,
        ?string $pageUrl,
        ?int $userId,
    ): void {
        $recipient = Config::get('FEEDBACK_EMAIL');

        if (!$recipient) {
            error_log("Feedback #{$feedbackId} saved; FEEDBACK_EMAIL is not set, so no email was sent.");

            return;
        }

        try {
            if ($feedbackModel->countCreatedInLast(self::LIMIT_WINDOW_SECONDS) > self::EMAIL_FLOOD_LIMIT) {
                error_log("Feedback #{$feedbackId} saved; emails paused after more than "
                    . self::EMAIL_FLOOD_LIMIT . ' reports in the last hour.');

                return;
            }

            $label = $feedback['kind'] === 'bug' ? 'Bug' : 'Suggestion';
            // One line, whatever was typed.
            $summary = preg_replace('/\s+/', ' ', $feedback['summary']);

            Mailer::send(
                $recipient,
                "[Brymon {$label} #{$feedbackId}] {$summary}",
                Mailer::render('feedback', [
                    'feedbackId' => $feedbackId,
                    'label' => $label,
                    'feedback' => $feedback,
                    'pageUrl' => $pageUrl,
                    'username' => $userId !== null ? Auth::username() : null,
                ])
            );
        } catch (Throwable $exception) {
            error_log("Feedback #{$feedbackId} saved; notification failed: " . $exception);
        }
    }

    private function redirectToThanks(string $kind): void
    {
        $_SESSION[self::SESSION_SENT] = $kind;

        // 303: reload the form with GET, so a refresh can't send it twice.
        header('Location: /feedback?type=' . $kind, true, 303);
    }

    private function hasReachedSessionLimit(): bool
    {
        return count($this->recentSubmissions()) >= self::SESSION_LIMIT;
    }

    private function recordSubmission(): void
    {
        $_SESSION[self::SESSION_SUBMISSIONS] = [...$this->recentSubmissions(), time()];
    }

    /**
     * @return list<int>
     */
    private function recentSubmissions(): array
    {
        $cutoff = time() - self::LIMIT_WINDOW_SECONDS;
        $submissions = $_SESSION[self::SESSION_SUBMISSIONS] ?? [];

        return array_values(array_filter(
            is_array($submissions) ? $submissions : [],
            static fn ($time): bool => is_int($time) && $time > $cutoff
        ));
    }

    private static function kindFrom(mixed $value): string
    {
        return is_string($value) && in_array($value, Validator::FEEDBACK_KINDS, true)
            ? $value
            : 'bug';
    }

    /**
     * The page the player came from: a path on this site ("/teambuilder"),
     * or null for anything else.
     */
    private static function pageUrlFrom(mixed $value): ?string
    {
        if (
            !is_string($value)
            || mb_strlen($value) > 500
            // One leading slash: "//evil.example" is another site.
            || preg_match('#^/(?!/)[^\x00-\x1F\x7F]*$#', $value) !== 1
        ) {
            return null;
        }

        return $value;
    }

    private static function userAgent(): ?string
    {
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';

        return is_string($userAgent) && $userAgent !== ''
            ? mb_substr($userAgent, 0, 500)
            : null;
    }

    // A field as text; a crafted array (name[]=...) counts as empty.
    private static function postString(string $name): string
    {
        $value = $_POST[$name] ?? '';

        return is_string($value) ? $value : '';
    }

    private static function nullIfEmpty(string $value): ?string
    {
        return $value === '' ? null : $value;
    }
}
