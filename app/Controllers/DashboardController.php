<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Controller;
use App\Models\Team;

final class DashboardController extends Controller
{
    private const FEED_LIMIT = 12;

    public function index(): void
    {
        Auth::requireLogin();

        $userId = (int) $_SESSION['user_id'];
        $teamModel = new Team();

        $this->view('dashboard/index', [
            'pageTitle' => 'Dashboard',
            'username' => Auth::username() ?? 'Trainer',
            'followingTeams' => $teamModel->findPublicFromFollowedBy(
                $userId,
                self::FEED_LIMIT
            ),
            'popularTeams' => $teamModel->findPopularPublic(self::FEED_LIMIT),
            'recentTeams' => $teamModel->findRecentPublic(self::FEED_LIMIT),
        ]);
    }
}
