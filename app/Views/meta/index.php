<?php

declare(strict_types=1);

$pageTitle = $pageTitle ?? 'Meta';
$formats = $formats ?? [];

require dirname(__DIR__) . '/layouts/header.php';
?>

<main class="meta-page" id="main-content">
    <div class="container">

        <header class="meta-header">
            <p class="eyebrow">Competitive</p>

            <h1>Meta</h1>

            <p class="meta-intro">
                The most-used Pokémon on Pokémon Showdown, from Smogon's
                monthly usage statistics. Pick a Pokémon to see the moves,
                items, and spreads players run on it.
            </p>
        </header>

        <section class="meta-controls" aria-label="Meta filters">

            <div class="form-group">
                <label for="meta-format">Format</label>

                <select id="meta-format">
                    <?php foreach ($formats as $formatId => $formatName): ?>
                        <option value="<?= htmlspecialchars($formatId, ENT_QUOTES, 'UTF-8') ?>">
                            <?= htmlspecialchars($formatName, ENT_QUOTES, 'UTF-8') ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>

            <div class="form-group">
                <label for="meta-search">Search</label>

                <input
                    id="meta-search"
                    type="search"
                    placeholder="Pokémon name"
                    autocomplete="off"
                >
            </div>

        </section>

        <p
            class="meta-status"
            id="meta-status"
            role="status"
            aria-live="polite"
        >
            Loading usage stats...
        </p>

        <div class="meta-layout" id="meta-layout" hidden>

            <section
                class="meta-panel meta-usage-panel"
                aria-labelledby="meta-usage-heading"
            >
                <h2 id="meta-usage-heading" class="visually-hidden">
                    Usage ranking
                </h2>

                <ol class="meta-usage-list" id="meta-usage-list"></ol>
            </section>

            <section
                class="meta-panel meta-detail"
                id="meta-detail"
                aria-live="polite"
                aria-label="Selected Pokémon"
            ></section>

        </div>

        <p class="meta-credit">
            Usage data from
            <a href="https://www.smogon.com/stats/" rel="noopener">Smogon</a>
            via
            <a href="https://pkmn.github.io/smogon/" rel="noopener">pkmn</a>.
            Percentages are weighted toward higher-rated players.
        </p>

    </div>
</main>

<?php require dirname(__DIR__) . '/layouts/footer.php'; ?>
