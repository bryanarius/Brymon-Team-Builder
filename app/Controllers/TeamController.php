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

        $name = trim($_POST['name'] ?? '');
        $notes = trim($_POST['notes'] ?? '');

        $errors = [];

        if ($name === '') {
            $errors['name'] = 'Team name is required';
        }   elseif (mb_strlen($name) > 100) {
            $errors['name'] = 'Team name cannot be longer than 100 characters';
        }

        if (mb_strlen($notes) > 1000) {
            $errors['notes'] = 'Team notes cannot be longer than 1000 characters';
        }

        if ($errors !== []) {
            $this->view('team/teambuilder', [
                'pageTitle' => 'Build Team',
                'errors' => $errors,
                'old' => [
                    'name' => $name,
                    'notes' => $notes,
                ],
            ]);

            return;
        }

        $teamModel = new Team();

        $created = $teamModel->create(
            (int) $_SESSION['user_id'],
            $name,
            $notes === '' ? null : $notes
        );

        if (!$created) {
            $this->view('teams/teambuilder', [
                'pageTitle' => 'Build Team',
                'errors' => [
                    'form' => 'Unable to build the team. Please try again'
                ],
                'old' => [
                    'name' => $name,
                    'notes' => $notes,
                ],
            ]);

            return;
        }

        header('Location: /teams');
        exit;
    }
}