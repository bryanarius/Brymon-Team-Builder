<?php

declare(strict_types=1);

/**
 * @var string $username
 * @var string $resetUrl
 */
?>
<!DOCTYPE html>
<html>
<body style="margin:0; padding:0; background:#0e1117; font-family:Arial, Helvetica, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0e1117; padding:32px 0;">
        <tr>
            <td align="center">
                <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#171b24; border-radius:12px; padding:32px;">
                    <tr>
                        <td style="color:#f5f7fa; font-size:20px; font-weight:bold; padding-bottom:16px;">
                            Brymon
                        </td>
                    </tr>
                    <tr>
                        <td style="color:#f5f7fa; font-size:16px; line-height:1.5; padding-bottom:16px;">
                            Hi <?= htmlspecialchars($username, ENT_QUOTES, 'UTF-8') ?>,
                        </td>
                    </tr>
                    <tr>
                        <td style="color:#aab2c0; font-size:14px; line-height:1.6; padding-bottom:24px;">
                            We received a request to reset your Brymon password. Click the button below to choose a new one.
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding-bottom:24px;">
                            <a
                                href="<?= htmlspecialchars($resetUrl, ENT_QUOTES, 'UTF-8') ?>"
                                style="display:inline-block; background:#f4c542; color:#171717; font-weight:bold; text-decoration:none; padding:12px 24px; border-radius:8px; font-size:14px;"
                            >
                                Reset Password
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <td style="color:#778195; font-size:12px; line-height:1.6; padding-bottom:8px;">
                            Or copy and paste this link into your browser:
                        </td>
                    </tr>
                    <tr>
                        <td style="color:#5b8ff3; font-size:12px; word-break:break-all; padding-bottom:24px;">
                            <?= htmlspecialchars($resetUrl, ENT_QUOTES, 'UTF-8') ?>
                        </td>
                    </tr>
                    <tr>
                        <td style="color:#778195; font-size:12px; line-height:1.5; border-top:1px solid #303848; padding-top:16px;">
                            This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email — your password will not be changed.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
