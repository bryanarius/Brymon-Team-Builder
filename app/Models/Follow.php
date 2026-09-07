<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Database;
use PDO;

final class Follow
{
    private PDO $database;

    public function __construct()
    {
        $this->database = Database::connection();
    }

    public function follow(int $followerId, int $followedId): void
    {
        if ($followerId === $followedId) {
            return;
        }

        $statement = $this->database->prepare(
            '
            INSERT INTO follows (follower_id, followed_id)
            VALUES (:follower_id, :followed_id)
            ON CONFLICT (follower_id, followed_id) DO NOTHING
            '
        );

        $statement->execute([
            'follower_id' => $followerId,
            'followed_id' => $followedId,
        ]);
    }

    public function unfollow(int $followerId, int $followedId): void
    {
        $statement = $this->database->prepare(
            '
            DELETE FROM follows
            WHERE follower_id = :follower_id
            AND followed_id = :followed_id
            '
        );

        $statement->execute([
            'follower_id' => $followerId,
            'followed_id' => $followedId,
        ]);
    }

    public function isFollowing(int $followerId, int $followedId): bool
    {
        $statement = $this->database->prepare(
            '
            SELECT 1
            FROM follows
            WHERE follower_id = :follower_id
            AND followed_id = :followed_id
            LIMIT 1
            '
        );

        $statement->execute([
            'follower_id' => $followerId,
            'followed_id' => $followedId,
        ]);

        return $statement->fetchColumn() !== false;
    }

    public function countFollowers(int $userId): int
    {
        $statement = $this->database->prepare(
            'SELECT COUNT(*) FROM follows WHERE followed_id = :user_id'
        );

        $statement->execute([
            'user_id' => $userId,
        ]);

        return (int) $statement->fetchColumn();
    }

    public function countFollowing(int $userId): int
    {
        $statement = $this->database->prepare(
            'SELECT COUNT(*) FROM follows WHERE follower_id = :user_id'
        );

        $statement->execute([
            'user_id' => $userId,
        ]);

        return (int) $statement->fetchColumn();
    }
}
