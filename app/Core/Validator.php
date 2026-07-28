<?php

declare(strict_types=1);

namespace App\Core;

class Validator
{
    public static function required(?string $value): bool
    {
        return trim((string) $value) !== '';
    }

    public static function email(string $email): bool
    {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }

    public static function minLength(string $value, int $length): bool
    {
        return mb_strlen(trim($value)) >= $length;
    }

    public static function maxLength(string $value, int $length): bool
    {
        return mb_strlen(trim($value)) <= $length;
    }

    public static function matches(string $value, string $comparison): bool
    {
        return $value === $comparison;
    }
}