<?php

declare(strict_types=1);

$pageTitle = $pageTitle ?? 'Reset Password';

require dirname(__DIR__) . '/layouts/header.php';

$errors = $errors ?? [];
$invalid = $invalid ?? false;
$token = $token ?? null;
?>


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

            <h1>Choose a New Password</h1>

            <p>
                Pick a new password to get back into your Brymon account.
            </p>
        </div>

        <div class="auth-card-wrapper">
            <section class="auth-card">
                <div class="auth-card-header">
                    <span class="auth-card-badge">ACCOUNT RECOVERY</span>

                    <h2>Reset Password</h2>

                    <p>Enter and confirm your new password.</p>
                </div>

                <?php if ($invalid === true): ?>
                    <div class="auth-alert" role="alert">
                        This reset link is invalid or has expired.
                    </div>

                    <a href="/forgot-password" class="auth-submit" style="display:block; text-align:center; text-decoration:none;">
                        Request a New Link
                    </a>
                <?php else: ?>
                    <?php if (isset($errors['reset'])): ?>
                        <div class="auth-alert" role="alert">
                            <?= htmlspecialchars(
                                $errors['reset'],
                                ENT_QUOTES,
                                'UTF-8'
                            ) ?>
                        </div>
                    <?php endif; ?>

                    <form
                        method="POST"
                        action="/reset-password/<?= htmlspecialchars(
                            (string) $token,
                            ENT_QUOTES,
                            'UTF-8'
                        ) ?>"
                        class="auth-form"
                    >

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
                            <label for="password">New password</label>

                            <input
                                type="password"
                                id="password"
                                name="password"
                                placeholder="At least 8 characters"
                                autocomplete="new-password"
                                class="<?= isset($errors['password'])
                                    ? 'input-error'
                                    : '' ?>"
                            >

                            <?php if (isset($errors['password'])): ?>
                                <p class="form-error">
                                    <?= htmlspecialchars(
                                        $errors['password'],
                                        ENT_QUOTES,
                                        'UTF-8'
                                    ) ?>
                                </p>
                            <?php endif; ?>
                        </div>

                        <div class="form-group">
                            <label for="password_confirmation">
                                Confirm new password
                            </label>

                            <input
                                type="password"
                                id="password_confirmation"
                                name="password_confirmation"
                                placeholder="Repeat password"
                                autocomplete="new-password"
                                class="<?= isset(
                                    $errors['password_confirmation']
                                )
                                    ? 'input-error'
                                    : '' ?>"
                            >

                            <?php if (
                                isset($errors['password_confirmation'])
                            ): ?>
                                <p class="form-error">
                                    <?= htmlspecialchars(
                                        $errors['password_confirmation'],
                                        ENT_QUOTES,
                                        'UTF-8'
                                    ) ?>
                                </p>
                            <?php endif; ?>
                        </div>

                        <button type="submit" class="auth-submit">
                            Reset Password
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
