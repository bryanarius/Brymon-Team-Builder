<?php

declare(strict_types=1);

$pageTitle = $pageTitle ?? 'View Team';

require dirname(__DIR__) . '/layouts/header.php';

$teamPokemon = $team['pokemon'] ?? [];
?>

<section class="saved-teams-page">
    <div class="saved-teams-container">

        <a href="/teams">
            ← Back to Saved Teams
        </a>

        <h1>
            <?= htmlspecialchars(
                (string) $team['name'],
                ENT_QUOTES,
                'UTF-8'
            ) ?>
        </h1>

        <?php if (!empty($team['notes'])): ?>
            <p>
                <?= nl2br(
                    htmlspecialchars(
                        (string) $team['notes'],
                        ENT_QUOTES,
                        'UTF-8'
                    )
                ) ?>
            </p>
        <?php endif; ?>

        <div class="team-pokemon-preview">
            <?php foreach ($teamPokemon as $pokemon): ?>
                <?php
                $pokemonApiId = (int) $pokemon['pokemon_api_id'];
                ?>

                <article class="saved-team-card">
                    <img
                        src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/<?= $pokemonApiId ?>.png"
                        alt="Pokémon #<?= $pokemonApiId ?>"
                    >

                    <h2>
                        <?= htmlspecialchars(
                            $pokemon['nickname']
                                ?: "Pokémon #{$pokemonApiId}",
                            ENT_QUOTES,
                            'UTF-8'
                        ) ?>
                    </h2>

                    <p>
                        Slot <?= (int) $pokemon['slot_number'] ?>
                    </p>

                    <p>
                        Ability:
                        <?= htmlspecialchars(
                            $pokemon['ability'] ?? 'Not selected',
                            ENT_QUOTES,
                            'UTF-8'
                        ) ?>
                    </p>
                </article>
            <?php endforeach; ?>
        </div>

    </div>
</section>

<?php require dirname(__DIR__) . '/layouts/footer.php'; ?>