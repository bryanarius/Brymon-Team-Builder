<?php

declare(strict_types=1);

namespace App\Core;

/**
 * Display names for stored PokéAPI resource names.
 *
 * Mirrors formatPokemonDisplayName() in public/js/pokemon-forms.js so that
 * server-rendered pages and the builder name a Pokémon the same way. Keep
 * the two in sync.
 */
class PokemonName
{
    private const REGIONAL_FORM_ADJECTIVES = [
        'alola' => 'Alolan',
        'galar' => 'Galarian',
        'hisui' => 'Hisuian',
        'paldea' => 'Paldean',
    ];

    private const DEFAULT_FORM_VARIANTS = ['standard'];

    // "samurott-hisui" -> "Hisuian Samurott",
    // "tauros-paldea-combat-breed" -> "Paldean Tauros (Combat Breed)".
    public static function display(string $name): string
    {
        $matched = preg_match(
            '/^(.+?)-(alola|galar|hisui|paldea)(?:-(.+))?$/',
            $name,
            $matches
        );

        if ($matched !== 1) {
            return self::capitalizeHyphenatedWords($name);
        }

        $displayName = self::REGIONAL_FORM_ADJECTIVES[$matches[2]] . ' '
            . self::capitalizeHyphenatedWords($matches[1]);

        $variant = $matches[3] ?? '';

        if ($variant === '' || in_array($variant, self::DEFAULT_FORM_VARIANTS, true)) {
            return $displayName;
        }

        return $displayName . ' (' . self::capitalizeHyphenatedWords($variant) . ')';
    }

    private static function capitalizeHyphenatedWords(string $value): string
    {
        return ucwords(str_replace('-', ' ', $value));
    }
}
