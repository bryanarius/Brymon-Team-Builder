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

        $userModel = new User();
        $user = $userModel->findById(Auth::id());

        $this->view('account/show', [
            'pageTitle' => 'Account Settings',
            'username' => $user['username'],
            'email' => $user['email'],
        ]);
    }

    public function updateUsername(): void
    {
        Auth::requireLogin();

        if (!Csrf::validate($_POST['csrf_token'] ?? null)) {
            http_response_code(403);

            $this->view('errors/403', [
                'pageTitle' => 'Request Denied',
            ]);

            return;
        }

        $userModel = new User();
        $user = $userModel->findById(Auth::id());

        $username = trim($_POST['username'] ?? '');

        $usernameErrors = [];

        if (!Validator::required($username)) {
            $usernameErrors['username'] = 'Username is required.';
        } elseif (!Validator::minLength($username, 3)) {
            $usernameErrors['username'] = 'Username must be at least 3 characters.';
        } elseif (!Validator::maxLength($username, 50)) {
            $usernameErrors['username'] = 'Username must be 50 characters or less.';
        }

        if (!isset($usernameErrors['username'])) {
            $existingUser = $userModel->findByUsername($username);

            if (
                $existingUser !== false
                && (int) $existingUser['id'] !== Auth::id()
            ) {
                $usernameErrors['username'] = 'That username is already taken.';
            }
        }

        if ($usernameErrors !== []) {
            $this->view('account/show', [
                'pageTitle' => 'Account Settings',
                'username' => $username,
                'email' => $user['email'],
                'usernameErrors' => $usernameErrors,
            ]);

            return;
        }

        $userModel->updateUsername(Auth::id(), $username);
        $_SESSION['username'] = $username;

        $this->view('account/show', [
            'pageTitle' => 'Account Settings',
            'username' => $username,
            'email' => $user['email'],
            'usernameSuccess' => true,
        ]);
    }

    public function updatePassword(): void
    {
        Auth::requireLogin();

        if (!Csrf::validate($_POST['csrf_token'] ?? null)) {
            http_response_code(403);

            $this->view('errors/403', [
                'pageTitle' => 'Request Denied',
            ]);

            return;
        }

        $userModel = new User();
        $user = $userModel->findById(Auth::id());

        $currentPassword = $_POST['current_password'] ?? '';
        $newPassword = $_POST['new_password'] ?? '';
        $newPasswordConfirmation = $_POST['new_password_confirmation'] ?? '';

        $passwordErrors = [];

        if (!Validator::required($currentPassword)) {
            $passwordErrors['current_password'] = 'Current password is required.';
        } elseif (!password_verify($currentPassword, $user['password_hash'])) {
            $passwordErrors['current_password'] = 'Current password is incorrect.';
        }

        if (!Validator::required($newPassword)) {
            $passwordErrors['new_password'] = 'New password is required.';
        } elseif (!Validator::minLength($newPassword, 8)) {
            $passwordErrors['new_password'] = 'Password must be at least 8 characters.';
        }

        if (!Validator::required($newPasswordConfirmation)) {
            $passwordErrors['new_password_confirmation'] = 'Please confirm your new password.';
        } elseif (!Validator::matches($newPassword, $newPasswordConfirmation)) {
            $passwordErrors['new_password_confirmation'] = 'Passwords do not match.';
        }

        if ($passwordErrors !== []) {
            $this->view('account/show', [
                'pageTitle' => 'Account Settings',
                'username' => $user['username'],
                'email' => $user['email'],
                'passwordErrors' => $passwordErrors,
            ]);

            return;
        }

        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

        $userModel->updatePassword(Auth::id(), $hashedPassword);

        $this->view('account/show', [
            'pageTitle' => 'Account Settings',
            'username' => $user['username'],
            'email' => $user['email'],
            'passwordSuccess' => true,
        ]);
    }
}
