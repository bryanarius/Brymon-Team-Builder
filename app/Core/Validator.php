<?php

declare(strict_types=1);

namespace App\Core;

class Validator
{
    public static function required(?string $value): bool
    {
        return trim((string) $value) !== '';
    }

    public static function email(string $email): bool
    {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }

    public static function minLength(string $value, int $length): bool
    {
        return mb_strlen(trim($value)) >= $length;
    }

    public static function maxLength(string $value, int $length): bool
    {
        return mb_strlen(trim($value)) <= $length;
    }

    public static function matches(string $value, string $comparison): bool
    {
        return $value === $comparison;
    }

    public static function pokemonTeam(array $pokemon): array
    {
        $errors = [];
        $usedSlots = [];

        $evFields = [
            'hp_ev',
            'attack_ev',
            'defense_ev',
            'special_attack_ev',
            'special_defense_ev',
            'speed_ev',
        ];

        $ivFields = [
            'hp_iv',
            'attack_iv',
            'defense_iv',
            'special_attack_iv',
            'special_defense_iv',
            'speed_iv',
        ];

        foreach ($pokemon as $index => $teamPokemon) {
            if (!is_array($teamPokemon)) {
                $errors["pokemon.$index"] = 'Invalid Pokémon data.';
                continue;
            }

            $slotNumber = filter_var(
                $teamPokemon['slot_number'] ?? null,
                FILTER_VALIDATE_INT
            );

            if (
                $slotNumber === false
                || $slotNumber < 1
                || $slotNumber > 6
            ) {
                $errors["pokemon.$index.slot_number"] =
                    'Slot number must be between 1 and 6.';
            } elseif (in_array($slotNumber, $usedSlots, true)) {
                $errors["pokemon.$index.slot_number"] =
                    'Each Pokémon must use a unique team slot.';
            } else {
                $usedSlots[] = $slotNumber;
            }

            $pokemonApiId = filter_var(
                $teamPokemon['pokemon_api_id'] ?? null,
                FILTER_VALIDATE_INT
            );

            if ($pokemonApiId === false || $pokemonApiId < 1) {
                $errors["pokemon.$index.pokemon_api_id"] =
                    'A valid Pokémon ID is required.';
            }

            $totalEvs = 0;

            foreach ($evFields as $field) {
                $value = filter_var(
                    $teamPokemon[$field] ?? 0,
                    FILTER_VALIDATE_INT
                );

                if (
                    $value === false
                    || $value < 0
                    || $value > 252
                ) {
                    $errors["pokemon.$index.$field"] =
                        'Each EV must be between 0 and 252.';

                    continue;
                }

                $totalEvs += $value;
            }

            if ($totalEvs > 510) {
                $errors["pokemon.$index.evs"] =
                    'A Pokémon cannot have more than 510 total EVs.';
            }

            foreach ($ivFields as $field) {
                $value = filter_var(
                    $teamPokemon[$field] ?? 31,
                    FILTER_VALIDATE_INT
                );

                if (
                    $value === false
                    || $value < 0
                    || $value > 31
                ) {
                    $errors["pokemon.$index.$field"] =
                        'Each IV must be between 0 and 31.';
                }
            }

            foreach ($teamPokemon as $field => $value) {
                if (
                    preg_match('/^move_(\d+)$/', (string) $field, $matches)
                    && (int) $matches[1] > 4
                    && trim((string) $value) !== ''
                ) {
                    $errors["pokemon.$index.moves"] =
                        'A Pokémon cannot have more than four moves.';

                    break;
                }
            }
        }

        return $errors;
    }
}