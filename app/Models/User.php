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

    public function findAllByUserId(int $userId): array
    {
        $statement = $this->db->prepare(
            '
            SELECT
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
            ORDER BY teams.updated_at DESC
            '
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

            $team['pokemon'] = $pokemonByTeam[$teamId] ?? [];
        }

        unset($team);

        return $teams;
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
            "
            SELECT
                id,
                team_id,
                pokemon_api_id,
                slot_number,
                nickname
            FROM team_pokemon
            WHERE team_id IN ($placeholders)
            ORDER BY team_id, slot_number
            "
        );

        $statement->execute($teamIds);

        $rows = $statement->fetchAll(PDO::FETCH_ASSOC);

        $pokemonByTeam = [];

        foreach ($rows as $pokemon) {
            $teamId = (int) $pokemon['team_id'];

            $pokemonByTeam[$teamId][] = $pokemon;
        }

        return $pokemonByTeam;
    }
}