<?php

declare(strict_types=1);

/**
 * Shared public-team card.
 *
 * Expects $team in scope (id, name, pokemon, pokemon_count, like_count,
 * and username when $showOwner is true). Set $showOwner = false to hide
 * the "by <trainer>" line (e.g. on that trainer's own profile page).
 *
 * @var array<string, mixed> $team
 */

$showOwner = $showOwner ?? true;
?>
<li class="team-card">
    <a class="team-card-link" href="/p/<?= (int) $team['id'] ?>">
        <div class="team-card-sprites">
            <?php foreach ($team['pokemon'] ?? [] as $cardPokemon): ?>
                <img
                    class="team-card-sprite"
                    loading="lazy"
                    width="48"
                    height="48"
                    src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/<?=
                        (int) $cardPokemon['pokemon_api_id']
                    ?>.png"
                    alt="<?= htmlspecialchars(
                        ucwords(str_replace(
                            '-',
                            ' ',
                            (string) ($cardPokemon['pokemon_name'] ?? '')
                        )),
                        ENT_QUOTES,
                        'UTF-8'
                    ) ?>"
                >
            <?php endforeach; ?>
        </div>

        <h3 class="team-card-name"><?= htmlspecialchars(
            (string) $team['name'],
            ENT_QUOTES,
            'UTF-8'
        ) ?></h3>
    </a>

    <p class="team-card-meta">
        <?php if ($showOwner && !empty($team['username'])): ?>
            by <a
                class="team-card-author"
                href="/u/<?= rawurlencode((string) $team['username']) ?>"
            ><?= htmlspecialchars(
                (string) $team['username'],
                ENT_QUOTES,
                'UTF-8'
            ) ?></a>
            &middot;
        <?php endif; ?>
        <?= (int) $team['pokemon_count'] ?> Pokémon
        &middot; <?= (int) $team['like_count'] ?> likes
    </p>
</li>
