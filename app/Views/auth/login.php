<?php

declare(strict_types=1);

$pageTitle = $pageTitle ?? 'Login';

require dirname(__DIR__) . '/layouts/header.php';

$errors = $errors ?? [];
$old = $old ?? [];
$notice = $notice ?? null;
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

            <h1>Welcome Back, Trainer</h1>

            <p>
                Sign in to continue building, organizing, and improving
                your Pokémon teams.
            </p>

            <div class="auth-benefits">
                <div class="auth-benefit">
                    <span class="auth-benefit-icon">01</span>

                    <div>
                        <strong>Build your team</strong>
                        <span>Create balanced teams with your favorite Pokémon.</span>
                    </div>
                </div>

                <div class="auth-benefit">
                    <span class="auth-benefit-icon">02</span>

                    <div>
                        <strong>Save your progress</strong>
                        <span>Return to your saved teams whenever you are ready.</span>
                    </div>
                </div>

                <div class="auth-benefit">
                    <span class="auth-benefit-icon">03</span>

                    <div>
                        <strong>Prepare for battle</strong>
                        <span>Keep your teams organized and battle ready.</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="auth-card-wrapper">
            <section class="auth-card">
                <div class="auth-card-header">
                    <span class="auth-card-badge">TRAINER ACCESS</span>

                    <h2>Sign In</h2>

                    <p>Enter your account details to continue.</p>
                </div>

                <?php if ($notice !== null): ?>
                    <div class="auth-alert auth-alert--success" role="status">
                        <?= htmlspecialchars(
                            $notice,
                            ENT_QUOTES,
                            'UTF-8'
                        ) ?>
                    </div>
                <?php endif; ?>

                <?php if (isset($errors['login'])): ?>
                    <div class="auth-alert" role="alert">
                        <?= htmlspecialchars(
                            $errors['login'],
                            ENT_QUOTES,
                            'UTF-8'
                        ) ?>
                    </div>
                <?php endif; ?>

                <form method="POST" action="/login" class="auth-form">

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

                    <div class="form-group">
                        <label for="password">Password</label>

                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Enter your password"
                            autocomplete="current-password"
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

                    <button type="submit" class="auth-submit">
                        Sign In
                    </button>
                </form>

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