<?php

declare(strict_types=1);

namespace App\Core;

use RuntimeException;

/**
 * Prints the <script> and <link> tags for a Vite entry point.
 *
 * `npm run build` compiles resources/ts into public/build with hashed file
 * names (main-3f9a1c.js) so browsers never cache a stale bundle. Vite
 * records which hashed files belong to each entry in manifest.json, and
 * this class reads it.
 *
 * In development, setting VITE_DEV_SERVER (e.g. http://localhost:5173)
 * loads the entry from `npm run dev` instead, with instant reloads.
 */
final class Vite
{
    private ?array $manifest = null;

    public function __construct(
        private readonly string $manifestPath,
        private readonly string $buildUrl = '/build/',
        private readonly ?string $devServerUrl = null,
    ) {
    }

    public static function fromEnvironment(): self
    {
        $appEnv = Config::get('APP_ENV') ?: 'production';
        $devServerUrl = Config::get('VITE_DEV_SERVER') ?: null;

        return new self(
            dirname(__DIR__, 2) . '/public/build/manifest.json',
            '/build/',
            // Never let a stray env var point production at localhost.
            $appEnv === 'production' ? null : $devServerUrl,
        );
    }

    /**
     * @param string $entry Source path, e.g. "resources/ts/calc/main.tsx".
     */
    public function tags(string $entry): string
    {
        return $this->devServerUrl === null
            ? $this->buildTags($entry)
            : $this->devTags($entry);
    }

    private function buildTags(string $entry): string
    {
        $manifest = $this->manifest();

        if (!isset($manifest[$entry])) {
            throw new RuntimeException(
                "Vite entry \"{$entry}\" is not in the manifest. Is it listed in vite.config.mts?"
            );
        }

        $tags = [];

        foreach ($this->cssFiles($manifest, $entry) as $file) {
            $tags[] = '<link rel="stylesheet" href="' . $this->url($file) . '">';
        }

        // Start downloading shared chunks (React itself) in parallel.
        foreach ($this->importedChunks($manifest, $entry) as $file) {
            $tags[] = '<link rel="modulepreload" href="' . $this->url($file) . '">';
        }

        $tags[] = '<script type="module" src="' . $this->url($manifest[$entry]['file']) . '"></script>';

        return implode("\n", $tags);
    }

    private function devTags(string $entry): string
    {
        $server = rtrim($this->devServerUrl, '/');
        // Inside <script>, HTML entities aren't decoded, so this one is
        // escaped as a JavaScript string instead.
        $refresh = json_encode(
            $server . '/@react-refresh',
            JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_THROW_ON_ERROR
        );

        // React Fast Refresh expects this preamble before any component
        // loads. Vite adds it itself only for pages it serves.
        return implode("\n", [
            '<script type="module">',
            "import RefreshRuntime from {$refresh};",
            'RefreshRuntime.injectIntoGlobalHook(window);',
            'window.$RefreshReg$ = () => {};',
            'window.$RefreshSig$ = () => (type) => type;',
            'window.__vite_plugin_react_preamble_installed__ = true;',
            '</script>',
            '<script type="module" src="' . $this->escape($server . '/@vite/client') . '"></script>',
            '<script type="module" src="' . $this->escape($server . '/' . $entry) . '"></script>',
        ]);
    }

    /**
     * CSS of the entry and of every chunk it imports.
     *
     * @return list<string>
     */
    private function cssFiles(array $manifest, string $key, array &$seen = []): array
    {
        if (isset($seen[$key])) {
            return [];
        }

        $seen[$key] = true;
        $files = $manifest[$key]['css'] ?? [];

        foreach ($manifest[$key]['imports'] ?? [] as $import) {
            $files = [...$files, ...$this->cssFiles($manifest, $import, $seen)];
        }

        return array_values(array_unique($files));
    }

    /**
     * @return list<string>
     */
    private function importedChunks(array $manifest, string $key, array &$seen = []): array
    {
        $files = [];

        foreach ($manifest[$key]['imports'] ?? [] as $import) {
            if (isset($seen[$import])) {
                continue;
            }

            $seen[$import] = true;
            $files[] = $manifest[$import]['file'];
            $files = [...$files, ...$this->importedChunks($manifest, $import, $seen)];
        }

        return $files;
    }

    private function manifest(): array
    {
        if ($this->manifest !== null) {
            return $this->manifest;
        }

        if (!is_file($this->manifestPath)) {
            throw new RuntimeException(
                'Vite manifest not found at ' . $this->manifestPath . '. Run `npm run build`.'
            );
        }

        return $this->manifest = json_decode(
            (string) file_get_contents($this->manifestPath),
            true,
            512,
            JSON_THROW_ON_ERROR
        );
    }

    private function url(string $file): string
    {
        return $this->escape($this->buildUrl . $file);
    }

    private function escape(string $value): string
    {
        return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
    }
}
