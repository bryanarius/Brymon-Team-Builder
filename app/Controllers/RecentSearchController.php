<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Controller;
use App\Core\Csrf;
use App\Models\RecentSearch;
use App\Models\User;

/**
 * The signed-in trainer's recent searches: trainer-search.js records a
 * trainer when you open them from search, and the Recent list's ✕ and
 * Clear all buttons remove them. JSON, CSRF-checked like follow / unfollow.
 */
final class RecentSearchController extends Controller
{
    public function record(string $username): void
    {
        $this->changeOne($username, static function (
            RecentSearch $recent,
            int $viewerId,
            int $trainerId,
        ): void {
            $recent->record($viewerId, $trainerId);
        });
    }

    public function remove(string $username): void
    {
        $this->changeOne($username, static function (
            RecentSearch $recent,
            int $viewerId,
            int $trainerId,
        ): void {
            $recent->remove($viewerId, $trainerId);
        });
    }

    public function clear(): void
    {
        $viewerId = $this->authorize();

        if ($viewerId === null) {
            return;
        }

        (new RecentSearch())->clear($viewerId);

        $this->sendJson(['cleared' => true], 200);
    }

    /**
     * @param callable(RecentSearch, int, int): void $change
     */
    private function changeOne(string $username, callable $change): void
    {
        $viewerId = $this->authorize();

        if ($viewerId === null) {
            return;
        }

        $trainer = (new User())->findByUsername($username);

        if ($trainer === false) {
            $this->sendJson(['message' => 'Trainer not found.'], 404);

            return;
        }

        $change(new RecentSearch(), $viewerId, (int) $trainer['id']);

        $this->sendJson(['ok' => true], 200);
    }

    /**
     * Signed in with a valid CSRF token: the viewer's id. Otherwise the
     * error is already sent and this returns null.
     */
    private function authorize(): ?int
    {
        Auth::requireLogin();

        header('Content-Type: application/json; charset=UTF-8');

        if (!Csrf::validate($_SERVER['HTTP_X_CSRF_TOKEN'] ?? null)) {
            $this->sendJson(['message' => 'Invalid request.'], 403);

            return null;
        }

        return (int) Auth::activeId();
    }
}
