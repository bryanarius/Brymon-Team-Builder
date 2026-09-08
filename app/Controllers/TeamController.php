<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Config;
use App\Core\Controller;
use App\Models\Team;
use App\Models\TeamLike;
use App\Core\Validator;
use App\Core\Csrf;

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
            'pageTitle' => 'Team Builder',
            'errors' => [],
            'old' => [],
        ]);
    }

    public function save(): void
    {
        Auth::requireLogin();

        header('Content-Type: application/json; charset=UTF-8');

        $csrfToken = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? null;

        if (!Csrf::validate($csrfToken)) {
            $this->sendJson([
                'message' => 'Invalid request.',
            ], 403);

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
            $errors = array_merge(
                $errors,
                Validator::pokemonTeam($pokemon)
            );
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

        $userId = (int) $_SESSION['user_id'];
        $likeModel = new TeamLike();

        $this->view('teams/show', [
            'pageTitle' => $team['name'],
            'team' => $team,
            'isOwner' => true,
            'viewerLoggedIn' => true,
            'likeCount' => $likeModel->countForTeam((int) $teamId),
            'likedByViewer' => $likeModel->isLikedBy($userId, (int) $teamId),
        ]);
    }

    public function showPublic(string $id): void
    {
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

        $team = $teamModel->findPublicById((int) $teamId);

        if ($team === null) {
            $this->notFound();
            return;
        }

        $viewerLoggedIn = Auth::check();
        $likeModel = new TeamLike();

        $this->view('teams/show', [
            'pageTitle' => $team['name'],
            'team' => $team,
            'isOwner' => false,
            'viewerLoggedIn' => $viewerLoggedIn,
            'likeCount' => $likeModel->countForTeam((int) $teamId),
            'likedByViewer' => $viewerLoggedIn
                && $likeModel->isLikedBy(
                    (int) $_SESSION['user_id'],
                    (int) $teamId
                ),
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

        $csrfToken = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? null;

        if (!Csrf::validate($csrfToken)) {
            $this->sendJson([
                'message' => 'Invalid request.',
            ], 403);

            return;
        }

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
            $errors = array_merge($errors, Validator::pokemonTeam($pokemon));
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

    public function setVisibility(string $id): void
    {
        Auth::requireLogin();

        header('Content-Type: application/json; charset=UTF-8');

        $csrfToken = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? null;

        if (!Csrf::validate($csrfToken)) {
            $this->sendJson([
                'message' => 'Invalid request.',
            ], 403);

            return;
        }

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

        try {
            $data = json_decode(
                (string) $rawBody,
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

        if (!is_array($data) || !array_key_exists('is_public', $data)) {
            $this->sendJson([
                'message' => 'Missing visibility flag.',
            ], 400);

            return;
        }

        $isPublic = filter_var(
            $data['is_public'],
            FILTER_VALIDATE_BOOL,
            FILTER_NULL_ON_FAILURE
        );

        if ($isPublic === null) {
            $this->sendJson([
                'message' => 'Invalid visibility flag.',
            ], 400);

            return;
        }

        $teamModel = new Team();

        $updated = $teamModel->setVisibility(
            (int) $teamId,
            (int) $_SESSION['user_id'],
            $isPublic
        );

        if (!$updated) {
            $this->sendJson([
                'message' => 'Team not found.',
            ], 404);

            return;
        }

        $response = [
            'message' => $isPublic
                ? 'Team is now public.'
                : 'Team is now private.',
            'is_public' => $isPublic,
        ];

        if ($isPublic) {
            $response['public_url'] = rtrim(
                (string) Config::get('APP_URL', ''),
                '/'
            ) . '/p/' . (int) $teamId;
        }

        $this->sendJson($response, 200);
    }

    public function like(string $id): void
    {
        $this->toggleLike($id, true);
    }

    public function unlike(string $id): void
    {
        $this->toggleLike($id, false);
    }

    private function toggleLike(string $id, bool $liked): void
    {
        Auth::requireLogin();

        header('Content-Type: application/json; charset=UTF-8');

        $csrfToken = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? null;

        if (!Csrf::validate($csrfToken)) {
            $this->sendJson([
                'message' => 'Invalid request.',
            ], 403);

            return;
        }

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

        $userId = (int) $_SESSION['user_id'];

        $teamModel = new Team();

        if (!$teamModel->isVisibleTo((int) $teamId, $userId)) {
            $this->sendJson([
                'message' => 'Team not found.',
            ], 404);

            return;
        }

        $likeModel = new TeamLike();

        if ($liked) {
            $likeModel->like($userId, (int) $teamId);
        } else {
            $likeModel->unlike($userId, (int) $teamId);
        }

        $this->sendJson([
            'liked' => $liked,
            'like_count' => $likeModel->countForTeam((int) $teamId),
        ], 200);
    }

    public function destroy(string $id): void
    {
        Auth::requireLogin();
    if (!Csrf::validate($_POST['csrf_token'] ?? null)) {
        http_response_code(403);

        $this->view('errors/403', [
            'pageTitle' => 'Request Denied',
        ]);

        return;
    }

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

            $this->view('errors/404', [
                'pageTitle' => 'Team Not Found',
            ]);

            return;
        }

        $teamModel = new Team();

        $deleted = $teamModel->deleteByIdAndUserId(
            (int) $teamId,
            (int) $_SESSION['user_id']
        );

        if (!$deleted) {
            http_response_code(404);

            $this->view('errors/404', [
                'pageTitle' => 'Team Not Found',
            ]);

            return;
        }

        header('Location: /teams');
        exit;
    }
}