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
    private const FOLLOW_LIST_PAGE_SIZE = 20;

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
            'pageTitle' => '@' . $profileUser['username'],
            'profileUser' => $profileUser,
            'teams' => $teamModel->findPublicByUserId($profileUserId),
            'followerCount' => $followModel->countFollowers($profileUserId),
            'followingCount' => $followModel->countFollowing($profileUserId),
            'viewerLoggedIn' => Auth::check(),
            'isOwnProfile' => $viewerId === $profileUserId,
            'isFollowedByViewer' => $viewerId !== null
                && $followModel->isFollowing($viewerId, $profileUserId),
            // They follow the viewer, so the button says "Follow back".
            'followsViewer' => $viewerId !== null
                && $followModel->isFollowing($profileUserId, $viewerId),
        ]);
    }

    public function followers(string $username): void
    {
        $this->showFollowList($username, 'followers');
    }

    public function following(string $username): void
    {
        $this->showFollowList($username, 'following');
    }

    /**
     * A trainer's followers or the trainers they follow. Public, like the
     * counts on the profile, and paged with ?page=N.
     */
    private function showFollowList(string $username, string $list): void
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
        $page = self::pageFromQuery();
        $followModel = new Follow();

        // One extra row says whether there's a next page, without a COUNT.
        $offset = ($page - 1) * self::FOLLOW_LIST_PAGE_SIZE;
        $trainers = $list === 'followers'
            ? $followModel->findFollowers($profileUserId, self::FOLLOW_LIST_PAGE_SIZE + 1, $offset)
            : $followModel->findFollowing($profileUserId, self::FOLLOW_LIST_PAGE_SIZE + 1, $offset);

        $hasNextPage = count($trainers) > self::FOLLOW_LIST_PAGE_SIZE;
        $trainers = array_slice($trainers, 0, self::FOLLOW_LIST_PAGE_SIZE);

        // Which rows the signed-in viewer follows, and which follow them,
        // for each row's Follow / Following / Follow back button.
        $viewerId = Auth::activeId();
        $relationships = $viewerId !== null
            ? $followModel->findRelationshipsWith($viewerId, array_column($trainers, 'id'))
            : ['following' => [], 'followers' => []];

        $this->view('profile/follows', [
            'pageTitle' => ($list === 'followers' ? 'Followers' : 'Following')
                . ' · @' . $profileUser['username'],
            'profileUser' => $profileUser,
            'list' => $list,
            'trainers' => $trainers,
            'viewerId' => $viewerId,
            'viewerFollowingIds' => $relationships['following'],
            'viewerFollowerIds' => $relationships['followers'],
            'followerCount' => $followModel->countFollowers($profileUserId),
            'followingCount' => $followModel->countFollowing($profileUserId),
            'page' => $page,
            'hasNextPage' => $hasNextPage,
            'isOwnProfile' => Auth::activeId() === $profileUserId,
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
