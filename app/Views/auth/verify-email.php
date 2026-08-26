<?php

declare(strict_types=1);

$pageTitle = $pageTitle ?? 'Verify Email';

require dirname(__DIR__) . '/layouts/header.php';

$status = $status ?? 'invalid';
?>

<link rel="stylesheet" href="/assets/css/auth.css">

<main class="auth-page">
    <div class="auth-background-glow auth-background-glow--left"></div>
    <div class="auth-background-glow auth-background-glow--right"></div>

    <section class="auth-container">
        <div class="auth-brand">
            <a href="/" class="auth-logo" aria-label="Brymon home">
                <img
                    src="/images/logo/brymon-stacked.png"
                    alt="Brymon"
                    class="auth-logo-image auth-logo-image--stacked"
                >
            </a>

            <span class="auth-eyebrow">BUILD • STRATEGIZE • BATTLE</span>

            <h1>Email Verification</h1>

            <p>
                Confirming your email address keeps your Brymon account
                secure.
            </p>
        </div>

        <div class="auth-card-wrapper">
            <section class="auth-card">
                <div class="auth-card-header">
                    <span class="auth-card-badge">TRAINER ACCESS</span>

                    <h2>
                        <?= $status === 'expired'
                            ? 'Link Expired'
                            : 'Link Invalid' ?>
                    </h2>

                    <p>
                        <?php if ($status === 'expired'): ?>
                            This verification link has expired.
                        <?php else: ?>
                            This verification link is invalid or has
                            already been used.
                        <?php endif; ?>
                    </p>
                </div>

                <div class="auth-alert" role="alert">
                    <?php if ($status === 'expired'): ?>
                        This link has expired, but you can request a new
                        one below.
                    <?php else: ?>
                        If you already verified your email, you can sign
                        in below. Otherwise, request a new link.
                    <?php endif; ?>
                </div>

                <a href="/resend-verification" class="auth-submit" style="display:block; text-align:center; text-decoration:none;">
                    Get a New Link
                </a>

                <a href="/login" class="auth-home-link">
                    Go to Sign In
                </a>

                <div class="auth-divider">
                    <span>New trainer?</span>
                </div>

                <p class="auth-switch">
                    Don’t have an account?
                    <a href="/register">Create one</a>
                </p>

                <a href="/" class="auth-home-link">
                    Return to homepage
                </a>
            </section>
        </div>
    </section>
</main>

<?php require dirname(__DIR__) . '/layouts/footer.php'; ?>
