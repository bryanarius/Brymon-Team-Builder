<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Controller;
use App\Models\Team;

final class TeamController extends Controller 
{
    public function index(): void 
    {
        Auth::requireLogin();

        $teamModel = new Team();

        $teams = $teamModel->findAllByUserId(
            (int) $_SESSION['user_id']
        );

        $this->view('teams/index', [
            'pageTitle' => 'Saved Teams',
            'teams' => $teams,
        ]);
    }

    public function builder(): void 
    {
        Auth::requireLogin();

        $this->view('teams/teambuilder', [
            'pageTitle' => 'Build Team',
            'errors' => [],
            'old' => [],
        ]);
    }

    public function save(): void
    {
        Auth::requireLogin();

        header('Content-Type: application/json; charset=UTF-8');

        $rawBody = file_get_contents('php://input');

        if ($rawBody === false || $rawBody === '') {
            $this->sendJson([
                'message' => 'The request body is empty.',
            ], 400);

            return;
        }

        try {
            $data = json_decode(
                $rawBody,
                true,
                512,
                JSON_THROW_ON_ERROR
            );
        } catch (\JsonException) {
            $this->sendJson([
                'message' => 'Invalid JSON request.',
            ], 400);

            return;
        }

        if (!is_array($data)) {
            $this->sendJson([
                'message' => 'Invalid request data.',
            ], 400);

            return;
        }

        $name = trim((string) ($data['name'] ?? ''));
        $notes = trim((string) ($data['notes'] ?? ''));
        $pokemon = $data['pokemon'] ?? [];

        $errors = [];

        if ($name === '') {
            $errors['name'] = 'Team name is required.';
        } elseif (mb_strlen($name) > 100) {
            $errors['name'] =
                'Team name cannot be longer than 100 characters.';
        }

        if (mb_strlen($notes) > 1000) {
            $errors['notes'] =
                'Team notes cannot be longer than 1000 characters.';
        }

        if (!is_array($pokemon) || $pokemon === []) {
            $errors['pokemon'] =
                'Add at least one Pokémon to the team.';
        } elseif (count($pokemon) > 6) {
            $errors['pokemon'] =
                'A team cannot contain more than six Pokémon.';
        }

        if (is_array($pokemon)) {
            foreach ($pokemon as $index => $teamPokemon) {
                if (!is_array($teamPokemon)) {
                    $errors["pokemon.$index"] =
                        'Invalid Pokémon data.';

                    continue;
                }

                $slotNumber = (int) (
                    $teamPokemon['slot_number'] ?? 0
                );

                $pokemonApiId = (int) (
                    $teamPokemon['pokemon_api_id'] ?? 0
                );

                if ($slotNumber < 1 || $slotNumber > 6) {
                    $errors["pokemon.$index.slot_number"] =
                        'Slot number must be between 1 and 6.';
                }

                if ($pokemonApiId < 1) {
                    $errors["pokemon.$index.pokemon_api_id"] =
                        'A valid Pokémon ID is required.';
                }

                $totalEvs =
                    (int) ($teamPokemon['hp_ev'] ?? 0)
                    + (int) ($teamPokemon['attack_ev'] ?? 0)
                    + (int) ($teamPokemon['defense_ev'] ?? 0)
                    + (int) (
                        $teamPokemon['special_attack_ev'] ?? 0
                    )
                    + (int) (
                        $teamPokemon['special_defense_ev'] ?? 0
                    )
                    + (int) ($teamPokemon['speed_ev'] ?? 0);

                if ($totalEvs > 510) {
                    $errors["pokemon.$index.evs"] =
                        'A Pokémon cannot have more than 510 total EVs.';
                }
            }
        }

        if ($errors !== []) {
            $this->sendJson([
                'message' => 'Validation failed.',
                'errors' => $errors,
            ], 422);

            return;
        }

        try {
            $teamModel = new Team();

            $teamId = $teamModel->createWithPokemon(
                (int) $_SESSION['user_id'],
                $name,
                $notes === '' ? null : $notes,
                $pokemon
            );
        } catch (\Throwable $exception) {
            error_log(
                'Failed to save team: ' . $exception->getMessage()
            );

            $this->sendJson([
                'message' =>
                    'Unable to save the team. Please try again.',
            ], 500);

            return;
        }

        $this->sendJson([
            'message' => 'Team saved successfully.',
            'team_id' => $teamId,
        ], 201);
    }

    private function sendJson(array $data, int $statusCode): void
    {
        http_response_code($statusCode);

        echo json_encode(
            $data,
            JSON_UNESCAPED_SLASHES
            | JSON_UNESCAPED_UNICODE
        );
    }

    public function show(string $id): void
    {
        Auth::requireLogin();

        $teamId = filter_var(
            $id,
            FILTER_VALIDATE_INT,
            [
                'options' => [
                    'min_range' => 1,
                ],
            ]
        );

        if ($teamId === false) {
            $this->notFound();
            return;
        }

        $teamModel = new Team();

        $team = $teamModel->findByIdAndUserId(
            (int) $teamId,
            (int) $_SESSION['user_id']
        );

        if ($team === null) {
            $this->notFound();
            return;
        }

        $this->view('teams/show', [
            'pageTitle' => $team['name'],
            'team' => $team,
        ]);
    }

    private function notFound(): void
    {
        http_response_code(404);

        require dirname(__DIR__) . '/Views/errors/404.php';
    }

    public function edit(string $id): void
    {
        Auth::requireLogin();

        $teamId = filter_var(
            $id,
            FILTER_VALIDATE_INT,
            [
                'options' => [
                    'min_range' => 1,
                ],
            ]
        );

        if ($teamId === false) {
            http_response_code(404);
            return;
        }

        $teamModel = new Team();

        $team = $teamModel->findByIdAndUserId(
            (int) $teamId,
            (int) $_SESSION['user_id']
        );

        if ($team === null) {
            http_response_code(404);
            return;
        }

        $this->view('teams/teambuilder', [
            'pageTitle' => 'Edit Team',
            'errors' => [],
            'old' => [
                'name' => $team['name'],
                'notes' => $team['notes'],
            ],
            'team' => $team,
            'isEditing' => true,
        ]);
    }

    public function update(string $id): void
    {
        Auth::requireLogin();

        header('Content-Type: application/json; charset=UTF-8');

        $teamId = filter_var(
            $id,
            FILTER_VALIDATE_INT,
            [
                'options' => [
                    'min_range' => 1,
                ],
            ]
        );

        if ($teamId === false) {
            $this->sendJson([
                'message' => 'Invalid team ID.',
            ], 404);

            return;
        }

        $rawBody = file_get_contents('php://input');

        if ($rawBody === false || $rawBody === '') {
            $this->sendJson([
                'message' => 'The request body is empty.',
            ], 400);

            return;
        }

        try {
            $data = json_decode(
                $rawBody,
                true,
                512,
                JSON_THROW_ON_ERROR
            );
        } catch (\JsonException) {
            $this->sendJson([
                'message' => 'Invalid JSON request.',
            ], 400);

            return;
        }

        $name = trim((string) ($data['name'] ?? ''));
        $notes = trim((string) ($data['notes'] ?? ''));
        $pokemon = $data['pokemon'] ?? [];

        $errors = [];

        if ($name === '') {
            $errors['name'] = 'Team name is required.';
        } elseif (mb_strlen($name) > 100) {
            $errors['name'] =
                'Team name cannot be longer than 100 characters.';
        }

        if (mb_strlen($notes) > 1000) {
            $errors['notes'] =
                'Team notes cannot be longer than 1000 characters.';
        }

        if (!is_array($pokemon) || $pokemon === []) {
            $errors['pokemon'] =
                'Add at least one Pokémon to the team.';
        } elseif (count($pokemon) > 6) {
            $errors['pokemon'] =
                'A team cannot contain more than six Pokémon.';
        }

        if ($errors !== []) {
            $this->sendJson([
                'message' => 'Validation failed.',
                'errors' => $errors,
            ], 422);

            return;
        }

        try {
            $teamModel = new Team();

            $updated = $teamModel->updateWithPokemon(
                (int) $teamId,
                (int) $_SESSION['user_id'],
                $name,
                $notes === '' ? null : $notes,
                $pokemon
            );

            if (!$updated) {
                $this->sendJson([
                    'message' => 'Team not found.',
                ], 404);

                return;
            }

            $this->sendJson([
                'message' => 'Team updated successfully.',
                'team_id' => (int) $teamId,
            ], 200);
        } catch (\Throwable $exception) {
            error_log(
                'Failed to update team: '
                . $exception->getMessage()
            );

            $this->sendJson([
                'message' =>
                    'Unable to update the team. Please try again.',
            ], 500);
        }
    }
}