<?php

declare(strict_types=1);

$pageTitle = $pageTitle ?? 'Account Settings';

require dirname(__DIR__) . '/layouts/header.php';

$username = $username ?? '';
$email = $email ?? '';
$usernameErrors = $usernameErrors ?? [];
$passwordErrors = $passwordErrors ?? [];
$usernameSuccess = $usernameSuccess ?? false;
$passwordSuccess = $passwordSuccess ?? false;
?>

<main class="account-page">
    <div class="account-container">
        <div class="account-header">
            <h1>Account Settings</h1>
            <p>Manage your username and password.</p>
        </div>

        <section class="account-card">
            <h2>Username</h2>

            <?php if ($usernameSuccess === true): ?>
                <div class="account-alert account-alert--success" role="status">
                    Your username has been updated.
                </div>
            <?php endif; ?>

            <?php if (isset($usernameErrors['username'])): ?>
                <div class="account-alert" role="alert">
                    <?= htmlspecialchars(
                        $usernameErrors['username'],
                        ENT_QUOTES,
                        'UTF-8'
                    ) ?>
                </div>
            <?php endif; ?>

            <form method="POST" action="/account/username" class="account-form">
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
                    <label for="username">Username</label>

                    <input
                        type="text"
                        id="username"
                        name="username"
                        value="<?= htmlspecialchars(
                            $username,
                            ENT_QUOTES,
                            'UTF-8'
                        ) ?>"
                        autocomplete="username"
                        class="<?= isset($usernameErrors['username'])
                            ? 'input-error'
                            : '' ?>"
                    >
                </div>

                <div class="form-group">
                    <label>Email address</label>
                    <input
                        type="email"
                        value="<?= htmlspecialchars(
                            $email,
                            ENT_QUOTES,
                            'UTF-8'
                        ) ?>"
                        disabled
                    >
                </div>

                <button type="submit" class="button button-primary">
                    Update Username
                </button>
            </form>
        </section>

        <section class="account-card">
            <h2>Password</h2>

            <?php if ($passwordSuccess === true): ?>
                <div class="account-alert account-alert--success" role="status">
                    Your password has been updated.
                </div>
            <?php endif; ?>

            <form method="POST" action="/account/password" class="account-form">
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
                    <label for="current_password">Current password</label>

                    <input
                        type="password"
                        id="current_password"
                        name="current_password"
                        autocomplete="current-password"
                        class="<?= isset($passwordErrors['current_password'])
                            ? 'input-error'
                            : '' ?>"
                    >

                    <?php if (isset($passwordErrors['current_password'])): ?>
                        <p class="form-error">
                            <?= htmlspecialchars(
                                $passwordErrors['current_password'],
                                ENT_QUOTES,
                                'UTF-8'
                            ) ?>
                        </p>
                    <?php endif; ?>
                </div>

                <div class="form-group">
                    <label for="new_password">New password</label>

                    <input
                        type="password"
                        id="new_password"
                        name="new_password"
                        placeholder="At least 8 characters"
                        autocomplete="new-password"
                        class="<?= isset($passwordErrors['new_password'])
                            ? 'input-error'
                            : '' ?>"
                    >

                    <?php if (isset($passwordErrors['new_password'])): ?>
                        <p class="form-error">
                            <?= htmlspecialchars(
                                $passwordErrors['new_password'],
                                ENT_QUOTES,
                                'UTF-8'
                            ) ?>
                        </p>
                    <?php endif; ?>
                </div>

                <div class="form-group">
                    <label for="new_password_confirmation">
                        Confirm new password
                    </label>

                    <input
                        type="password"
                        id="new_password_confirmation"
                        name="new_password_confirmation"
                        placeholder="Repeat new password"
                        autocomplete="new-password"
                        class="<?= isset(
                            $passwordErrors['new_password_confirmation']
                        )
                            ? 'input-error'
                            : '' ?>"
                    >

                    <?php if (
                        isset($passwordErrors['new_password_confirmation'])
                    ): ?>
                        <p class="form-error">
                            <?= htmlspecialchars(
                                $passwordErrors['new_password_confirmation'],
                                ENT_QUOTES,
                                'UTF-8'
                            ) ?>
                        </p>
                    <?php endif; ?>
                </div>

                <button type="submit" class="button button-primary">
                    Update Password
                </button>
            </form>
        </section>
    </div>
</main>

<?php require dirname(__DIR__) . '/layouts/footer.php'; ?>
