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

    private const MEGA_DISPLAY_NAMES = [
        'meowstic-male-mega' => 'Mega Meowstic (Male)',
        'meowstic-female-mega' => 'Mega Meowstic (Female)',
        'magearna-original-mega' => 'Mega Magearna (Original Color)',
        'tatsugiri-curly-mega' => 'Mega Tatsugiri (Curly)',
        'tatsugiri-droopy-mega' => 'Mega Tatsugiri (Droopy)',
        'tatsugiri-stretchy-mega' => 'Mega Tatsugiri (Stretchy)',
    ];

    // "samurott-hisui" -> "Hisuian Samurott",
    // "tauros-paldea-combat-breed" -> "Paldean Tauros (Combat Breed)",
    // "charizard-mega-x" -> "Mega Charizard X", "kyogre-primal" -> "Primal Kyogre".
    public static function display(string $name): string
    {
        if (isset(self::MEGA_DISPLAY_NAMES[$name])) {
            return self::MEGA_DISPLAY_NAMES[$name];
        }

        if (preg_match('/^(.+?)-(mega|primal)(?:-([xyz]))?$/', $name, $mega) === 1) {
            $prefix = $mega[2] === 'primal' ? 'Primal' : 'Mega';
            $letter = isset($mega[3]) ? ' ' . strtoupper($mega[3]) : '';

            return $prefix . ' ' . self::capitalizeHyphenatedWords($mega[1]) . $letter;
        }

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
