<?php

declare(strict_types=1);

use App\Core\Router;
use Dotenv\Dotenv;

session_start();

require dirname(__DIR__) . '/vendor/autoload.php';

$root = dirname(__DIR__);

if (file_exists($root . '/.env')) {
    Dotenv::createImmutable($root)->load();
}

$router = new Router();

require dirname(__DIR__) . '/routes/web.php';

$router->dispatch(
    $_SERVER['REQUEST_METHOD'] ?? 'GET',
    $_SERVER['REQUEST_URI'] ?? '/'
);