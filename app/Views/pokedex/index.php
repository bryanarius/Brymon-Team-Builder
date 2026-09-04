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

    <div
        class="pokedex-detail-backdrop"
        id="pokedex-detail-backdrop"
        hidden
    ></div>

    <aside
        class="pokedex-detail"
        id="pokedex-detail"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pokedex-detail-name"
        hidden
    >
        <div class="pokedex-detail-header">
            <button
                type="button"
                class="pokedex-detail-close"
                id="pokedex-detail-close"
                aria-label="Close details"
            >&times;</button>
        </div>

        <div
            class="pokedex-detail-status"
            id="pokedex-detail-status"
            role="status"
        >
            Loading…
        </div>

        <div
            class="pokedex-detail-body"
            id="pokedex-detail-body"
            hidden
        >
            <p class="pokedex-detail-number" id="pokedex-detail-number"></p>

            <img
                class="pokedex-detail-artwork"
                id="pokedex-detail-artwork"
                alt=""
                width="220"
                height="220"
            >

            <h2 class="pokedex-detail-name" id="pokedex-detail-name"></h2>

            <div
                class="pokedex-detail-types"
                id="pokedex-detail-types"
            ></div>

            <p
                class="pokedex-detail-flavor"
                id="pokedex-detail-flavor"
            ></p>

            <dl
                class="pokedex-detail-measurements"
                id="pokedex-detail-measurements"
            ></dl>

            <section class="pokedex-detail-section">
                <h3>Base stats</h3>

                <div
                    class="pokedex-stat-list"
                    id="pokedex-detail-stats"
                ></div>
            </section>

            <section class="pokedex-detail-section">
                <h3>Abilities</h3>

                <div
                    class="pokedex-ability-list"
                    id="pokedex-detail-abilities"
                ></div>
            </section>

            <section class="pokedex-detail-section">
                <h3>Evolution</h3>

                <div
                    class="pokedex-evolution-chain"
                    id="pokedex-detail-evolution"
                ></div>
            </section>

            <section
                class="pokedex-detail-section"
                id="pokedex-detail-mega-section"
                hidden
            >
                <h3>Mega Evolution</h3>

                <div
                    class="pokedex-evolution-chain"
                    id="pokedex-detail-mega"
                ></div>
            </section>
        </div>
    </aside>
</main>

<?php require dirname(__DIR__) . '/layouts/footer.php'; ?>
