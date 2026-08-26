<?php

declare(strict_types=1);

$pageTitle = $pageTitle ?? 'Resend Verification';

require dirname(__DIR__) . '/layouts/header.php';

$errors = $errors ?? [];
$old = $old ?? [];
$sent = $sent ?? false;
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

            <h1>Need a New Link?</h1>

            <p>
                Enter your email and we’ll send a fresh verification link.
            </p>
        </div>

        <div class="auth-card-wrapper">
            <section class="auth-card">
                <div class="auth-card-header">
                    <span class="auth-card-badge">TRAINER ACCESS</span>

                    <h2>Resend Verification</h2>

                    <p>We'll email you a new link to verify your account.</p>
                </div>

                <?php if ($sent === true): ?>
                    <div class="auth-alert auth-alert--success" role="status">
                        If an account exists for that email and still needs
                        verification, we've sent a new verification link.
                    </div>

                    <a href="/login" class="auth-submit" style="display:block; text-align:center; text-decoration:none;">
                        Back to Sign In
                    </a>
                <?php else: ?>
                    <form method="POST" action="/resend-verification" class="auth-form">

                        <input
                            type="hidden"
                            name="csrf_token"
                            value="<?= htmlspecialchars(
                                \App\Core\Csrf::token(),
                                ENT_QUOTES,
                                'UTF-8'
                            ) ?>"
                        >

                        <div class="form-group">
                            <label for="email">Email address</label>

                            <input
                                type="email"
                                id="email"
                                name="email"
                                value="<?= htmlspecialchars(
                                    $old['email'] ?? '',
                                    ENT_QUOTES,
                                    'UTF-8'
                                ) ?>"
                                placeholder="trainer@example.com"
                                autocomplete="email"
                                class="<?= isset($errors['email'])
                                    ? 'input-error'
                                    : '' ?>"
                            >

                            <?php if (isset($errors['email'])): ?>
                                <p class="form-error">
                                    <?= htmlspecialchars(
                                        $errors['email'],
                                        ENT_QUOTES,
                                        'UTF-8'
                                    ) ?>
                                </p>
                            <?php endif; ?>
                        </div>

                        <button type="submit" class="auth-submit">
                            Send New Link
                        </button>
                    </form>
                <?php endif; ?>

                <div class="auth-divider">
                    <span>Remembered it?</span>
                </div>

                <p class="auth-switch">
                    <a href="/login">Back to sign in</a>
                </p>

                <a href="/" class="auth-home-link">
                    Return to homepage
                </a>
            </section>
        </div>
    </section>
</main>

<?php require dirname(__DIR__) . '/layouts/footer.php'; ?>
