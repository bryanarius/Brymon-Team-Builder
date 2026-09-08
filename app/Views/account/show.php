<?php

declare(strict_types=1);

$pageTitle = $pageTitle ?? 'Account Settings';

require dirname(__DIR__) . '/layouts/header.php';

$username = $username ?? '';
$email = $email ?? '';
$displayName = $displayName ?? null;
$bio = $bio ?? null;
$avatarPokemonId = $avatarPokemonId ?? null;
$usernameErrors = $usernameErrors ?? [];
$passwordErrors = $passwordErrors ?? [];
$profileErrors = $profileErrors ?? [];
$usernameSuccess = $usernameSuccess ?? false;
$passwordSuccess = $passwordSuccess ?? false;
$profileSuccess = $profileSuccess ?? false;

$spriteBase = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/'
    . 'sprites/pokemon/';
?>

<main class="account-page">
    <div class="account-container">
        <div class="account-header">
            <h1>Account Settings</h1>
            <p>Manage your public profile, username, and password.</p>
        </div>

        <section class="account-card">
            <h2>Profile</h2>

            <p class="account-card-hint">
                Shown on your trainer profile at
                <code>/u/<?= htmlspecialchars(
                    $username,
                    ENT_QUOTES,
                    'UTF-8'
                ) ?></code>.
            </p>

            <?php if ($profileSuccess === true): ?>
                <div
                    class="account-alert account-alert--success"
                    role="status"
                >
                    Your profile has been updated.
                </div>
            <?php endif; ?>

            <form method="POST" action="/account/profile" class="account-form">
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
                    <label for="avatar-search">Avatar</label>

                    <div
                        class="avatar-picker"
                        data-current-id="<?= $avatarPokemonId !== null
                            ? (int) $avatarPokemonId
                            : '' ?>"
                    >
                        <img
                            class="avatar-preview"
                            id="avatar-preview"
                            width="72"
                            height="72"
                            alt=""
                            <?php if ($avatarPokemonId !== null): ?>
                            src="<?= htmlspecialchars(
                                $spriteBase . (int) $avatarPokemonId . '.png',
                                ENT_QUOTES,
                                'UTF-8'
                            ) ?>"
                            <?php else: ?>
                            hidden
                            <?php endif; ?>
                        >

                        <div class="avatar-picker-controls">
                            <div class="combobox">
                                <input
                                    type="text"
                                    id="avatar-search"
                                    placeholder="Search a Pokémon"
                                    autocomplete="off"
                                >
                                <ul
                                    class="combobox-list"
                                    role="listbox"
                                    aria-label="Pokémon avatar options"
                                    hidden
                                ></ul>
                            </div>

                            <button
                                type="button"
                                class="button button-secondary avatar-remove"
                                id="avatar-remove"
                            >
                                Remove
                            </button>
                        </div>

                        <input
                            type="hidden"
                            name="avatar_pokemon_id"
                            id="avatar-pokemon-id"
                            value="<?= $avatarPokemonId !== null
                                ? (int) $avatarPokemonId
                                : '' ?>"
                        >
                    </div>

                    <?php if (isset($profileErrors['avatar_pokemon_id'])): ?>
                        <p class="form-error">
                            <?= htmlspecialchars(
                                $profileErrors['avatar_pokemon_id'],
                                ENT_QUOTES,
                                'UTF-8'
                            ) ?>
                        </p>
                    <?php endif; ?>
                </div>

                <div class="form-group">
                    <label for="display_name">Display name</label>

                    <input
                        type="text"
                        id="display_name"
                        name="display_name"
                        maxlength="50"
                        placeholder="<?= htmlspecialchars(
                            $username,
                            ENT_QUOTES,
                            'UTF-8'
                        ) ?>"
                        value="<?= htmlspecialchars(
                            (string) $displayName,
                            ENT_QUOTES,
                            'UTF-8'
                        ) ?>"
                        class="<?= isset($profileErrors['display_name'])
                            ? 'input-error'
                            : '' ?>"
                    >

                    <?php if (isset($profileErrors['display_name'])): ?>
                        <p class="form-error">
                            <?= htmlspecialchars(
                                $profileErrors['display_name'],
                                ENT_QUOTES,
                                'UTF-8'
                            ) ?>
                        </p>
                    <?php endif; ?>
                </div>

                <div class="form-group">
                    <label for="bio">Bio</label>

                    <textarea
                        id="bio"
                        name="bio"
                        rows="3"
                        maxlength="300"
                        placeholder="A short line about your teams."
                        class="<?= isset($profileErrors['bio'])
                            ? 'input-error'
                            : '' ?>"
                    ><?= htmlspecialchars(
                        (string) $bio,
                        ENT_QUOTES,
                        'UTF-8'
                    ) ?></textarea>

                    <?php if (isset($profileErrors['bio'])): ?>
                        <p class="form-error">
                            <?= htmlspecialchars(
                                $profileErrors['bio'],
                                ENT_QUOTES,
                                'UTF-8'
                            ) ?>
                        </p>
                    <?php endif; ?>
                </div>

                <button type="submit" class="button button-primary">
                    Update Profile
                </button>
            </form>
        </section>

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
