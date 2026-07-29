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

        $teams = $teamModel->findAllByUserId((
            (int) $_SESSION['user_id']
        ));

        $this->view('teams/index', [
            'pageTitle' => 'Saved Teams',
            'teams' => $teams,
        ]);
    }

    public function create(): void 
    {
        Auth::requireLogin();

        $this->view('teams/create', [
            'pageTitle' => 'Create Team',
            'errors' => [],
            'old' => [],
        ]);
    }
}