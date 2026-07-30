<?php

declare(strict_types=1);

$pageTitle = $pageTitle ?? 'Team Builder';

$errors = $errors ?? [];
$old = $old ?? [];

require dirname(__DIR__) . '/layouts/header.php';
?>

<section class="team-builder-page">

    <div class="container">

        <?php if (!empty($errors['form'])): ?>
            <div class="alert error" role="alert">
                <?= htmlspecialchars($errors['form']) ?>
            </div>
        <?php endif; ?>

        <form
            action="/teambuilder"
            method="POST"
            class="team-builder-form"
        >

            <div class="team-builder-layout">

                <!-- =====================================================
                     Left Sidebar: Pokémon Browser
                ====================================================== -->

                <aside class="pokemon-browser">

                    <section class="builder-panel pokemon-search-panel">

                        <header class="panel-header">
                            <h2>Pokémon Search</h2>
                        </header>

                        <div class="pokemon-browser-filters">

                            <div class="form-group">

                                <label for="pokemon-generation">
                                    Generation
                                </label>

                                <select id="pokemon-generation">
                                    <option value="">All</option>
                                </select>

                            </div>

                            <div class="form-group">

                                <label for="pokemon-type">
                                    Type
                                </label>

                                <select id="pokemon-type">
                                    <option value="">All</option>
                                </select>

                            </div>

                            <div class="form-group">

                                <label for="pokemon-sort">
                                    Sort By
                                </label>

                                <select id="pokemon-sort">
                                    <option value="name-asc">
                                        Name (A–Z)
                                    </option>
                                </select>

                            </div>

                        <div class="form-group">

                            <label for="pokemon-search">
                                Search Pokémon
                            </label>

                            <input
                                id="pokemon-search"
                                type="search"
                                placeholder="Search Pokémon..."
                                autocomplete="off"
                            >

                        </div>

                        <button
                            id="clear-pokemon-filters"
                            type="button"
                            class="button button-secondary clear-filters-button"
                        >
                            Clear Filters
                        </button>

                        </div>

                        <div class="pokemon-list-header">

                            <h3>Pokémon List</h3>

                            <span
                                class="pokemon-result-count"
                                id="pokemon-result-count"
                                aria-live="polite"
                            >
                                0 results
                            </span>

                        </div>

                        <div
                            class="pokemon-search-results"
                            id="pokemon-search-results"
                            aria-live="polite"
                            aria-busy="false"
                        >
                            <div class="pokemon-search-empty">
                                <span
                                    class="search-empty-icon"
                                    aria-hidden="true"
                                >
                                    ?
                                </span>

                                <h3>Find a Pokémon</h3>

                                <p>
                                    Start typing a Pokémon name to see matching results.
                                </p>
                            </div>
                        </div>

                    </section>

                </aside>

                <!-- =====================================================
                     Center: Team Workspace
                ====================================================== -->

                <main class="builder-workspace">

                    <header class="team-builder-topbar">

                        <div>
                            <h1>My Team</h1>

                            <p>
                                Build and configure your Pokémon team.
                            </p>
                        </div>

                        <button
                            class="button button-primary"
                            type="submit"
                        >
                            Save Team
                        </button>

                    </header>

                    <!-- Team name is required by TeamController::save() -->

                    <div class="form-group team-name-field">

                        <label for="name">
                            Team Name
                        </label>

                        <input
                            id="name"
                            name="name"
                            type="text"
                            maxlength="100"
                            value="<?= htmlspecialchars($old['name'] ?? '') ?>"
                            placeholder="Enter a team name"
                            required
                        >

                        <?php if (!empty($errors['name'])): ?>
                            <p class="field-error">
                                <?= htmlspecialchars($errors['name']) ?>
                            </p>
                        <?php endif; ?>

                    </div>

                    <!-- Team slots -->

                    <section
                        class="team-preview"
                        aria-labelledby="team-slots-heading"
                    >

                        <h2
                            id="team-slots-heading"
                            class="visually-hidden"
                        >
                            Team Slots
                        </h2>

                        <div class="team-slots">

                            <?php for ($slot = 1; $slot <= 6; $slot++): ?>

                                <button
                                    type="button"
                                    class="team-slot"
                                    data-slot="<?= $slot ?>"
                                    data-populated="false"
                                    aria-label="Add Pokémon to slot <?= $slot ?>"
                                >

                                    <span class="slot-index">
                                        <?= $slot ?>
                                    </span>

                                    <span
                                        class="slot-plus"
                                        aria-hidden="true"
                                    >
                                        +
                                    </span>

                                    <span class="slot-number">
                                        Add Pokémon
                                    </span>

                                </button>

                            <?php endfor; ?>

                        </div>

                    </section>

                    <!-- =================================================
                         Selected Pokémon Configuration
                    ================================================== -->

                    <section
                        class="builder-panel selected-pokemon-panel"
                        id="selected-pokemon-panel"
                        aria-labelledby="selected-pokemon-heading"
                    >

                        <header class="selected-pokemon-heading">

                            <h2 id="selected-pokemon-heading">
                                Selected Pokémon
                            </h2>

                            <p>
                                Choose a Pokémon from your team to configure it.
                            </p>

                        </header>

                        <!-- Visible when no populated team slot is selected -->

                        <div
                            class="selected-pokemon-empty"
                            id="selected-pokemon-empty"
                        >

                            <span
                                class="selected-empty-icon"
                                aria-hidden="true"
                            >
                                +
                            </span>

                            <h3>No Pokémon selected</h3>

                            <p>
                                Add a Pokémon to your team, then select its
                                slot to configure it.
                            </p>

                        </div>

                        <!-- Hidden until a populated slot is selected -->

                        <div
                            class="selected-pokemon-editor"
                            id="selected-pokemon-editor"
                            hidden
                        >

                            <div class="selected-pokemon-overview">

                                <img
                                    id="selected-pokemon-image"
                                    src=""
                                    alt=""
                                    width="120"
                                    height="120"
                                >

                                <h3 id="selected-pokemon-name">
                                    Pokémon Name
                                </h3>

                                <span id="selected-pokemon-number">
                                    #000
                                </span>

                                <div
                                    class="selected-pokemon-types"
                                    id="selected-pokemon-types"
                                ></div>

                            </div>

                            <div class="selected-pokemon-fields">

                                <input
                                    id="selected-slot"
                                    name="selected_slot"
                                    type="hidden"
                                    value=""
                                >

                                <input
                                    id="selected-pokemon-id"
                                    name="selected_pokemon_id"
                                    type="hidden"
                                    value=""
                                >

                                <div class="selected-fields-grid">

                                    <div class="form-group">

                                        <label for="pokemon-nickname">
                                            Nickname
                                        </label>

                                        <input
                                            id="pokemon-nickname"
                                            name="pokemon_nickname"
                                            type="text"
                                            maxlength="100"
                                            placeholder="Enter nickname"
                                        >

                                    </div>

                                    <div class="form-group">

                                        <label for="pokemon-ability">
                                            Ability
                                        </label>

                                        <select
                                            id="pokemon-ability"
                                            name="pokemon_ability"
                                        >
                                            <option value="">
                                                Select ability
                                            </option>
                                        </select>

                                    </div>

                                    <div class="form-group">

                                        <label for="pokemon-item">
                                            Held Item
                                        </label>

                                        <select
                                            id="pokemon-item"
                                            name="pokemon_item"
                                        >
                                            <option value="">
                                                Select item
                                            </option>
                                        </select>

                                    </div>

                                    <div class="form-group">

                                        <label for="pokemon-nature">
                                            Nature
                                        </label>

                                        <select
                                            id="pokemon-nature"
                                            name="pokemon_nature"
                                        >
                                            <option value="">
                                                Select nature
                                            </option>
                                        </select>

                                    </div>

                                </div>

                                <fieldset class="pokemon-moves">

                                    <legend>Moves</legend>

                                    <div class="move-grid">

                                        <?php for ($move = 1; $move <= 4; $move++): ?>

                                            <div class="form-group">

                                                <label
                                                    class="visually-hidden"
                                                    for="pokemon-move-<?= $move ?>"
                                                >
                                                    Move <?= $move ?>
                                                </label>

                                                <select
                                                    id="pokemon-move-<?= $move ?>"
                                                    name="pokemon_moves[]"
                                                >
                                                    <option value="">
                                                        Move <?= $move ?>
                                                    </option>
                                                </select>

                                            </div>

                                        <?php endfor; ?>

                                    </div>

                                </fieldset>

                                <button
                                    type="button"
                                    class="button delete-pokemon-button"
                                    id="delete-pokemon-button"
                                >
                                    Delete Pokémon
                                </button>

                            </div>

                            <aside class="selected-pokemon-stats">

                                <h3>Base Stats</h3>

                                <dl>

                                    <div>
                                        <dt>HP</dt>
                                        <dd id="stat-hp">—</dd>
                                    </div>

                                    <div>
                                        <dt>ATK</dt>
                                        <dd id="stat-attack">—</dd>
                                    </div>

                                    <div>
                                        <dt>DEF</dt>
                                        <dd id="stat-defense">—</dd>
                                    </div>

                                    <div>
                                        <dt>SP ATK</dt>
                                        <dd id="stat-special-attack">—</dd>
                                    </div>

                                    <div>
                                        <dt>SP DEF</dt>
                                        <dd id="stat-special-defense">—</dd>
                                    </div>

                                    <div>
                                        <dt>SPD</dt>
                                        <dd id="stat-speed">—</dd>
                                    </div>

                                </dl>

                            </aside>

                        </div>

                    </section>

                </main>

                <!-- =====================================================
                     Right Sidebar: Team Summary
                ====================================================== -->

                <aside class="team-summary-sidebar">

                    <section class="builder-panel team-summary-panel">

                        <header class="panel-header">
                            <h2>Team Summary</h2>
                        </header>

                        <div class="team-overview">

                            <h3>Team Overview</h3>

                            <dl>

                                <div>
                                    <dt>Pokémon</dt>

                                    <dd id="summary-pokemon-count">
                                        0/6
                                    </dd>
                                </div>

                                <div>
                                    <dt>Types</dt>

                                    <dd id="summary-team-types">
                                        —
                                    </dd>
                                </div>

                            </dl>

                        </div>

                        <div class="team-notes-group">

                            <label for="notes">
                                Team Notes
                            </label>

                            <textarea
                                id="notes"
                                name="notes"
                                maxlength="1000"
                                placeholder="Add notes about your team..."
                            ><?= htmlspecialchars($old['notes'] ?? '') ?></textarea>

                            <?php if (!empty($errors['notes'])): ?>
                                <p class="field-error">
                                    <?= htmlspecialchars($errors['notes']) ?>
                                </p>
                            <?php endif; ?>

                        </div>

                        <a
                            href="/teams"
                            class="button button-secondary"
                        >
                            Cancel
                        </a>

                    </section>

                </aside>

            </div>

        </form>

    </div>

</section>

<?php require dirname(__DIR__) . '/layouts/footer.php'; ?>