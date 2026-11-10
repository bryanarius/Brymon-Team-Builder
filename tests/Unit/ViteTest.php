<?php

declare(strict_types=1);

use App\Core\Vite;
use PHPUnit\Framework\TestCase;

final class ViteTest extends TestCase
{
    private string $manifestPath;

    protected function setUp(): void
    {
        $this->manifestPath = tempnam(sys_get_temp_dir(), 'vite-manifest-');

        // The shape `vite build` writes: an entry importing a shared chunk.
        file_put_contents($this->manifestPath, json_encode([
            'resources/ts/calc/main.tsx' => [
                'file' => 'assets/main-abc123.js',
                'isEntry' => true,
                'imports' => ['_react-def456.js'],
                'css' => ['assets/main-abc123.css'],
            ],
            '_react-def456.js' => [
                'file' => 'assets/react-def456.js',
                'css' => ['assets/react-def456.css'],
            ],
        ]));
    }

    protected function tearDown(): void
    {
        @unlink($this->manifestPath);
    }

    public function testBuildTagsUseTheHashedFileNames(): void
    {
        $html = (new Vite($this->manifestPath))->tags('resources/ts/calc/main.tsx');

        $this->assertStringContainsString(
            '<script type="module" src="/build/assets/main-abc123.js"></script>',
            $html
        );
    }

    public function testBuildTagsIncludeCssAndPreloadImportedChunks(): void
    {
        $html = (new Vite($this->manifestPath))->tags('resources/ts/calc/main.tsx');

        $this->assertStringContainsString('<link rel="stylesheet" href="/build/assets/main-abc123.css">', $html);
        $this->assertStringContainsString('<link rel="stylesheet" href="/build/assets/react-def456.css">', $html);
        $this->assertStringContainsString('<link rel="modulepreload" href="/build/assets/react-def456.js">', $html);
    }

    public function testUnknownEntryThrows(): void
    {
        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('not in the manifest');

        (new Vite($this->manifestPath))->tags('resources/ts/missing.tsx');
    }

    public function testMissingManifestTellsYouToBuild(): void
    {
        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('npm run build');

        (new Vite('/no/such/manifest.json'))->tags('resources/ts/calc/main.tsx');
    }

    public function testDevServerLoadsTheSourceEntryWithoutAManifest(): void
    {
        $html = (new Vite('/no/such/manifest.json', '/build/', 'http://localhost:5173/'))
            ->tags('resources/ts/calc/main.tsx');

        $this->assertStringContainsString('src="http://localhost:5173/@vite/client"', $html);
        $this->assertStringContainsString('src="http://localhost:5173/resources/ts/calc/main.tsx"', $html);
        $this->assertStringContainsString('import RefreshRuntime from "http://localhost:5173/@react-refresh";', $html);
    }

    public function testProductionIgnoresTheDevServerSetting(): void
    {
        $previous = $_ENV;
        $_ENV['APP_ENV'] = 'production';
        $_ENV['VITE_DEV_SERVER'] = 'http://localhost:5173';

        try {
            $html = Vite::fromEnvironment()->tags('resources/ts/calc/main.tsx');
        } catch (RuntimeException) {
            // No build in this checkout: still proves it went to the manifest.
            $html = '';
        } finally {
            $_ENV = $previous;
        }

        $this->assertStringNotContainsString('localhost:5173', $html);
    }
}
