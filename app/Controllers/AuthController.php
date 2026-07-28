<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Validator;
use App\Models\User;

final class AuthController extends Controller
{
    public function showRegister(): void
    {
        $this->view('auth/register', [
            'pageTitle' => 'Register',
        ]);
    }

    public function register(): void 
    {
        $username = trim($_POST['username'] ?? '');
        $email = trim($_POST['email'] ?? '');
        $password = $_POST['password'] ?? '';
        $passwordConfirmation = $_POST['password_confirmation'] ?? '';

        $errors = [];

        if(!Validator::required($username)) {
            $errors['username'] = 'Username is required';
        } elseif (!Validator::minLength($username, 3)){
            $errors['username'] = 'Username must be at least 3 characters';
        } elseif (!Validator::maxLength($username, 50)){
            $errors['username'] = 'Username must be 50 characters or less';
        }

        if(!Validator::required($email)) {
            $errors['email'] = 'Email is required';
        } elseif(!Validator::email($email)) {
            $errors['email'] = 'Must enter a valid email';
        } elseif(!Validator::maxLength($email, 255)) {
            $errors['email'] = "Email must be 255 characters or less";
        }

        if(!Validator::required($password)) {
            $errors['password'] = 'Password is required';
        } elseif(!Validator::minLength($password, 6)) {
            $errors['password'] = 'Password must be at least 6 characters';
        }

        if(!Validator::required($passwordConfirmation)) {
            $errors['password_confirmation'] = 'Please confirm your password';
        } elseif(!Validator::matches($password, $passwordConfirmation)) {
            $errors['password_confirmation'] = 'Passwords do not match';
        }

        $userModel = new User();

        if (!isset($errors['username']) && $userModel->findByUsername($username)) {
            $errors['username'] = 'That username is already taken.';
        }

        if (!isset($errors['email']) && $userModel->findByEmail($email)) {
            $errors['email'] = 'An account with that email already exists.';
        }

         if ($errors !== []) {
            $this->view('auth/register', [
                'pageTitle' => 'Register',
                'errors' => $errors,
                'old' => [
                    'username' => $username,
                    'email' => $email,
                ],
            ]);

            return;
        }

        var_dump([
            'username' => $username,
            'email' => $email,
            'password' => $password,
        ]);

        die();
    }
}