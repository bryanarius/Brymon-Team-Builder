<?php

declare(strict_types=1);

use App\Controllers\AccountController;
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

$router->get('/pokedex', [PageController::class, 'pokedex']);

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
| Password Reset / Email Verification Routes
|--------------------------------------------------------------------------
*/

$router->get('/verify-email/{token}', [AuthController::class, 'verifyEmail']);

$router->get('/resend-verification', [AuthController::class, 'showResendVerification']);
$router->post('/resend-verification', [AuthController::class, 'resendVerification']);

$router->get('/forgot-password', [AuthController::class, 'showForgotPassword']);
$router->post('/forgot-password', [AuthController::class, 'forgotPassword']);

$router->get('/reset-password/{token}', [AuthController::class, 'showResetPassword']);
$router->post('/reset-password/{token}', [AuthController::class, 'resetPassword']);

/*
|--------------------------------------------------------------------------
| Account Routes
|--------------------------------------------------------------------------
*/

$router->get('/account', [AccountController::class, 'show']);
$router->post('/account/username', [AccountController::class, 'updateUsername']);
$router->post('/account/password', [AccountController::class, 'updatePassword']);

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
$router->get('/teams/{id}', [TeamController::class,'show',]);
$router->get('/teams/{id}/edit', [TeamController::class,'edit',]);
$router->post('/teams/{id}', [TeamController::class,'update',]);
$router->post('/teams/{id}/delete', [TeamController::class,'destroy',]);