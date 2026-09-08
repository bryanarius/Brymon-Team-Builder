<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Controller;
use App\Core\Csrf;
use App\Core\Validator;
use App\Models\User;

final class AccountController extends Controller
{
    public function show(): void
    {
        Auth::requireLogin();

        $this->accountView();
    }

    public function updateProfile(): void
    {
        Auth::requireLogin();

        if (!$this->csrfValid()) {
            return;
        }

        $displayName = trim($_POST['display_name'] ?? '');
        $bio = trim($_POST['bio'] ?? '');
        $avatarRaw = trim($_POST['avatar_pokemon_id'] ?? '');

        $profileErrors = [];

        if ($displayName !== '' && !Validator::maxLength($displayName, 50)) {
            $profileErrors['display_name'] =
                'Display name must be 50 characters or less.';
        }

        if ($bio !== '' && mb_strlen($bio) > 300) {
            $profileErrors['bio'] = 'Bio must be 300 characters or less.';
        }

        $avatarPokemonId = null;

        if ($avatarRaw !== '') {
            $parsed = filter_var(
                $avatarRaw,
                FILTER_VALIDATE_INT,
                ['options' => ['min_range' => 1, 'max_range' => 1025]]
            );

            if ($parsed === false) {
                $profileErrors['avatar_pokemon_id'] =
                    'Choose a valid Pokémon for your avatar.';
            } else {
                $avatarPokemonId = $parsed;
            }
        }

        if ($profileErrors !== []) {
            $this->accountView([
                'displayName' => $displayName === '' ? null : $displayName,
                'bio' => $bio === '' ? null : $bio,
                'avatarPokemonId' => $avatarPokemonId,
                'profileErrors' => $profileErrors,
            ]);

            return;
        }

        (new User())->updateProfile(
            Auth::id(),
            $displayName === '' ? null : $displayName,
            $bio === '' ? null : $bio,
            $avatarPokemonId
        );

        $this->accountView(['profileSuccess' => true]);
    }

    public function updateUsername(): void
    {
        Auth::requireLogin();

        if (!$this->csrfValid()) {
            return;
        }

        $username = trim($_POST['username'] ?? '');

        $usernameErrors = [];

        if (!Validator::required($username)) {
            $usernameErrors['username'] = 'Username is required.';
        } elseif (!Validator::minLength($username, 3)) {
            $usernameErrors['username'] =
                'Username must be at least 3 characters.';
        } elseif (!Validator::maxLength($username, 50)) {
            $usernameErrors['username'] =
                'Username must be 50 characters or less.';
        }

        if (!isset($usernameErrors['username'])) {
            $existingUser = (new User())->findByUsername($username);

            if (
                $existingUser !== false
                && (int) $existingUser['id'] !== Auth::id()
            ) {
                $usernameErrors['username'] = 'That username is already taken.';
            }
        }

        if ($usernameErrors !== []) {
            $this->accountView([
                'username' => $username,
                'usernameErrors' => $usernameErrors,
            ]);

            return;
        }

        (new User())->updateUsername(Auth::id(), $username);
        $_SESSION['username'] = $username;

        $this->accountView(['usernameSuccess' => true]);
    }

    public function updatePassword(): void
    {
        Auth::requireLogin();

        if (!$this->csrfValid()) {
            return;
        }

        $user = (new User())->findById(Auth::id());

        $currentPassword = $_POST['current_password'] ?? '';
        $newPassword = $_POST['new_password'] ?? '';
        $newPasswordConfirmation = $_POST['new_password_confirmation'] ?? '';

        $passwordErrors = [];

        if (!Validator::required($currentPassword)) {
            $passwordErrors['current_password'] =
                'Current password is required.';
        } elseif (
            !password_verify($currentPassword, $user['password_hash'])
        ) {
            $passwordErrors['current_password'] =
                'Current password is incorrect.';
        }

        if (!Validator::required($newPassword)) {
            $passwordErrors['new_password'] = 'New password is required.';
        } elseif (!Validator::minLength($newPassword, 8)) {
            $passwordErrors['new_password'] =
                'Password must be at least 8 characters.';
        }

        if (!Validator::required($newPasswordConfirmation)) {
            $passwordErrors['new_password_confirmation'] =
                'Please confirm your new password.';
        } elseif (
            !Validator::matches($newPassword, $newPasswordConfirmation)
        ) {
            $passwordErrors['new_password_confirmation'] =
                'Passwords do not match.';
        }

        if ($passwordErrors !== []) {
            $this->accountView(['passwordErrors' => $passwordErrors]);

            return;
        }

        (new User())->updatePassword(
            Auth::id(),
            password_hash($newPassword, PASSWORD_DEFAULT)
        );

        $this->accountView(['passwordSuccess' => true]);
    }

    private function csrfValid(): bool
    {
        if (Csrf::validate($_POST['csrf_token'] ?? null)) {
            return true;
        }

        http_response_code(403);

        $this->view('errors/403', [
            'pageTitle' => 'Request Denied',
        ]);

        return false;
    }

    /**
     * @param array<string, mixed> $data
     */
    private function accountView(array $data = []): void
    {
        $user = (new User())->findById(Auth::id());

        $this->view('account/show', array_merge([
            'pageTitle' => 'Account Settings',
            'username' => $user['username'],
            'email' => $user['email'],
            'displayName' => $user['display_name'],
            'bio' => $user['bio'],
            'avatarPokemonId' => $user['avatar_pokemon_id'],
        ], $data));
    }
}
