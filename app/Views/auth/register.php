<?php

declare(strict_types=1);

$pageTitle = $pageTitle ?? 'Register';

require dirname(__DIR__) . '/layouts/header.php';

$errors = $errors ?? [];
$old = $old ?? [];
?>

<link rel="stylesheet" href="/assets/css/auth.css">

<main class="auth-page">
    <div class="auth-background-glow auth-background-glow--left"></div>
    <div class="auth-background-glow auth-background-glow--right"></div>

    <section class="auth-container">
        <div class="auth-brand">
            <a href="/" class="auth-logo" aria-label="Brymon home">
                <span class="auth-logo-icon">B</span>
                <span class="auth-logo-text">Brymon</span>
            </a>

            <span class="auth-eyebrow">BUILD • STRATEGIZE • BATTLE</span>

            <h1>Begin Your Journey</h1>

            <p>
                Create your Brymon account and start building powerful,
                organized Pokémon teams.
            </p>

            <div class="auth-benefits">
                <div class="auth-benefit">
                    <span class="auth-benefit-icon">01</span>

                    <div>
                        <strong>Create custom teams</strong>
                        <span>Build teams around your preferred strategy.</span>
                    </div>
                </div>

                <div class="auth-benefit">
                    <span class="auth-benefit-icon">02</span>

                    <div>
                        <strong>Save and organize</strong>
                        <span>Keep multiple team ideas in one convenient place.</span>
                    </div>
                </div>

                <div class="auth-benefit">
                    <span class="auth-benefit-icon">03</span>

                    <div>
                        <strong>Continue anywhere</strong>
                        <span>Sign back in and pick up where you left off.</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="auth-card-wrapper">
            <section class="auth-card auth-card--register">
                <div class="auth-card-header">
                    <span class="auth-card-badge">CREATE TRAINER PROFILE</span>

                    <h2>Sign Up</h2>

                    <p>Create your account to begin building.</p>
                </div>

                <form method="POST" action="/register" class="auth-form">
                    <div class="form-group">
                        <label for="username">Username</label>

                        <input
                            type="text"
                            id="username"
                            name="username"
                            value="<?= htmlspecialchars(
                                $old['username'] ?? '',
                                ENT_QUOTES,
                                'UTF-8'
                            ) ?>"
                            placeholder="Choose a trainer name"
                            autocomplete="username"
                            class="<?= isset($errors['username'])
                                ? 'input-error'
                                : '' ?>"
                        >

                        <?php if (isset($errors['username'])): ?>
                            <p class="form-error">
                                <?= htmlspecialchars(
                                    $errors['username'],
                                    ENT_QUOTES,
                                    'UTF-8'
                                ) ?>
                            </p>
                        <?php endif; ?>
                    </div>

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

                    <div class="form-row">
                        <div class="form-group">
                            <label for="password">Password</label>

                            <input
                                type="password"
                                id="password"
                                name="password"
                                placeholder="At least 6 characters"
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
                                Confirm password
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
                    </div>

                    <button type="submit" class="auth-submit">
                        Create Account
                    </button>
                </form>

                <div class="auth-divider">
                    <span>Already registered?</span>
                </div>

                <p class="auth-switch">
                    Already have an account?
                    <a href="/login">Sign in</a>
                </p>

                <a href="/" class="auth-home-link">
                    Return to homepage
                </a>
            </section>
        </div>
    </section>
</main>