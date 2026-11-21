<?php

declare(strict_types=1);

/**
 * Sent to FEEDBACK_EMAIL for each new bug report or suggestion.
 *
 * @var int $feedbackId
 * @var string $label "Bug" or "Suggestion"
 * @var array<string, string> $feedback
 * @var ?string $pageUrl
 * @var ?string $username
 */

$escape = static fn (string $value): string => htmlspecialchars($value, ENT_QUOTES, 'UTF-8');

$from = $username !== null
    ? 'Signed-in player: ' . $username
    : ($feedback['contact_email'] !== ''
        ? 'Guest: ' . $feedback['contact_email']
        : 'Guest (no contact email)');

// Label => text. Empty sections are left out.
$sections = array_filter([
    $label === 'Bug' ? 'What happened' : 'Idea' => $feedback['details'],
    'Expected' => $feedback['expected'],
]);
?>
<!DOCTYPE html>
<html>
<body style="margin:0; padding:0; background:#0e1117; font-family:Arial, Helvetica, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0e1117; padding:32px 0;">
        <tr>
            <td align="center">
                <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#171b24; border-radius:12px; padding:32px;">
                    <tr>
                        <td style="color:#f4c542; font-size:12px; font-weight:bold; letter-spacing:1px; padding-bottom:8px;">
                            NEW <?= $escape(strtoupper($label)) ?> #<?= (int) $feedbackId ?>
                        </td>
                    </tr>
                    <tr>
                        <td style="color:#f5f7fa; font-size:20px; font-weight:bold; line-height:1.4; padding-bottom:16px;">
                            <?= $escape($feedback['summary']) ?>
                        </td>
                    </tr>
                    <tr>
                        <td style="color:#aab2c0; font-size:13px; line-height:1.6; padding-bottom:24px;">
                            <?= $escape($from) ?><br>
                            Page: <?= $escape($pageUrl ?? 'unknown') ?>
                        </td>
                    </tr>

                    <?php foreach ($sections as $heading => $text): ?>
                        <tr>
                            <td style="color:#778195; font-size:12px; font-weight:bold; padding-bottom:6px;">
                                <?= $escape($heading) ?>
                            </td>
                        </tr>
                        <tr>
                            <td style="color:#f5f7fa; font-size:14px; line-height:1.6; padding-bottom:20px;">
                                <?= nl2br($escape($text)) ?>
                            </td>
                        </tr>
                    <?php endforeach; ?>

                    <?php if ($feedback['attachment'] !== ''): ?>
                        <tr>
                            <td style="color:#778195; font-size:12px; font-weight:bold; padding-bottom:6px;">
                                Pasted text
                            </td>
                        </tr>
                        <tr>
                            <td style="padding-bottom:20px;">
                                <pre style="margin:0; padding:12px; background:#0e1117; border-radius:8px; color:#f5f7fa; font-size:12px; line-height:1.5; white-space:pre-wrap; word-break:break-word;"><?= $escape($feedback['attachment']) ?></pre>
                            </td>
                        </tr>
                    <?php endif; ?>

                    <tr>
                        <td style="color:#778195; font-size:12px; line-height:1.5; border-top:1px solid #303848; padding-top:16px;">
                            Saved as feedback #<?= (int) $feedbackId ?> with status "new".
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
