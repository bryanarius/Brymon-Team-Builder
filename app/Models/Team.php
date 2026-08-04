<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Database;
use PDO;
use Throwable;

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

    public function createWithPokemon(
        int $userId,
        string $name,
        ?string $notes,
        array $pokemon
    ): int {
        $this->database->beginTransaction();

        try {
            $teamId = $this->insertTeam(
                $userId,
                $name,
                $notes
            );

            foreach ($pokemon as $teamPokemon) {
                $this->insertTeamPokemon(
                    $teamId,
                    $teamPokemon
                );
            }

            $this->database->commit();

            return $teamId;
        } catch (Throwable $exception) {
            if ($this->database->inTransaction()) {
                $this->database->rollBack();
            }

            throw $exception;
        }
    }

    private function insertTeam(
        int $userId,
        string $name,
        ?string $notes
    ): int {
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
            RETURNING id
            '
        );

        $statement->execute([
            'user_id' => $userId,
            'name' => $name,
            'notes' => $notes,
        ]);

        return (int) $statement->fetchColumn();
    }

    private function insertTeamPokemon(
        int $teamId,
        array $pokemon
    ): void {
        $statement = $this->database->prepare(
            '
            INSERT INTO team_pokemon (
                team_id,
                pokemon_api_id,
                pokemon_name,
                slot_number,
                nickname,
                ability,
                item,
                nature,
                move_1,
                move_2,
                move_3,
                move_4,
                hp_ev,
                attack_ev,
                defense_ev,
                special_attack_ev,
                special_defense_ev,
                speed_ev,
                hp_iv,
                attack_iv,
                defense_iv,
                special_attack_iv,
                special_defense_iv,
                speed_iv
            )
            VALUES (
                :team_id,
                :pokemon_api_id,
                :pokemon_name,
                :slot_number,
                :nickname,
                :ability,
                :item,
                :nature,
                :move_1,
                :move_2,
                :move_3,
                :move_4,
                :hp_ev,
                :attack_ev,
                :defense_ev,
                :special_attack_ev,
                :special_defense_ev,
                :speed_ev,
                :hp_iv,
                :attack_iv,
                :defense_iv,
                :special_attack_iv,
                :special_defense_iv,
                :speed_iv
            )
            '
        );

        $statement->execute([
            'team_id' => $teamId,
            'pokemon_api_id' =>
                (int) $pokemon['pokemon_api_id'],
            'pokemon_name' =>
            $this->nullableString(
                $pokemon['pokemon_name'] ?? null
            ),
            'slot_number' =>
                (int) $pokemon['slot_number'],

            'nickname' =>
                $this->nullableString(
                    $pokemon['nickname'] ?? null
                ),
            'ability' =>
                $this->nullableString(
                    $pokemon['ability'] ?? null
                ),
            'item' =>
                $this->nullableString(
                    $pokemon['item'] ?? null
                ),
            'nature' =>
                $this->nullableString(
                    $pokemon['nature'] ?? null
                ),
            'move_1' =>
                $this->nullableString(
                    $pokemon['move_1'] ?? null
                ),
            'move_2' =>
                $this->nullableString(
                    $pokemon['move_2'] ?? null
                ),
            'move_3' =>
                $this->nullableString(
                    $pokemon['move_3'] ?? null
                ),
            'move_4' =>
                $this->nullableString(
                    $pokemon['move_4'] ?? null
                ),

            'hp_ev' =>
                (int) ($pokemon['hp_ev'] ?? 0),
            'attack_ev' =>
                (int) ($pokemon['attack_ev'] ?? 0),
            'defense_ev' =>
                (int) ($pokemon['defense_ev'] ?? 0),
            'special_attack_ev' =>
                (int) ($pokemon['special_attack_ev'] ?? 0),
            'special_defense_ev' =>
                (int) ($pokemon['special_defense_ev'] ?? 0),
            'speed_ev' =>
                (int) ($pokemon['speed_ev'] ?? 0),

            'hp_iv' =>
                (int) ($pokemon['hp_iv'] ?? 31),
            'attack_iv' =>
                (int) ($pokemon['attack_iv'] ?? 31),
            'defense_iv' =>
                (int) ($pokemon['defense_iv'] ?? 31),
            'special_attack_iv' =>
                (int) ($pokemon['special_attack_iv'] ?? 31),
            'special_defense_iv' =>
                (int) ($pokemon['special_defense_iv'] ?? 31),
            'speed_iv' =>
                (int) ($pokemon['speed_iv'] ?? 31),
        ]);
    }

    private function nullableString(mixed $value): ?string
    {
        if (!is_string($value)) {
            return null;
        }

        $value = trim($value);

        return $value === '' ? null : $value;
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

        $statement = $this->database->prepare(
            "
            SELECT
                id,
                team_id,
                pokemon_api_id,
                pokemon_name,
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

        public function findByIdAndUserId(
        int $teamId,
        int $userId
    ): ?array {
        $statement = $this->database->prepare(
            '
            SELECT
                id,
                user_id,
                name,
                notes,
                created_at,
                updated_at
            FROM teams
            WHERE id = :team_id
            AND user_id = :user_id
            LIMIT 1
            '
        );

        $statement->execute([
            'team_id' => $teamId,
            'user_id' => $userId,
        ]);

        $team = $statement->fetch(PDO::FETCH_ASSOC);

        if ($team === false) {
            return null;
        }

        $pokemonStatement = $this->database->prepare(
            '
            SELECT
                id,
                team_id,
                pokemon_api_id,
                pokemon_name,
                slot_number,
                nickname,
                ability,
                item,
                nature,
                move_1,
                move_2,
                move_3,
                move_4,
                hp_ev,
                attack_ev,
                defense_ev,
                special_attack_ev,
                special_defense_ev,
                speed_ev,
                hp_iv,
                attack_iv,
                defense_iv,
                special_attack_iv,
                special_defense_iv,
                speed_iv
            FROM team_pokemon
            WHERE team_id = :team_id
            ORDER BY slot_number
            '
        );

        $pokemonStatement->execute([
            'team_id' => $teamId,
        ]);

        $team['pokemon'] = $pokemonStatement->fetchAll(
            PDO::FETCH_ASSOC
        );

        return $team;
    }

    public function updateWithPokemon(
    int $teamId,
    int $userId,
    string $name,
    ?string $notes,
    array $pokemon
    ): bool {
        $this->database->beginTransaction();

        try {
            $statement = $this->database->prepare(
                '
                UPDATE teams
                SET
                    name = :name,
                    notes = :notes,
                    updated_at = NOW()
                WHERE id = :team_id
                AND user_id = :user_id
                '
            );

            $statement->execute([
                'team_id' => $teamId,
                'user_id' => $userId,
                'name' => $name,
                'notes' => $notes,
            ]);

            if ($statement->rowCount() === 0) {
                $this->database->rollBack();

                return false;
            }

            $deleteStatement = $this->database->prepare(
                '
                DELETE FROM team_pokemon
                WHERE team_id = :team_id
                '
            );

            $deleteStatement->execute([
                'team_id' => $teamId,
            ]);

            foreach ($pokemon as $teamPokemon) {
                $this->insertTeamPokemon(
                    $teamId,
                    $teamPokemon
                );
            }

            $this->database->commit();

            return true;
        } catch (\Throwable $exception) {
            if ($this->database->inTransaction()) {
                $this->database->rollBack();
            }

            throw $exception;
        }
    }

    public function deleteByIdAndUserId(
    int $teamId,
    int $userId
    ): bool {
        $statement = $this->database->prepare(
            '
            DELETE FROM teams
            WHERE id = :team_id
            AND user_id = :user_id
            '
        );

        $statement->execute([
            'team_id' => $teamId,
            'user_id' => $userId,
        ]);

        return $statement->rowCount() === 1;
    }
}