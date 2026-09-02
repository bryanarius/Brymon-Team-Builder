<?php

declare(strict_types=1);

$pageTitle = $pageTitle ?? 'Pokédex';

require dirname(__DIR__) . '/layouts/header.php';
?>

<main class="pokedex-page">
    <div class="container">

        <header class="pokedex-header">
            <p class="eyebrow">Reference</p>

            <h1>Pokédex</h1>

            <p class="pokedex-intro">
                Browse every Pokémon by type and generation. Use it to
                get a feel for what is out there before building a team.
            </p>
        </header>

        <section class="pokedex-controls" aria-label="Pokédex filters">

            <div class="form-group">
                <label for="pokedex-search">Search</label>

                <input
                    id="pokedex-search"
                    type="search"
                    placeholder="Name or number"
                    autocomplete="off"
                >
            </div>

            <div class="form-group">
                <label for="pokedex-type">Type</label>

                <select id="pokedex-type">
                    <option value="">All types</option>
                </select>
            </div>

            <div class="form-group">
                <label for="pokedex-generation">Generation</label>

                <select id="pokedex-generation">
                    <option value="">All generations</option>
                </select>
            </div>

            <div class="form-group">
                <label for="pokedex-sort">Sort</label>

                <select id="pokedex-sort">
                    <option value="id-asc">Number (low–high)</option>
                    <option value="id-desc">Number (high–low)</option>
                    <option value="name-asc">Name (A–Z)</option>
                    <option value="name-desc">Name (Z–A)</option>
                </select>
            </div>

            <button
                id="pokedex-clear"
                type="button"
                class="button button-secondary pokedex-clear-button"
            >
                Clear
            </button>

        </section>

        <p
            class="pokedex-count"
            id="pokedex-count"
            aria-live="polite"
        ></p>

        <div
            class="pokedex-status"
            id="pokedex-status"
            role="status"
            aria-live="polite"
        >
            Loading Pokédex…
        </div>

        <div
            class="pokedex-grid"
            id="pokedex-grid"
            aria-live="polite"
        ></div>

    </div>
</main>

<?php require dirname(__DIR__) . '/layouts/footer.php'; ?>
