<?php

declare(strict_types=1);

/**
 * Trainer avatar — a chosen Pokémon sprite, or a lettered fallback.
 *
 * Expects in scope:
 *   $avatarId       ?int    PokéAPI id, or null / 0 for the fallback
 *   $avatarName     string  used for the fallback initial (and img alt)
 *   $avatarModifier string  "card" | "banner" | "profile" (size class)
 */

$avatarModifier = $avatarModifier ?? 'card';
$avatarName = trim((string) ($avatarName ?? ''));
?>
<?php if (!empty($avatarId)): ?>
    <img
        class="avatar avatar--<?= htmlspecialchars(
            $avatarModifier,
            ENT_QUOTES,
            'UTF-8'
        ) ?>"
        loading="lazy"
        alt=""
        src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/<?=
            (int) $avatarId
        ?>.png"
    >
<?php else: ?>
    <span
        class="avatar avatar--<?= htmlspecialchars(
            $avatarModifier,
            ENT_QUOTES,
            'UTF-8'
        ) ?> avatar--placeholder"
        aria-hidden="true"
    ><?= htmlspecialchars(
        mb_strtoupper(mb_substr($avatarName, 0, 1)) ?: '?',
        ENT_QUOTES,
        'UTF-8'
    ) ?></span>
<?php endif; ?>
