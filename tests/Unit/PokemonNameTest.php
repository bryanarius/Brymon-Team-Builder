<?php

declare(strict_types=1);

use App\Core\PokemonName;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

final class PokemonNameTest extends TestCase
{
    public static function names(): array
    {
        return [
            'default form' => ['pikachu', 'Pikachu'],
            'hyphenated species' => ['iron-valiant', 'Iron Valiant'],
            'hisuian form' => ['samurott-hisui', 'Hisuian Samurott'],
            'galarian form' => ['slowking-galar', 'Galarian Slowking'],
            'alolan form' => ['ninetales-alola', 'Alolan Ninetales'],
            'hyphenated species form' => ['mr-mime-galar', 'Galarian Mr Mime'],
            'form with variant' => [
                'tauros-paldea-combat-breed',
                'Paldean Tauros (Combat Breed)',
            ],
            'default variant omitted' => [
                'darmanitan-galar-standard',
                'Galarian Darmanitan',
            ],
            'mega' => ['venusaur-mega', 'Mega Venusaur'],
            'mega with letter' => ['charizard-mega-x', 'Mega Charizard X'],
            'primal' => ['kyogre-primal', 'Primal Kyogre'],
            'mega with species form' => [
                'meowstic-male-mega',
                'Mega Meowstic (Male)',
            ],
            'species containing "mega"' => ['yanmega', 'Yanmega'],
        ];
    }

    #[DataProvider('names')]
    public function testDisplayName(string $name, string $expected): void
    {
        $this->assertSame($expected, PokemonName::display($name));
    }
}
