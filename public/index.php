<?php

declare(strict_types=1);

use App\Core\Router;

require dirname(__DIR__) . '/vendor/autoload.php';

$router = new Router();

require dirname(__DIR__) . '/routes/web.php';

$router->dispatch(
    $_SERVER['REQUEST_METHOD'] ?? 'GET',
    $_SERVER['REQUEST_URI'] ?? '/'
);