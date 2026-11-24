<?php

declare(strict_types=1);

use App\Core\RelativeTime;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

final class RelativeTimeTest extends TestCase
{
    /**
     * @return array<string, array{int, string}>
     */
    public static function ages(): array
    {
        return [
            'seconds' => [59, 'now'],
            'one minute' => [60, '1m'],
            'minutes round down' => [59 * 60 + 59, '59m'],
            'one hour' => [3600, '1h'],
            'hours' => [23 * 3600, '23h'],
            'one day' => [86400, '1d'],
            'days' => [6 * 86400, '6d'],
            'one week' => [7 * 86400, '1w'],
            'weeks' => [34 * 86400, '4w'],
        ];
    }

    #[DataProvider('ages')]
    public function testRecentAgesAreShort(int $ageSeconds, string $expected): void
    {
        $this->assertSame(
            $expected,
            RelativeTime::short($ageSeconds, '2026-11-24 12:00:00')
        );
    }

    public function testOlderOnesShowTheDate(): void
    {
        $this->assertSame(
            'Mar 3, 2026',
            RelativeTime::short(35 * 86400, '2026-03-03 09:30:00.123456')
        );
    }
}
