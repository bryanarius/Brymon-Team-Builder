<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Database;
use PDO;

final class TeamLike
{
    private PDO $database;

    public function __construct()
    {
        $this->database = Database::connection();
    }

    public function like(int $userId, int $teamId): void
    {
        $statement = $this->database->prepare(
            '
            INSERT INTO team_likes (user_id, team_id)
            VALUES (:user_id, :team_id)
            ON CONFLICT (user_id, team_id) DO NOTHING
            '
        );

        $statement->execute([
            'user_id' => $userId,
            'team_id' => $teamId,
        ]);
    }

    public function unlike(int $userId, int $teamId): void
    {
        $statement = $this->database->prepare(
            '
            DELETE FROM team_likes
            WHERE user_id = :user_id
            AND team_id = :team_id
            '
        );

        $statement->execute([
            'user_id' => $userId,
            'team_id' => $teamId,
        ]);
    }

    public function countForTeam(int $teamId): int
    {
        $statement = $this->database->prepare(
            '
            SELECT COUNT(*)
            FROM team_likes
            WHERE team_id = :team_id
            '
        );

        $statement->execute([
            'team_id' => $teamId,
        ]);

        return (int) $statement->fetchColumn();
    }

    public function isLikedBy(int $userId, int $teamId): bool
    {
        $statement = $this->database->prepare(
            '
            SELECT 1
            FROM team_likes
            WHERE user_id = :user_id
            AND team_id = :team_id
            LIMIT 1
            '
        );

        $statement->execute([
            'user_id' => $userId,
            'team_id' => $teamId,
        ]);

        return $statement->fetchColumn() !== false;
    }
}
