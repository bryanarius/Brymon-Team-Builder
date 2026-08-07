<?php

declare(strict_types=1);

$pageTitle = $pageTitle ?? 'View Team';

require dirname(__DIR__) . '/layouts/header.php';

$teamPokemon = $team['pokemon'] ?? [];
?>

<section class="team-detail-page">
    <div class="team-detail-container">

        <a class="team-detail-back-link" href="/teams">
            ← Back to Saved Teams
        </a>

        <header class="team-detail-header">
            <h1>
                <?= htmlspecialchars(
                    (string) $team['name'],
                    ENT_QUOTES,
                    'UTF-8'
                ) ?>
            </h1>

            <?php if (!empty($team['notes'])): ?>
                <p class="team-detail-notes">
                    <?= nl2br(
                        htmlspecialchars(
                            (string) $team['notes'],
                            ENT_QUOTES,
                            'UTF-8'
                        )
                    ) ?>
                </p>
            <?php endif; ?>

            <div class="team-detail-actions">
                <a
                    href="/teams/<?= (int) $team['id'] ?>/edit"
                    class="team-detail-edit-button"
                >
                    Edit Team
                </a>

                <form
                    action="/teams/<?= (int) $team['id'] ?>/delete"
                    method="POST"
                    class="delete-team-form"
                >
                    <input
                        type="hidden"
                        name="csrf_token"
                        value="<?= htmlspecialchars(
                            \App\Core\Csrf::token(),
                            ENT_QUOTES,
                            'UTF-8'
                        ) ?>"
                    >

                    <button
                        type="submit"
                        class="delete-team-button"
                    >
                        Delete Team
                    </button>
                </form>
            </div>
        </header>

        <div class="team-detail-pokemon-grid">
            <?php foreach ($teamPokemon as $pokemon): ?>
                <?php
                $pokemonApiId = (int) $pokemon['pokemon_api_id'];

                $pokemonName = trim(
                    (string) ($pokemon['pokemon_name'] ?? '')
                );

                $nickname = trim(
                    (string) ($pokemon['nickname'] ?? '')
                );

                $formattedPokemonName = $pokemonName !== ''
                    ? ucwords(str_replace('-', ' ', $pokemonName))
                    : 'Pokémon #' . $pokemonApiId;

                $displayName = $nickname !== ''
                    ? $nickname
                    : $formattedPokemonName;
                ?>

                <article
                class="team-detail-pokemon-card"
                data-pokemon-id="<?= $pokemonApiId ?>"
                >
                    <img
                        class="team-detail-pokemon-image"
                        src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/<?= $pokemonApiId ?>.png"
                        alt="<?= htmlspecialchars(
                            $formattedPokemonName,
                            ENT_QUOTES,
                            'UTF-8'
                        ) ?>"
                    >

                    <div class="team-detail-pokemon-content">
                        <h2>
                            <?= htmlspecialchars(
                                $displayName,
                                ENT_QUOTES,
                                'UTF-8'
                            ) ?>
                        </h2>

                        <?php if ($nickname !== '' && $pokemonName !== ''): ?>
                            <p class="pokemon-species">
                                <?= htmlspecialchars(
                                    $formattedPokemonName,
                                    ENT_QUOTES,
                                    'UTF-8'
                                ) ?>
                            </p>
                        <?php endif; ?>

                        <p class="team-detail-slot">
                            Slot <?= (int) $pokemon['slot_number'] ?>
                        </p>

                        <p class="team-detail-ability">
                            <strong>Ability:</strong>
                            <?= htmlspecialchars(
                                $pokemon['ability'] ?? 'Not selected',
                                ENT_QUOTES,
                                'UTF-8'
                            ) ?>
                        </p>
                    </div>
                </article>
            <?php endforeach; ?>
        </div>

        <section class="team-analysis" id="team-analysis">
            <div class="team-analysis-header">
                <h2>Team Analysis</h2>

                <p>
                    Review your team’s shared weaknesses,
                    immunities, and type distribution.
                </p>
            </div>

            <div
                class="team-analysis-status"
                id="team-analysis-status"
                role="status"
                aria-live="polite"
            >
                Loading team analysis...
            </div>

            <div
                class="team-analysis-content"
                id="team-analysis-content"
                hidden
            >
                <article class="team-analysis-summary">
                    <div class="team-analysis-summary-header">
                        <h3>Summary</h3>

                        <span class="team-analysis-summary-label">
                            Key Findings
                        </span>
                    </div>

                    <ul
                        class="team-analysis-summary-list"
                        id="team-analysis-summary-list"
                    ></ul>
                </article>
                <article class="team-analysis-card">
                    <h3>Shared Weaknesses</h3>

                    <div
                        class="analysis-type-list"
                        id="analysis-weaknesses"
                    ></div>
                </article>

                <article class="team-analysis-card">
                    <h3>Immunities</h3>

                    <div
                        class="analysis-type-list"
                        id="analysis-immunities"
                    ></div>
                </article>

                <article class="team-analysis-card">
                    <h3>Team Types</h3>

                    <div
                        class="analysis-type-list"
                        id="analysis-team-types"
                    ></div>
                </article>
            </div>
        </section>

    </div>
</section>

<?php require dirname(__DIR__) . '/layouts/footer.php'; ?>