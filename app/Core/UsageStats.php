<?php

declare(strict_types=1);

namespace App\Core;

/**
 * Smogon usage statistics (from Pokémon Showdown battles), via the
 * pkmn.github.io JSON mirror.
 *
 * A format's source file is ~3 MB and covers every Pokémon used in it, so
 * this trims it to what the app shows and caches the result on disk. The
 * stats are published monthly, so the cache is refreshed at most daily; if
 * the source is unreachable, the last cached copy is served instead.
 */
final class UsageStats
{
    // Supported formats: source file name => display name.
    public const FORMATS = [
        'gen9ou' => 'OU',
        'gen9ubers' => 'Ubers',
        'gen9uu' => 'UU',
        'gen9ru' => 'RU',
        'gen9nu' => 'NU',
        'gen9pu' => 'PU',
        'gen9nationaldex' => 'National Dex',
        'gen9doublesou' => 'Doubles OU',
        'gen9vgc2026' => 'VGC 2026',
    ];

    private const SOURCE_URL = 'https://pkmn.github.io/smogon/data/stats/%s.json';

    private const CACHE_TTL_SECONDS = 86400;

    private const TOP_POKEMON = 100;

    // How many moves, items, etc. to keep per Pokémon.
    private const TOP_ENTRIES = 6;

    private const STAT_KEYS = [
        'hp',
        'attack',
        'defense',
        'special-attack',
        'special-defense',
        'speed',
    ];

    /** @var callable(string): string */
    private $download;

    /**
     * @param callable(string): string|null $download Fetches a URL's body;
     *     replaceable so tests don't hit the network.
     */
    public function __construct(
        private readonly string $cacheDirectory,
        ?callable $download = null
    ) {
        $this->download = $download ?? self::downloadFromSource(...);
    }

    public static function isSupported(string $format): bool
    {
        return isset(self::FORMATS[$format]);
    }

    /**
     * @return array<string, mixed>
     *
     * @throws \RuntimeException When the stats can't be fetched and no
     *     cached copy exists.
     */
    public function forFormat(string $format): array
    {
        if (!self::isSupported($format)) {
            throw new \InvalidArgumentException(
                sprintf('Unsupported usage stats format "%s".', $format)
            );
        }

        $cacheFile = $this->cacheDirectory . '/usage-' . $format . '.json';
        $cached = $this->readCache($cacheFile);

        if (
            $cached !== null
            && $cached['fetchedAt'] > time() - self::CACHE_TTL_SECONDS
        ) {
            return $cached + ['stale' => false];
        }

        try {
            $body = ($this->download)(sprintf(self::SOURCE_URL, $format));

            $stats = self::trim(
                json_decode($body, true, 512, JSON_THROW_ON_ERROR),
                $format
            );
        } catch (\Throwable $exception) {
            error_log(sprintf(
                'UsageStats: unable to refresh %s: %s',
                $format,
                $exception->getMessage()
            ));

            if ($cached !== null) {
                return $cached + ['stale' => true];
            }

            throw new \RuntimeException(
                'Usage stats are unavailable.',
                0,
                $exception
            );
        }

        $this->writeCache($cacheFile, $stats);

        return $stats + ['stale' => false];
    }

    /**
     * Reduces a pkmn.github.io stats file to the top Pokémon by weighted
     * usage, each with its most common sets.
     *
     * @param array<string, mixed> $raw
     *
     * @return array<string, mixed>
     */
    public static function trim(array $raw, string $format): array
    {
        $pokemon = [];

        foreach ($raw['pokemon'] ?? [] as $name => $entry) {
            $pokemon[] = [
                'name' => (string) $name,
                'usage' => (float) ($entry['usage']['weighted'] ?? 0),
                'abilities' => self::topEntries($entry['abilities'] ?? []),
                'items' => self::topEntries($entry['items'] ?? []),
                'moves' => self::topEntries($entry['moves'] ?? []),
                'teraTypes' => self::topEntries($entry['teraTypes'] ?? []),
                'teammates' => self::topEntries($entry['teammates'] ?? []),
                'spreads' => array_map(
                    static fn (array $spread): array =>
                        self::parseSpread($spread['name']) + [
                            'share' => $spread['share'],
                        ],
                    self::topEntries($entry['spreads'] ?? [])
                ),
            ];
        }

        usort(
            $pokemon,
            static fn (array $first, array $second): int =>
                $second['usage'] <=> $first['usage']
        );

        return [
            'format' => $format,
            'formatName' => self::FORMATS[$format] ?? $format,
            'battles' => (int) ($raw['battles'] ?? 0),
            'fetchedAt' => time(),
            'pokemon' => array_slice($pokemon, 0, self::TOP_POKEMON),
        ];
    }

    /**
     * @param array<string, float> $shares Name => share (0-1).
     *
     * @return list<array{name: string, share: float}>
     */
    private static function topEntries(array $shares): array
    {
        // Empty names are unused move slots in Smogon's data.
        unset($shares['']);

        arsort($shares);

        $entries = [];

        foreach (array_slice($shares, 0, self::TOP_ENTRIES, true) as $name => $share) {
            $entries[] = [
                'name' => (string) $name,
                'share' => (float) $share,
            ];
        }

        return $entries;
    }

    /**
     * "Jolly:0/252/4/0/0/252" -> nature + EVs keyed like the rest of the app.
     *
     * @return array{nature: string, evs: array<string, int>}
     */
    private static function parseSpread(string $spread): array
    {
        [$nature, $evs] = array_pad(explode(':', $spread, 2), 2, '');

        $values = array_map('intval', explode('/', $evs));

        return [
            'nature' => $nature,
            'evs' => array_combine(
                self::STAT_KEYS,
                array_pad(array_slice($values, 0, 6), 6, 0)
            ),
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    private function readCache(string $cacheFile): ?array
    {
        if (!is_file($cacheFile)) {
            return null;
        }

        $contents = file_get_contents($cacheFile);

        if ($contents === false) {
            return null;
        }

        $cached = json_decode($contents, true);

        return is_array($cached) && isset($cached['fetchedAt'])
            ? $cached
            : null;
    }

    /**
     * @param array<string, mixed> $stats
     */
    private function writeCache(string $cacheFile, array $stats): void
    {
        if (!is_dir($this->cacheDirectory)) {
            mkdir($this->cacheDirectory, 0775, true);
        }

        // Write to a temporary file and rename it into place, so a request
        // never reads a half-written cache file.
        $temporaryFile = $cacheFile . '.' . bin2hex(random_bytes(4)) . '.tmp';

        if (file_put_contents($temporaryFile, json_encode($stats, JSON_THROW_ON_ERROR)) === false) {
            error_log('UsageStats: unable to write cache file ' . $cacheFile);

            return;
        }

        rename($temporaryFile, $cacheFile);
    }

    private static function downloadFromSource(string $url): string
    {
        $curl = curl_init($url);

        curl_setopt_array($curl, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            // Accept gzip: the file is ~3 MB raw but ~600 KB compressed.
            CURLOPT_ENCODING => '',
            CURLOPT_USERAGENT => 'Brymon Team Builder',
            CURLOPT_TIMEOUT => 20,
        ]);

        $body = curl_exec($curl);
        $statusCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        $error = curl_error($curl);

        if (!is_string($body) || $statusCode !== 200) {
            throw new \RuntimeException(sprintf(
                'Request to %s failed (status %d): %s',
                $url,
                $statusCode,
                $error
            ));
        }

        return $body;
    }
}
