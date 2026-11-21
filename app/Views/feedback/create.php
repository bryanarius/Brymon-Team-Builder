<?php

declare(strict_types=1);

use App\Core\Csrf;
use App\Core\Validator;

$pageTitle = $pageTitle ?? 'Feedback';

require dirname(__DIR__) . '/layouts/header.php';

$kind = $kind ?? 'bug';
$isBug = $kind === 'bug';
$isSignedIn = $isSignedIn ?? false;
$errors = $errors ?? [];
$old = $old ?? [];
// The kind just sent ("bug" or "suggestion"), after the redirect.
$sent = $sent ?? null;
$pageUrl = $old['page_url'] ?? null;

$escape = static fn (?string $value): string => htmlspecialchars(
    (string) $value,
    ENT_QUOTES,
    'UTF-8'
);

$oldValue = static fn (string $field): string => $escape($old[$field] ?? '');

$errorClass = static fn (string $field): string => isset($errors[$field])
    ? 'input-error'
    : '';

// Switching tabs keeps the page the player came from.
$tabUrl = static fn (string $type): string => '/feedback?' . http_build_query(
    array_filter(['type' => $type, 'from' => $pageUrl])
);

$fieldError = static function (string $field) use ($errors, $escape): void {
    if (isset($errors[$field])) {
        echo '<p class="form-error" id="' . $escape($field) . '-error">'
            . $escape($errors[$field])
            . '</p>';
    }
};

$describedBy = static fn (string $field): string => isset($errors[$field])
    ? 'aria-describedby="' . $field . '-error" aria-invalid="true"'
    : '';
?>

<main class="account-page feedback-page" id="main-content">
    <div class="account-container">
        <div class="account-header">
            <h1>Feedback</h1>
            <p>Found something broken, or have an idea for Brymon? Let me know.</p>
        </div>

        <nav class="feedback-tabs" aria-label="Feedback type">
            <a
                href="<?= $escape($tabUrl('bug')) ?>"
                class="feedback-tab"
                <?= $isBug ? 'aria-current="page"' : '' ?>
            >
                Report a bug
            </a>

            <a
                href="<?= $escape($tabUrl('suggestion')) ?>"
                class="feedback-tab"
                <?= $isBug ? '' : 'aria-current="page"' ?>
            >
                Suggest a feature
            </a>
        </nav>

        <?php if ($sent !== null): ?>
            <div class="account-alert account-alert--success" role="status">
                <?= $sent === 'bug'
                    ? 'Thanks! Your bug report was sent. It helps a lot.'
                    : 'Thanks! Your suggestion was sent.' ?>
            </div>
        <?php endif; ?>

        <section class="account-card" aria-labelledby="feedback-heading">
            <h2 id="feedback-heading">
                <?= $isBug ? 'Report a bug' : 'Suggest a feature' ?>
            </h2>

            <p class="account-card-hint">
                <?= $isBug
                    ? 'Tell me what went wrong and what you were doing. If it happened while importing a team, paste the team below so I can reproduce it.'
                    : 'Describe the feature and how you would use it.' ?>
            </p>

            <?php if (isset($errors['form'])): ?>
                <div class="account-alert" role="alert">
                    <?= $escape($errors['form']) ?>
                </div>
            <?php endif; ?>

            <form
                method="POST"
                action="/feedback"
                class="account-form"
                data-submit-lock
                data-submit-label="Sending…"
            >
                <input type="hidden" name="csrf_token" value="<?= $escape(Csrf::token()) ?>">
                <input type="hidden" name="kind" value="<?= $escape($kind) ?>">

                <?php if ($pageUrl !== null): ?>
                    <input type="hidden" name="page_url" value="<?= $escape($pageUrl) ?>">
                <?php endif; ?>

                <div class="form-group">
                    <label for="summary">Summary</label>

                    <input
                        type="text"
                        id="summary"
                        name="summary"
                        required
                        maxlength="<?= Validator::FEEDBACK_SUMMARY_MAX ?>"
                        value="<?= $oldValue('summary') ?>"
                        placeholder="<?= $isBug
                            ? 'e.g. Showdown import fails for Ogerpon'
                            : 'e.g. Show Speed tiers in the builder' ?>"
                        class="<?= $errorClass('summary') ?>"
                        <?= $describedBy('summary') ?>
                    >

                    <?php $fieldError('summary'); ?>
                </div>

                <div class="form-group">
                    <label for="details">
                        <?= $isBug ? 'What happened?' : 'Your idea' ?>
                    </label>

                    <textarea
                        id="details"
                        name="details"
                        rows="5"
                        required
                        maxlength="<?= Validator::FEEDBACK_DETAILS_MAX ?>"
                        placeholder="<?= $isBug
                            ? 'What you clicked or typed, and what you saw.'
                            : 'What it would do and when you would use it.' ?>"
                        class="<?= $errorClass('details') ?>"
                        <?= $describedBy('details') ?>
                    ><?= $oldValue('details') ?></textarea>

                    <?php $fieldError('details'); ?>
                </div>

                <?php if ($isBug): ?>
                    <div class="form-group">
                        <label for="expected">
                            What did you expect? <span class="feedback-optional">(optional)</span>
                        </label>

                        <textarea
                            id="expected"
                            name="expected"
                            rows="3"
                            maxlength="<?= Validator::FEEDBACK_EXPECTED_MAX ?>"
                            class="<?= $errorClass('expected') ?>"
                            <?= $describedBy('expected') ?>
                        ><?= $oldValue('expected') ?></textarea>

                        <?php $fieldError('expected'); ?>
                    </div>

                    <div class="form-group">
                        <label for="attachment">
                            Pasted text <span class="feedback-optional">(optional)</span>
                        </label>

                        <textarea
                            id="attachment"
                            name="attachment"
                            rows="6"
                            maxlength="<?= Validator::FEEDBACK_ATTACHMENT_MAX ?>"
                            placeholder="e.g. the Showdown team you tried to import"
                            class="feedback-attachment <?= $errorClass('attachment') ?>"
                            spellcheck="false"
                            <?= $describedBy('attachment') ?>
                        ><?= $oldValue('attachment') ?></textarea>

                        <?php $fieldError('attachment'); ?>
                    </div>
                <?php endif; ?>

                <?php if (!$isSignedIn): ?>
                    <div class="form-group">
                        <label for="contact_email">
                            Email <span class="feedback-optional">(optional, only used to ask you follow-up questions)</span>
                        </label>

                        <input
                            type="email"
                            id="contact_email"
                            name="contact_email"
                            maxlength="255"
                            autocomplete="email"
                            value="<?= $oldValue('contact_email') ?>"
                            placeholder="trainer@example.com"
                            class="<?= $errorClass('contact_email') ?>"
                            <?= $describedBy('contact_email') ?>
                        >

                        <?php $fieldError('contact_email'); ?>
                    </div>
                <?php endif; ?>

                <?php
                /*
                 * Honeypot: hidden from people and screen readers, so only
                 * bots fill it in. The controller drops those submissions.
                 */
                ?>
                <div class="feedback-honeypot" aria-hidden="true">
                    <label for="website">Leave this field empty</label>
                    <input type="text" id="website" name="website" tabindex="-1" autocomplete="off">
                </div>

                <button type="submit" class="button button-primary">
                    <?= $isBug ? 'Send Bug Report' : 'Send Suggestion' ?>
                </button>
            </form>
        </section>
    </div>
</main>

<?php require dirname(__DIR__) . '/layouts/footer.php'; ?>
