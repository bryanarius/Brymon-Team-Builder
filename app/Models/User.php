<?php

declare(strict_types=1);

namespace App\Models;

use PDO;

class User extends Model
{
    public function findById(int $id): array|false
    {
        $statement = $this->db->prepare(
            'SELECT
                id,
                username,
                email,
                password_hash,
                role,
                created_at,
                updated_at
             FROM users
             WHERE id = :id
             LIMIT 1'
        );

        $statement->execute([
            'id' => $id,
        ]);

        return $statement->fetch(PDO::FETCH_ASSOC);
    }

    public function findByEmail(string $email): array|false
    {
        $statement = $this->db->prepare(
            'SELECT
                id,
                username,
                email,
                password_hash,
                role,
                created_at,
                updated_at
             FROM users
             WHERE email = :email
             LIMIT 1'
        );

        $statement->execute([
            'email' => $email,
        ]);

        return $statement->fetch(PDO::FETCH_ASSOC);
    }

    public function findByUsername(string $username): array|false
    {
        $statement = $this->db->prepare(
            'SELECT
                id,
                username,
                email,
                password_hash,
                role,
                created_at,
                updated_at
             FROM users
             WHERE username = :username
             LIMIT 1'
        );

        $statement->execute([
            'username' => $username,
        ]);

        return $statement->fetch(PDO::FETCH_ASSOC);
    }

    public function create(
        string $username,
        string $email,
        string $passwordHash
    ): int|false {
        $statement = $this->db->prepare(
            'INSERT INTO users (
                username,
                email,
                password_hash
             ) VALUES (
                :username,
                :email,
                :password_hash
             )
             RETURNING id'
        );

        $statement->execute([
            'username' => $username,
            'email' => $email,
            'password_hash' => $passwordHash,
        ]);

        $id = $statement->fetchColumn();

        return $id === false ? false : (int) $id;
    }
}