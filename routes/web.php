<?php

declare(strict_types=1);

use App\Controllers\PageController;

/*
|--------------------------------------------------------------------------
| Page Routes
|--------------------------------------------------------------------------
*/

$router->get('/', [PageController::class, 'home']);

$router->get('/about', [PageController::class, 'about']);