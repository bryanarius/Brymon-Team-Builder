<?php

declare(strict_types=1);

use App\Core\Router;
use Dotenv\Dotenv;

require dirname(__DIR__) . '/vendor/autoload.php';

$root = dirname(__DIR__);

if (file_exists($root . '/.env')) {
    Dotenv::createImmutable($root)->load();
}

/*
|--------------------------------------------------------------------------
| Environment / Error Configuration
|--------------------------------------------------------------------------
*/

$appEnv = $_ENV['APP_ENV']
    ?? getenv('APP_ENV')
    ?: 'production';

$isProduction = $appEnv === 'production';

error_reporting(E_ALL);

if ($isProduction) {
    ini_set('display_errors', '0');
    ini_set('display_startup_errors', '0');
} else {
    ini_set('display_errors', '1');
    ini_set('display_startup_errors', '1');
}

/*
|--------------------------------------------------------------------------
| Global Exception Handler
|--------------------------------------------------------------------------
*/

set_exception_handler(
    function (Throwable $exception) use ($root): void {
        error_log((string) $exception);

        http_response_code(500);

        $viewPath = $root . '/app/Views/errors/500.php';

        if (file_exists($viewPath)) {
            $pageTitle = 'Server Error';

            require $viewPath;
            return;
        }

        echo '<h1>500</h1>';
        echo '<p>Something went wrong.</p>';
    }
);

/*
|--------------------------------------------------------------------------
| Session
|--------------------------------------------------------------------------
*/

session_start();

/*
|--------------------------------------------------------------------------
| Router
|--------------------------------------------------------------------------
*/

$router = new Router();

require $root . '/routes/web.php';

$router->dispatch(
    $_SERVER['REQUEST_METHOD'] ?? 'GET',
    $_SERVER['REQUEST_URI'] ?? '/'
);