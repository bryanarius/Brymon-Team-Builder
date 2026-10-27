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
        ];
    }

    #[DataProvider('names')]
    public function testDisplayName(string $name, string $expected): void
    {
        $this->assertSame($expected, PokemonName::display($name));
    }
}
