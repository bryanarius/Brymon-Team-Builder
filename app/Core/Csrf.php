<?php

declare(strict_types=1);

namespace App\Core;

final class Csrf
{
    private const SESSION_KEY = 'csrf_token';

    public static function token(): string
    {
        if (
            !isset($_SESSION[self::SESSION_KEY])
            || !is_string($_SESSION[self::SESSION_KEY])
        ) {
            $_SESSION[self::SESSION_KEY] = bin2hex(
                random_bytes(32)
            );
        }

        return $_SESSION[self::SESSION_KEY];
    }

    public static function validate(?string $submittedToken): bool
    {
        $sessionToken = $_SESSION[self::SESSION_KEY] ?? null;

        if (
            !is_string($sessionToken)
            || !is_string($submittedToken)
            || $submittedToken === ''
        ) {
            return false;
        }

        return hash_equals(
            $sessionToken,
            $submittedToken
        );
    }

    public static function regenerate(): void
    {
        $_SESSION[self::SESSION_KEY] = bin2hex(
            random_bytes(32)
        );
    }
}