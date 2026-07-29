<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Database;
use PDO;

final class Team
{
    private PDO $database;

    public function __construct() 
    {
        $this->database = Database::connection();
    }

    public function findAllByUserId(int $userId): array 
    {
        $statement = $this->database->prepare(
            '
            SELECT
                id,
                user_id,
                name,
                notes
                created_at,
                updated_at
            FROM teams
            WHERE user_id = :user_id
            ORDER BY created_at DESC
            '
        );

        $statement->execute([
            'user_id' => $userId,
        ]);

        return $statement->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create(
        int $userId,
        string $name,
        ?string $notes
    ): bool {
        $statement = $this->database->prepare(
            '
            INSERT INTO teams (
                user_id,
                name,
                notes
                )
                VALUES (
                :user_id,
                :name,
                :notes
                )
            '
        );

        return $statement->execute([
            'user_id' => $userId,
            'name' => $name,
            'notes' => $notes,
        ]);
    }
}