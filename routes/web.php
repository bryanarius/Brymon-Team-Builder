<?php

declare(strict_types=1);

use App\Controllers\PageController;
use App\Controllers\PokemonController;
use App\Controllers\TeamController;

/*
|--------------------------------------------------------------------------
| Route Parameters
|--------------------------------------------------------------------------
|
| {id}   - Team ID
| {name} - Pokémon name
|
*/

/*
|--------------------------------------------------------------------------
| Page Routes
|--------------------------------------------------------------------------
*/

$router->get('/', [PageController::class, 'home']);

$router->get('/about', [PageController::class, 'about']);


/*
|--------------------------------------------------------------------------
| Team Routes
|--------------------------------------------------------------------------
*/

// Display all saved teams
$router->get('/teams', [TeamController::class, 'index']);

// Display the create team page
$router->get('/teams/create', [TeamController::class, 'create']);

// Save a new team
$router->post('/teams', [TeamController::class, 'store']);

// Display a single team
$router->get('/teams/{id}', [TeamController::class, 'view']);

// Display the edit team page
$router->get('/teams/{id}/edit', [TeamController::class, 'edit']);

// Update an existing team
$router->post('/teams/{id}/update', [TeamController::class, 'update']);

// Delete a team
$router->post('/teams/{id}/delete', [TeamController::class, 'destroy']);


/*
|--------------------------------------------------------------------------
| Pokémon Routes
|--------------------------------------------------------------------------
*/

// Search for Pokémon
$router->get('/pokemon', [PokemonController::class, 'search']);

// Display information for a specific Pokémon
$router->get('/pokemon/{name}', [PokemonController::class, 'show']);