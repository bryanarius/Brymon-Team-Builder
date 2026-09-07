<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Controller;
use App\Core\Csrf;
use App\Models\Follow;
use App\Models\Team;
use App\Models\User;

final class ProfileController extends Controller
{
    public function show(string $username): void
    {
        $userModel = new User();
        $profileUser = $userModel->findByUsername($username);

        if ($profileUser === false) {
            http_response_code(404);

            $this->view('errors/404', [
                'pageTitle' => 'Trainer Not Found',
            ]);

            return;
        }

        $profileUserId = (int) $profileUser['id'];

        $teamModel = new Team();
        $followModel = new Follow();

        $viewerId = Auth::check()
            ? (int) $_SESSION['user_id']
            : null;

        $this->view('profile/show', [
            'pageTitle' => $profileUser['username'],
            'profileUser' => $profileUser,
            'teams' => $teamModel->findPublicByUserId($profileUserId),
            'followerCount' => $followModel->countFollowers($profileUserId),
            'followingCount' => $followModel->countFollowing($profileUserId),
            'viewerLoggedIn' => Auth::check(),
            'isOwnProfile' => $viewerId === $profileUserId,
            'isFollowedByViewer' => $viewerId !== null
                && $followModel->isFollowing($viewerId, $profileUserId),
        ]);
    }

    public function follow(string $username): void
    {
        $this->toggleFollow($username, true);
    }

    public function unfollow(string $username): void
    {
        $this->toggleFollow($username, false);
    }

    private function toggleFollow(string $username, bool $follow): void
    {
        Auth::requireLogin();

        header('Content-Type: application/json; charset=UTF-8');

        if (!Csrf::validate($_SERVER['HTTP_X_CSRF_TOKEN'] ?? null)) {
            $this->sendJson([
                'message' => 'Invalid request.',
            ], 403);

            return;
        }

        $userModel = new User();
        $target = $userModel->findByUsername($username);

        if ($target === false) {
            $this->sendJson([
                'message' => 'Trainer not found.',
            ], 404);

            return;
        }

        $viewerId = (int) $_SESSION['user_id'];
        $targetId = (int) $target['id'];

        if ($viewerId === $targetId) {
            $this->sendJson([
                'message' => 'You cannot follow yourself.',
            ], 422);

            return;
        }

        $followModel = new Follow();

        if ($follow) {
            $followModel->follow($viewerId, $targetId);
        } else {
            $followModel->unfollow($viewerId, $targetId);
        }

        $this->sendJson([
            'following' => $follow,
            'follower_count' => $followModel->countFollowers($targetId),
        ], 200);
    }
}
