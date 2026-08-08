<?php

declare(strict_types=1);

use App\Core\Validator;
use PHPUnit\Framework\TestCase;

final class ValidatorTest extends TestCase
{
    private function validPokemon(): array
    {
        return [
            'slot_number' => 1,
            'pokemon_api_id' => 25,

            'hp_ev' => 0,
            'attack_ev' => 252,
            'defense_ev' => 0,
            'special_attack_ev' => 0,
            'special_defense_ev' => 4,
            'speed_ev' => 252,

            'hp_iv' => 31,
            'attack_iv' => 31,
            'defense_iv' => 31,
            'special_attack_iv' => 31,
            'special_defense_iv' => 31,
            'speed_iv' => 31,

            'move_1' => 'thunderbolt',
            'move_2' => '',
            'move_3' => '',
            'move_4' => '',
        ];
    }

    public function testValidPokemonPassesValidation(): void
    {
        $errors = Validator::pokemonTeam([
            $this->validPokemon(),
        ]);

        $this->assertSame([], $errors);
    }

    public function testEvCannotExceed252(): void
    {
        $pokemon = $this->validPokemon();

        $pokemon['attack_ev'] = 253;

        $errors = Validator::pokemonTeam([$pokemon]);

        $this->assertArrayHasKey(
            'pokemon.0.attack_ev',
            $errors
        );
    }

    public function testIvCannotExceed31(): void
    {
        $pokemon = $this->validPokemon();

        $pokemon['hp_iv'] = 32;

        $errors = Validator::pokemonTeam([$pokemon]);

        $this->assertArrayHasKey(
            'pokemon.0.hp_iv',
            $errors
        );
    }

    public function testTotalEvsCannotExceed510(): void
    {
        $pokemon = $this->validPokemon();

        $pokemon['hp_ev'] = 252;
        $pokemon['attack_ev'] = 252;
        $pokemon['speed_ev'] = 252;

        $errors = Validator::pokemonTeam([$pokemon]);

        $this->assertArrayHasKey(
            'pokemon.0.evs',
            $errors
        );
    }

    public function testDuplicateSlotsAreRejected(): void
    {
        $first = $this->validPokemon();
        $second = $this->validPokemon();

        $second['slot_number'] = 1;
        $second['pokemon_api_id'] = 6;

        $errors = Validator::pokemonTeam([
            $first,
            $second,
        ]);

        $this->assertArrayHasKey(
            'pokemon.1.slot_number',
            $errors
        );
    }
}