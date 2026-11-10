<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Controller;
use App\Core\UsageStats;
use App\Models\Team;

final class PageController extends Controller
{
    public function home(): void
    {
        $this->view('home/index', [
            'pageTitle' => 'Brymon Team Builder',
        ]);
    }

    public function about(): void
    {
        $this->view('about/index', [
            'pageTitle' => 'About Brymon',
        ]);
    }

    public function pokedex(): void
    {
        $this->view('pokedex/index', [
            'pageTitle' => 'Pokédex',
        ]);
    }

    public function meta(): void
    {
        $this->view('meta/index', [
            'pageTitle' => 'Meta',
            'formats' => UsageStats::FORMATS,
        ]);
    }

    public function calc(): void
    {
        // Saved teams are private, so an expired session counts as a guest.
        $userId = Auth::activeId();

        $this->view('calc/index', [
            'pageTitle' => 'Damage Calculator',
            // null for guests, who get a sign-in prompt instead.
            'savedTeams' => $userId === null
                ? null
                : array_map(
                    [self::class, 'toCalcTeam'],
                    (new Team())->findAllWithSetsByUserId($userId)
                ),
            // The calculator library is ~500 KB, so only this page loads it.
            'pageScripts' => [
                '/vendor/smogon-calc/data.min.js',
                '/vendor/smogon-calc/calc.min.js',
                '/js/damage-calc.js',
                '/js/damage-calc-page.js',
            ],
            // React + TypeScript, compiled by Vite (see vite.config.mts).
            'viteEntries' => ['resources/ts/calc/main.tsx'],
        ]);
    }

    /**
     * A saved team in the shape damage-calc-page.js reads: the team
     * builder's set format, with stats keyed hp / attack / specialAttack...
     *
     * @param array{id: int, name: string, pokemon: list<array<string, mixed>>} $team
     */
    private static function toCalcTeam(array $team): array
    {
        $stats = [
            'hp' => 'hp',
            'attack' => 'attack',
            'defense' => 'defense',
            'specialAttack' => 'special_attack',
            'specialDefense' => 'special_defense',
            'speed' => 'speed',
        ];

        return [
            'id' => $team['id'],
            'name' => $team['name'],
            'pokemon' => array_map(
                static fn (array $pokemon): array => [
                    'slot' => (int) $pokemon['slot_number'],
                    'nickname' => $pokemon['nickname'] ?? '',
                    'name' => (string) $pokemon['pokemon_name'],
                    'ability' => $pokemon['ability'] ?? '',
                    'item' => $pokemon['item'] ?? '',
                    'nature' => $pokemon['nature'] ?? '',
                    'moves' => [
                        $pokemon['move_1'] ?? '',
                        $pokemon['move_2'] ?? '',
                        $pokemon['move_3'] ?? '',
                        $pokemon['move_4'] ?? '',
                    ],
                    'evs' => array_map(
                        static fn (string $column): int =>
                            (int) ($pokemon["{$column}_ev"] ?? 0),
                        $stats
                    ),
                    'ivs' => array_map(
                        static fn (string $column): int =>
                            (int) ($pokemon["{$column}_iv"] ?? 31),
                        $stats
                    ),
                ],
                $team['pokemon']
            ),
        ];
    }
}