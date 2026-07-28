<?php

declare(strict_types=1);

use App\Controllers\AuthController;
use App\Controllers\PageController;

/*
|--------------------------------------------------------------------------
| Page Routes
|--------------------------------------------------------------------------
*/

$router->get('/', [PageController::class, 'home']);

$router->get('/about', [PageController::class, 'about']);

/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
*/

$router->get('/register', [AuthController::class, 'showRegister']);
$router->post('/register', [AuthController::class, 'register']);