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

    public const FEEDBACK_KINDS = ['bug', 'suggestion'];

    public const FEEDBACK_SUMMARY_MAX = 120;
    public const FEEDBACK_DETAILS_MAX = 3000;
    public const FEEDBACK_EXPECTED_MAX = 2000;
    // Room for a full six-Pokémon Showdown export.
    public const FEEDBACK_ATTACHMENT_MAX = 10000;

    /**
     * A bug report or suggestion, already trimmed by the controller.
     *
     * @param array{
     *     kind: string,
     *     summary: string,
     *     details: string,
     *     expected: string,
     *     attachment: string,
     *     contact_email: string
     * } $feedback
     *
     * @return array<string, string> Field name => message; empty when valid.
     */
    public static function feedback(array $feedback): array
    {
        $errors = [];
        $isBug = $feedback['kind'] === 'bug';

        if (!in_array($feedback['kind'], self::FEEDBACK_KINDS, true)) {
            $errors['kind'] = 'Choose a bug report or a suggestion.';
        }

        if (!self::required($feedback['summary'])) {
            $errors['summary'] = 'Add a short summary.';
        } elseif (!self::maxLength($feedback['summary'], self::FEEDBACK_SUMMARY_MAX)) {
            $errors['summary'] = sprintf(
                'Keep the summary under %d characters.',
                self::FEEDBACK_SUMMARY_MAX
            );
        }

        if (!self::required($feedback['details'])) {
            $errors['details'] = $isBug
                ? 'Describe what happened.'
                : 'Describe your idea.';
        } elseif (!self::maxLength($feedback['details'], self::FEEDBACK_DETAILS_MAX)) {
            $errors['details'] = sprintf(
                'Keep this under %d characters.',
                self::FEEDBACK_DETAILS_MAX
            );
        }

        if (!self::maxLength($feedback['expected'], self::FEEDBACK_EXPECTED_MAX)) {
            $errors['expected'] = sprintf(
                'Keep this under %d characters.',
                self::FEEDBACK_EXPECTED_MAX
            );
        }

        if (!self::maxLength($feedback['attachment'], self::FEEDBACK_ATTACHMENT_MAX)) {
            $errors['attachment'] = sprintf(
                'Pasted text must be under %d characters.',
                self::FEEDBACK_ATTACHMENT_MAX
            );
        }

        if (
            $feedback['contact_email'] !== ''
            && (
                !self::email($feedback['contact_email'])
                || !self::maxLength($feedback['contact_email'], 255)
            )
        ) {
            $errors['contact_email'] = 'Please enter a valid email, or leave it blank.';
        }

        return $errors;
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