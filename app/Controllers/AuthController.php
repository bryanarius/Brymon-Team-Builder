<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Config;
use App\Core\Controller;
use App\Core\Csrf;
use App\Core\Mailer;
use App\Core\Validator;
use App\Models\User;
use Throwable;

final class AuthController extends Controller
{
    public function showRegister(): void
    {
        Auth::guestOnly();

        $this->view('auth/register', [
            'pageTitle' => 'Register',
        ]);
    }

    public function register(): void
    {
        Auth::guestOnly();

        if (!Csrf::validate($_POST['csrf_token'] ?? null)) {
            http_response_code(403);

            $this->view('errors/403', [
                'pageTitle' => 'Request Denied',
            ]);

            return;
        }

        $username = trim($_POST['username'] ?? '');
        $email = strtolower(trim($_POST['email'] ?? ''));
        $password = $_POST['password'] ?? '';
        $passwordConfirmation = $_POST['password_confirmation'] ?? '';

        $errors = [];

        if (!Validator::required($username)) {
            $errors['username'] = 'Username is required.';
        } elseif (!Validator::minLength($username, 3)) {
            $errors['username'] = 'Username must be at least 3 characters.';
        } elseif (!Validator::maxLength($username, 50)) {
            $errors['username'] = 'Username must be 50 characters or less.';
        }

        if (!Validator::required($email)) {
            $errors['email'] = 'Email is required.';
        } elseif (!Validator::email($email)) {
            $errors['email'] = 'Please enter a valid email.';
        } elseif (!Validator::maxLength($email, 255)) {
            $errors['email'] = 'Email must be 255 characters or less.';
        }

        if (!Validator::required($password)) {
            $errors['password'] = 'Password is required.';
        } elseif (!Validator::minLength($password, 8)) {
            $errors['password'] = 'Password must be at least 8 characters.';
        }

        if (!Validator::required($passwordConfirmation)) {
            $errors['password_confirmation'] = 'Please confirm your password.';
        } elseif (!Validator::matches($password, $passwordConfirmation)) {
            $errors['password_confirmation'] = 'Passwords do not match.';
        }

        $userModel = new User();

        if (
            !isset($errors['username'])
            && $userModel->findByUsername($username) !== false
        ) {
            $errors['username'] = 'That username is already taken.';
        }

        if (
            !isset($errors['email'])
            && $userModel->findByEmail($email) !== false
        ) {
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

        try {
            $hashedPassword = password_hash(
                $password,
                PASSWORD_DEFAULT
            );

            if ($hashedPassword === false) {
                throw new \RuntimeException(
                    'Password hashing failed.'
                );
            }

            $userId = $userModel->create(
                $username,
                $email,
                $hashedPassword
            );

            if ($userId === false) {
                throw new \RuntimeException(
                    'User model failed to create an account.'
                );
            }

            $verificationToken = $userModel->generateEmailVerificationToken(
                $userId
            );

            if ($verificationToken === false) {
                throw new \RuntimeException(
                    'Failed to generate an email verification token.'
                );
            }

            $verificationUrl = rtrim(
                (string) Config::get('APP_URL', ''),
                '/'
            ) . '/verify-email/' . $verificationToken;

            $emailHtml = Mailer::render('email-verification', [
                'username' => $username,
                'verificationUrl' => $verificationUrl,
            ]);

            if (!Mailer::send($email, 'Verify your Brymon account', $emailHtml)) {
                error_log(
                    'Failed to send verification email to user id ' . $userId
                );
            }
        } catch (Throwable $exception) {
            error_log((string) $exception);

            $this->view('auth/register', [
                'pageTitle' => 'Register',
                'errors' => [
                    'register' =>
                        'We could not create your account. Please try again.',
                ],
                'old' => [
                    'username' => $username,
                    'email' => $email,
                ],
            ]);

            return;
        }

        header('Location: /login?registered=1');
        exit;
    }

    public function verifyEmail(string $token): void
    {
        $userModel = new User();

        $tokenHash = hash('sha256', $token);
        $user = $userModel->findByEmailVerificationTokenHash($tokenHash);

        if ($user === false) {
            $this->view('auth/verify-email', [
                'pageTitle' => 'Verify Email',
                'status' => 'invalid',
            ]);

            return;
        }

        if ($this->isExpired($user['email_verification_expires_at'])) {
            $this->view('auth/verify-email', [
                'pageTitle' => 'Verify Email',
                'status' => 'expired',
            ]);

            return;
        }

        $userModel->markEmailVerified((int) $user['id']);

        header('Location: /login?verified=1');
        exit;
    }

    public function showLogin(): void
    {
        Auth::guestOnly();

        $notice = match (true) {
            isset($_GET['registered']) =>
                'Account created! Please check your email to verify '
                    . 'your address before signing in.',
            isset($_GET['verified']) =>
                'Your email has been verified. You can now sign in.',
            isset($_GET['reset']) =>
                'Your password has been reset. You can now sign in.',
            default => null,
        };

        $this->view('auth/login', [
            'pageTitle' => 'Login',
            'notice' => $notice,
        ]);
    }

    public function login(): void
    {
        Auth::guestOnly();

        if (!Csrf::validate($_POST['csrf_token'] ?? null)) {
            http_response_code(403);

            $this->view('errors/403', [
                'pageTitle' => 'Request Denied',
            ]);

            return;
        }

        $email = strtolower(trim($_POST['email'] ?? ''));
        $password = $_POST['password'] ?? '';

        $errors = [];

        if (!Validator::required($email)) {
            $errors['email'] = 'Email is required.';
        } elseif (!Validator::email($email)) {
            $errors['email'] = 'Please enter a valid email.';
        }

        if (!Validator::required($password)) {
            $errors['password'] = 'Password is required.';
        }

        $user = false;

        if ($errors === []) {
            $userModel = new User();
            $user = $userModel->findByEmail($email);

            if (
                $user === false
                || !password_verify(
                    $password,
                    $user['password_hash']
                )
            ) {
                $errors['login'] = 'Invalid email or password.';
            } elseif ($user['email_verified_at'] === null) {
                $errors['login'] =
                    'Please verify your email address before signing in. '
                    . 'Check your inbox for the verification link.';
            }
        }

        if ($errors !== []) {
            $this->view('auth/login', [
                'pageTitle' => 'Login',
                'errors' => $errors,
                'old' => [
                    'email' => $email,
                ],
            ]);

            return;
        }

        session_regenerate_id(true);
        Csrf::regenerate();
        $currentTime = time();

        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['email'] = $user['email'];
        $_SESSION['login_time'] = $currentTime;
        $_SESSION['last_activity'] = $currentTime;

        header('Location: /');
        exit;
    }

    public function logout(): void
    {
        Auth::requireLogin();

        if (!Csrf::validate($_POST['csrf_token'] ?? null)) {
            http_response_code(403);

            $this->view('errors/403', [
                'pageTitle' => 'Request Denied',
            ]);

            return;
        }

        Auth::destroySession();

        header('Location: /');
        exit;
    }

    public function showForgotPassword(): void
    {
        Auth::guestOnly();

        $this->view('auth/forgot-password', [
            'pageTitle' => 'Forgot Password',
        ]);
    }

    public function forgotPassword(): void
    {
        Auth::guestOnly();

        if (!Csrf::validate($_POST['csrf_token'] ?? null)) {
            http_response_code(403);

            $this->view('errors/403', [
                'pageTitle' => 'Request Denied',
            ]);

            return;
        }

        $email = strtolower(trim($_POST['email'] ?? ''));

        $errors = [];

        if (!Validator::required($email)) {
            $errors['email'] = 'Email is required.';
        } elseif (!Validator::email($email)) {
            $errors['email'] = 'Please enter a valid email.';
        }

        if ($errors !== []) {
            $this->view('auth/forgot-password', [
                'pageTitle' => 'Forgot Password',
                'errors' => $errors,
                'old' => [
                    'email' => $email,
                ],
            ]);

            return;
        }

        $userModel = new User();
        $user = $userModel->findByEmail($email);

        if ($user !== false) {
            $resetToken = $userModel->generatePasswordResetToken(
                (int) $user['id']
            );

            if ($resetToken !== false) {
                $resetUrl = rtrim(
                    (string) Config::get('APP_URL', ''),
                    '/'
                ) . '/reset-password/' . $resetToken;

                $emailHtml = Mailer::render('password-reset', [
                    'username' => $user['username'],
                    'resetUrl' => $resetUrl,
                ]);

                if (
                    !Mailer::send(
                        $email,
                        'Reset your Brymon password',
                        $emailHtml
                    )
                ) {
                    error_log(
                        'Failed to send password reset email to user id '
                            . $user['id']
                    );
                }
            } else {
                error_log(
                    'Failed to generate password reset token for user id '
                        . $user['id']
                );
            }
        }

        $this->view('auth/forgot-password', [
            'pageTitle' => 'Forgot Password',
            'sent' => true,
        ]);
    }

    public function showResetPassword(string $token): void
    {
        Auth::guestOnly();

        $userModel = new User();
        $tokenHash = hash('sha256', $token);
        $user = $userModel->findByPasswordResetTokenHash($tokenHash);

        if (
            $user === false
            || $this->isExpired($user['password_reset_expires_at'])
        ) {
            $this->view('auth/reset-password', [
                'pageTitle' => 'Reset Password',
                'invalid' => true,
            ]);

            return;
        }

        $this->view('auth/reset-password', [
            'pageTitle' => 'Reset Password',
            'token' => $token,
        ]);
    }

    public function resetPassword(string $token): void
    {
        Auth::guestOnly();

        if (!Csrf::validate($_POST['csrf_token'] ?? null)) {
            http_response_code(403);

            $this->view('errors/403', [
                'pageTitle' => 'Request Denied',
            ]);

            return;
        }

        $userModel = new User();
        $tokenHash = hash('sha256', $token);
        $user = $userModel->findByPasswordResetTokenHash($tokenHash);

        if (
            $user === false
            || $this->isExpired($user['password_reset_expires_at'])
        ) {
            $this->view('auth/reset-password', [
                'pageTitle' => 'Reset Password',
                'invalid' => true,
            ]);

            return;
        }

        $password = $_POST['password'] ?? '';
        $passwordConfirmation = $_POST['password_confirmation'] ?? '';

        $errors = [];

        if (!Validator::required($password)) {
            $errors['password'] = 'Password is required.';
        } elseif (!Validator::minLength($password, 8)) {
            $errors['password'] = 'Password must be at least 8 characters.';
        }

        if (!Validator::required($passwordConfirmation)) {
            $errors['password_confirmation'] = 'Please confirm your password.';
        } elseif (!Validator::matches($password, $passwordConfirmation)) {
            $errors['password_confirmation'] = 'Passwords do not match.';
        }

        if ($errors !== []) {
            $this->view('auth/reset-password', [
                'pageTitle' => 'Reset Password',
                'token' => $token,
                'errors' => $errors,
            ]);

            return;
        }

        try {
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

            if ($hashedPassword === false) {
                throw new \RuntimeException('Password hashing failed.');
            }

            $userModel->resetPassword((int) $user['id'], $hashedPassword);
        } catch (Throwable $exception) {
            error_log((string) $exception);

            $this->view('auth/reset-password', [
                'pageTitle' => 'Reset Password',
                'token' => $token,
                'errors' => [
                    'reset' =>
                        'We could not reset your password. Please try again.',
                ],
            ]);

            return;
        }

        header('Location: /login?reset=1');
        exit;
    }

    private function isExpired(?string $expiresAt): bool
    {
        if ($expiresAt === null) {
            return true;
        }

        $expiresAtTimestamp = strtotime($expiresAt);

        return $expiresAtTimestamp === false || $expiresAtTimestamp < time();
    }
}