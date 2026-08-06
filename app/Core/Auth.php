<?php

declare(strict_types=1);

namespace App\Core;

final class Auth
{
    private const IDLE_TIMEOUT = 60 * 60; // 60 minutes
    private const ABSOLUTE_TIMEOUT = 8 * 60 * 60; // 8 hours

    public static function check(): bool
    {
        return isset($_SESSION['user_id']);
    }

    public static function id(): ?int
    {
        if (!isset($_SESSION['user_id'])) {
            return null;
        }

        return (int) $_SESSION['user_id'];
    }

    public static function username(): ?string
    {
        return isset($_SESSION['username'])
            ? (string) $_SESSION['username']
            : null;
    }

    public static function email(): ?string
    {
        return isset($_SESSION['email'])
            ? (string) $_SESSION['email']
            : null;
    }

    public static function requireLogin(): void
    {
        if (!self::check()) {
            self::redirectToLogin();
        }

        if (self::sessionHasExpired()) {
            self::destroySession();

            header('Location: /login?expired=1');
            exit;
        }

        self::updateLastActivity();
    }

    public static function guestOnly(): void
    {
        if (!self::check()) {
            return;
        }

        /*
         * An expired session should not prevent the user from
         * visiting the login or registration page.
         */
        if (self::sessionHasExpired()) {
            self::destroySession();

            return;
        }

        self::updateLastActivity();

        header('Location: /dashboard');
        exit;
    }

    public static function destroySession(): void
    {
        $_SESSION = [];

        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();

            setcookie(
                session_name(),
                '',
                [
                    'expires' => time() - 42000,
                    'path' => $params['path'],
                    'domain' => $params['domain'],
                    'secure' => $params['secure'],
                    'httponly' => $params['httponly'],
                    'samesite' => $params['samesite'] ?? 'Lax',
                ]
            );
        }

        if (session_status() === PHP_SESSION_ACTIVE) {
            session_destroy();
        }
    }

    private static function sessionHasExpired(): bool
    {
        if (!self::check()) {
            return false;
        }

        $currentTime = time();

        /*
         * Sessions created before timeout tracking was added may
         * not have these values. Initialize them instead of
         * immediately logging the user out.
         */
        if (!isset($_SESSION['login_time'])) {
            $_SESSION['login_time'] = $currentTime;
        }

        if (!isset($_SESSION['last_activity'])) {
            $_SESSION['last_activity'] = $currentTime;
        }

        $loginTime = (int) $_SESSION['login_time'];
        $lastActivity = (int) $_SESSION['last_activity'];

        $idleExpired =
            ($currentTime - $lastActivity) >= self::IDLE_TIMEOUT;

        $absoluteExpired =
            ($currentTime - $loginTime) >= self::ABSOLUTE_TIMEOUT;

        return $idleExpired || $absoluteExpired;
    }

    private static function updateLastActivity(): void
    {
        $_SESSION['last_activity'] = time();
    }

    private static function redirectToLogin(): never
    {
        header('Location: /login');
        exit;
    }
}