<?php

declare(strict_types=1);

namespace App\Models;

use PDO;
use PDOException;
use Throwable;

final class User extends Model
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
        $normalizedEmail = strtolower(trim($email));

        $statement = $this->db->prepare(
            'SELECT
                id,
                username,
                email,
                password_hash,
                role,
                email_verified_at,
                created_at,
                updated_at
             FROM users
             WHERE LOWER(email) = :email
             LIMIT 1'
        );

        $statement->execute([
            'email' => $normalizedEmail,
        ]);

        return $statement->fetch(PDO::FETCH_ASSOC);
    }

    public function findByUsername(string $username): array|false
    {
        $normalizedUsername = trim($username);

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
             WHERE LOWER(username) = LOWER(:username)
             LIMIT 1'
        );

        $statement->execute([
            'username' => $normalizedUsername,
        ]);

        return $statement->fetch(PDO::FETCH_ASSOC);
    }

    public function create(
        string $username,
        string $email,
        string $passwordHash
    ): int|false {
        $normalizedUsername = trim($username);
        $normalizedEmail = strtolower(trim($email));

        try {
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
                'username' => $normalizedUsername,
                'email' => $normalizedEmail,
                'password_hash' => $passwordHash,
            ]);

            $id = $statement->fetchColumn();

            return $id === false ? false : (int) $id;
        } catch (PDOException $exception) {
            error_log((string) $exception);

            return false;
        }
    }

    public function generateEmailVerificationToken(int $userId): string|false
    {
        $token = bin2hex(random_bytes(32));
        $tokenHash = hash('sha256', $token);

        try {
            $statement = $this->db->prepare(
                'UPDATE users
                 SET email_verification_token_hash = :token_hash,
                     email_verification_expires_at = NOW() + INTERVAL \'24 hours\'
                 WHERE id = :id'
            );

            $statement->execute([
                'token_hash' => $tokenHash,
                'id' => $userId,
            ]);

            return $token;
        } catch (PDOException $exception) {
            error_log((string) $exception);

            return false;
        }
    }

    public function findByEmailVerificationTokenHash(string $tokenHash): array|false
    {
        $statement = $this->db->prepare(
            'SELECT
                id,
                username,
                email,
                email_verified_at,
                email_verification_expires_at
             FROM users
             WHERE email_verification_token_hash = :token_hash
             LIMIT 1'
        );

        $statement->execute([
            'token_hash' => $tokenHash,
        ]);

        return $statement->fetch(PDO::FETCH_ASSOC);
    }

    public function markEmailVerified(int $userId): bool
    {
        try {
            $statement = $this->db->prepare(
                'UPDATE users
                 SET email_verified_at = NOW(),
                     email_verification_token_hash = NULL,
                     email_verification_expires_at = NULL
                 WHERE id = :id'
            );

            $statement->execute([
                'id' => $userId,
            ]);

            return true;
        } catch (PDOException $exception) {
            error_log((string) $exception);

            return false;
        }
    }

    public function generatePasswordResetToken(int $userId): string|false
    {
        $token = bin2hex(random_bytes(32));
        $tokenHash = hash('sha256', $token);

        try {
            $statement = $this->db->prepare(
                'UPDATE users
                 SET password_reset_token_hash = :token_hash,
                     password_reset_expires_at = NOW() + INTERVAL \'1 hour\'
                 WHERE id = :id'
            );

            $statement->execute([
                'token_hash' => $tokenHash,
                'id' => $userId,
            ]);

            return $token;
        } catch (PDOException $exception) {
            error_log((string) $exception);

            return false;
        }
    }

    public function findByPasswordResetTokenHash(string $tokenHash): array|false
    {
        $statement = $this->db->prepare(
            'SELECT
                id,
                username,
                email,
                password_reset_expires_at
             FROM users
             WHERE password_reset_token_hash = :token_hash
             LIMIT 1'
        );

        $statement->execute([
            'token_hash' => $tokenHash,
        ]);

        return $statement->fetch(PDO::FETCH_ASSOC);
    }

    public function resetPassword(int $userId, string $passwordHash): bool
    {
        try {
            $statement = $this->db->prepare(
                'UPDATE users
                 SET password_hash = :password_hash,
                     password_reset_token_hash = NULL,
                     password_reset_expires_at = NULL,
                     email_verified_at = COALESCE(email_verified_at, NOW())
                 WHERE id = :id'
            );

            $statement->execute([
                'password_hash' => $passwordHash,
                'id' => $userId,
            ]);

            return true;
        } catch (PDOException $exception) {
            error_log((string) $exception);

            return false;
        }
    }

    public function findAllByUserId(int $userId): array
    {
        $statement = $this->db->prepare(
            'SELECT
                teams.id,
                teams.user_id,
                teams.name,
                teams.notes,
                teams.created_at,
                teams.updated_at,
                COUNT(team_pokemon.id)::int AS pokemon_count
             FROM teams
             LEFT JOIN team_pokemon
                ON team_pokemon.team_id = teams.id
             WHERE teams.user_id = :user_id
             GROUP BY teams.id
             ORDER BY teams.updated_at DESC'
        );

        $statement->execute([
            'user_id' => $userId,
        ]);

        $teams = $statement->fetchAll(PDO::FETCH_ASSOC);

        if ($teams === []) {
            return [];
        }

        $teamIds = array_map(
            static fn (array $team): int => (int) $team['id'],
            $teams
        );

        $pokemonByTeam = $this->findPokemonByTeamIds($teamIds);

        foreach ($teams as &$team) {
            $teamId = (int) $team['id'];

            $team['id'] = $teamId;
            $team['user_id'] = (int) $team['user_id'];
            $team['pokemon_count'] = (int) $team['pokemon_count'];
            $team['pokemon'] = $pokemonByTeam[$teamId] ?? [];
        }

        unset($team);

        return $teams;
    }

    private function findPokemonByTeamIds(array $teamIds): array
    {
        if ($teamIds === []) {
            return [];
        }

        $placeholders = implode(
            ', ',
            array_fill(0, count($teamIds), '?')
        );

        $statement = $this->db->prepare(
            "SELECT
                id,
                team_id,
                pokemon_api_id,
                slot_number,
                nickname
             FROM team_pokemon
             WHERE team_id IN ($placeholders)
             ORDER BY team_id, slot_number"
        );

        $statement->execute($teamIds);

        $rows = $statement->fetchAll(PDO::FETCH_ASSOC);

        $pokemonByTeam = [];

        foreach ($rows as $pokemon) {
            $teamId = (int) $pokemon['team_id'];

            $pokemon['id'] = (int) $pokemon['id'];
            $pokemon['team_id'] = $teamId;
            $pokemon['pokemon_api_id'] =
                (int) $pokemon['pokemon_api_id'];
            $pokemon['slot_number'] =
                (int) $pokemon['slot_number'];

            $pokemonByTeam[$teamId][] = $pokemon;
        }

        return $pokemonByTeam;
    }
}