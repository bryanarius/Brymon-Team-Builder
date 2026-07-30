<?php

declare(strict_types=1);

use App\Controllers\AuthController;
use App\Controllers\DashboardController;
use App\Controllers\PageController;
use App\Controllers\TeamController;

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

$router->get('/login', [AuthController::class, 'showLogin']);
$router->post('/login',[AuthController::class, 'login']);

$router->post('/logout', [AuthController::class, 'logout']);

/*
|--------------------------------------------------------------------------
| Temp Dash Route
|--------------------------------------------------------------------------
*/

$router->get('/dashboard', [DashboardController::class, 'index']);

/*
|--------------------------------------------------------------------------
| Team Routes
|--------------------------------------------------------------------------
*/

$router->get('/teams', [TeamController::class, 'index']);
$router->get('/teambuilder', [TeamController::class, 'builder']);
$router->post('/teams', [TeamController::class, 'save']);