<?php

declare(strict_types=1);

namespace App\Core;

/**
 * Short, Instagram-style ages: "now", "5m", "2h", "3d", "2w", then a date.
 */
final class RelativeTime
{
    private const MINUTE = 60;
    private const HOUR = 60 * self::MINUTE;
    private const DAY = 24 * self::HOUR;
    private const WEEK = 7 * self::DAY;

    /**
     * @param int    $ageSeconds How long ago, from the database's clock.
     * @param string $timestamp  When, for the date shown after 4 weeks.
     */
    public static function short(int $ageSeconds, string $timestamp): string
    {
        return match (true) {
            $ageSeconds < self::MINUTE => 'now',
            $ageSeconds < self::HOUR => intdiv($ageSeconds, self::MINUTE) . 'm',
            $ageSeconds < self::DAY => intdiv($ageSeconds, self::HOUR) . 'h',
            $ageSeconds < self::WEEK => intdiv($ageSeconds, self::DAY) . 'd',
            $ageSeconds < 5 * self::WEEK => intdiv($ageSeconds, self::WEEK) . 'w',
            default => self::date($timestamp),
        };
    }

    // "Mar 3, 2026", or the raw value if it isn't a date.
    private static function date(string $timestamp): string
    {
        $date = date_create_immutable($timestamp);

        return $date !== false ? $date->format('M j, Y') : $timestamp;
    }
}
