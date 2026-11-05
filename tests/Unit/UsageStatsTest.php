<?php

declare(strict_types=1);

use App\Core\UsageStats;
use PHPUnit\Framework\TestCase;

final class UsageStatsTest extends TestCase
{
    private string $cacheDirectory;

    private int $downloadCount = 0;

    protected function setUp(): void
    {
        $this->cacheDirectory = sys_get_temp_dir()
            . '/brymon-usage-test-' . bin2hex(random_bytes(4));
    }

    protected function tearDown(): void
    {
        foreach (glob($this->cacheDirectory . '/*') ?: [] as $file) {
            unlink($file);
        }

        if (is_dir($this->cacheDirectory)) {
            rmdir($this->cacheDirectory);
        }
    }

    private function usageStats(?callable $download = null): UsageStats
    {
        return new UsageStats(
            $this->cacheDirectory,
            $download ?? function (): string {
                $this->downloadCount++;

                return (string) file_get_contents(
                    __DIR__ . '/../Fixtures/usage-stats-gen9ou.json'
                );
            }
        );
    }

    private static function failingDownload(): callable
    {
        return static function (): string {
            throw new RuntimeException('Network is down.');
        };
    }

    public function testPokemonAreSortedByUsage(): void
    {
        $stats = $this->usageStats()->forFormat('gen9ou');

        $this->assertSame('OU', $stats['formatName']);
        $this->assertSame(608936, $stats['battles']);
        $this->assertSame(
            ['Great Tusk', 'Gholdengo', 'Kingambit'],
            array_column($stats['pokemon'], 'name')
        );
        $this->assertSame(0.3282, $stats['pokemon'][0]['usage']);
    }

    public function testEachListKeepsTheTopSixAndSkipsEmptyMoveSlots(): void
    {
        $greatTusk = $this->usageStats()->forFormat('gen9ou')['pokemon'][0];

        $this->assertCount(6, $greatTusk['moves']);
        $this->assertNotContains('', array_column($greatTusk['moves'], 'name'));
        $this->assertSame(
            ['name' => 'Headlong Rush', 'share' => 0.9387],
            $greatTusk['moves'][0]
        );
    }

    public function testSpreadsAreParsedIntoNatureAndEvs(): void
    {
        $spread = $this->usageStats()->forFormat('gen9ou')['pokemon'][0]['spreads'][0];

        $this->assertSame('Jolly', $spread['nature']);
        $this->assertSame(
            [
                'hp' => 0,
                'attack' => 252,
                'defense' => 4,
                'special-attack' => 0,
                'special-defense' => 0,
                'speed' => 252,
            ],
            $spread['evs']
        );
    }

    public function testFreshCacheIsReusedWithoutDownloading(): void
    {
        $this->usageStats()->forFormat('gen9ou');
        $stats = $this->usageStats()->forFormat('gen9ou');

        $this->assertSame(1, $this->downloadCount);
        $this->assertFalse($stats['stale']);
    }

    public function testExpiredCacheIsRefreshed(): void
    {
        $this->usageStats()->forFormat('gen9ou');
        $this->backdateCache('gen9ou', 2 * 86400);

        $this->usageStats()->forFormat('gen9ou');

        $this->assertSame(2, $this->downloadCount);
    }

    public function testExpiredCacheIsServedWhenTheSourceIsDown(): void
    {
        $this->usageStats()->forFormat('gen9ou');
        $this->backdateCache('gen9ou', 2 * 86400);

        $stats = $this->usageStats(self::failingDownload())->forFormat('gen9ou');

        $this->assertTrue($stats['stale']);
        $this->assertSame('Great Tusk', $stats['pokemon'][0]['name']);
    }

    public function testFailureWithoutACacheThrows(): void
    {
        $this->expectException(RuntimeException::class);

        $this->usageStats(self::failingDownload())->forFormat('gen9ou');
    }

    public function testInvalidJsonFromTheSourceIsTreatedAsAFailure(): void
    {
        $this->expectException(RuntimeException::class);

        $this->usageStats(static fn (): string => '<html>Not JSON</html>')
            ->forFormat('gen9ou');
    }

    public function testOnlyKnownFormatsAreSupported(): void
    {
        $this->assertTrue(UsageStats::isSupported('gen9ou'));
        $this->assertFalse(UsageStats::isSupported('gen9madeup'));
        $this->assertFalse(UsageStats::isSupported('../../etc/passwd'));
    }

    private function backdateCache(string $format, int $seconds): void
    {
        $cacheFile = $this->cacheDirectory . '/usage-' . $format . '.json';

        $cached = json_decode((string) file_get_contents($cacheFile), true);
        $cached['fetchedAt'] -= $seconds;

        file_put_contents($cacheFile, json_encode($cached));
    }
}
