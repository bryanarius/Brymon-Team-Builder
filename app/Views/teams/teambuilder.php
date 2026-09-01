<?php

declare(strict_types=1);

$pageTitle = $pageTitle ?? 'Team Builder';

$errors = $errors ?? [];
$old = $old ?? [];
$team = $team ?? null;
$isEditing = $isEditing ?? false;

$initialTeamData = $team !== null
    ? [
        'id' => (int) $team['id'],
        'name' => (string) $team['name'],
        'notes' => (string) ($team['notes'] ?? ''),
        'pokemon' => $team['pokemon'] ?? [],
    ]
    : null;

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
                action="/teams"
                method="POST"
                id="team-builder-form"
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
                                    <option value="name-asc">Name (A-Z)</option>
                                    <option value="name-desc">Name (Z-A)</option>
                                    <option value="id-asc">Number (Low-High)</option>
                                    <option value="id-desc">Number (High-Low)</option>
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

                        <div class="team-builder-actions">
                        <button
                            class="button button-primary team-builder-action"
                            id="save-team-button"
                            type="submit"
                        >
                            Save Team
                        </button>

                        <button
                            type="button"
                            class="button button-secondary team-builder-action"
                            id="export-showdown-button"
                        >
                            Export Showdown
                        </button>

                        <button
                            type="button"
                            class="button button-secondary team-builder-action"
                            id="import-showdown-button"
                        >
                            Import Showdown
                        </button>
                        </div>
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

                                        <div class="combobox">
                                            <input
                                                type="text"
                                                id="pokemon-item"
                                                name="pokemon_item"
                                                placeholder="Search items"
                                            >
                                            <ul
                                                class="combobox-list"
                                                role="listbox"
                                                aria-label="Held item options"
                                                hidden
                                            ></ul>
                                        </div>

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

                                                <div class="combobox">
                                                    <input
                                                        type="text"
                                                        id="pokemon-move-<?= $move ?>"
                                                        name="pokemon_moves[]"
                                                        placeholder="Move <?= $move ?>"
                                                    >
                                                    <ul
                                                        class="combobox-list"
                                                        role="listbox"
                                                        aria-label="Move <?= $move ?> options"
                                                        hidden
                                                    ></ul>
                                                </div>

                                            </div>

                                        <?php endfor; ?>

                                    </div>

                                </fieldset>

                                <!-- =================================================
                                    Effort Values
                                ================================================== -->

                                <fieldset class="pokemon-values pokemon-evs">

                                    <div class="pokemon-values-header">

                                        <legend>Effort Values</legend>

                                        <span id="ev-total">
                                            0 / 510 EVs
                                        </span>

                                    </div>

                                    <p class="pokemon-values-description">
                                        Each stat can have up to 252 EVs, with a maximum of
                                        510 total EVs.
                                    </p>

                                    <div class="pokemon-values-grid">

                                        <div class="form-group">

                                            <label for="pokemon-hp-ev">
                                                HP
                                            </label>

                                            <input
                                                id="pokemon-hp-ev"
                                                name="hp_ev"
                                                type="number"
                                                min="0"
                                                max="252"
                                                step="1"
                                                value="0"
                                                inputmode="numeric"
                                            >

                                        </div>

                                        <div class="form-group">

                                            <label for="pokemon-attack-ev">
                                                Attack
                                            </label>

                                            <input
                                                id="pokemon-attack-ev"
                                                name="attack_ev"
                                                type="number"
                                                min="0"
                                                max="252"
                                                step="1"
                                                value="0"
                                                inputmode="numeric"
                                            >

                                        </div>

                                        <div class="form-group">

                                            <label for="pokemon-defense-ev">
                                                Defense
                                            </label>

                                            <input
                                                id="pokemon-defense-ev"
                                                name="defense_ev"
                                                type="number"
                                                min="0"
                                                max="252"
                                                step="1"
                                                value="0"
                                                inputmode="numeric"
                                            >

                                        </div>

                                        <div class="form-group">

                                            <label for="pokemon-special-attack-ev">
                                                Special Attack
                                            </label>

                                            <input
                                                id="pokemon-special-attack-ev"
                                                name="special_attack_ev"
                                                type="number"
                                                min="0"
                                                max="252"
                                                step="1"
                                                value="0"
                                                inputmode="numeric"
                                            >

                                        </div>

                                        <div class="form-group">

                                            <label for="pokemon-special-defense-ev">
                                                Special Defense
                                            </label>

                                            <input
                                                id="pokemon-special-defense-ev"
                                                name="special_defense_ev"
                                                type="number"
                                                min="0"
                                                max="252"
                                                step="1"
                                                value="0"
                                                inputmode="numeric"
                                            >

                                        </div>

                                        <div class="form-group">

                                            <label for="pokemon-speed-ev">
                                                Speed
                                            </label>

                                            <input
                                                id="pokemon-speed-ev"
                                                name="speed_ev"
                                                type="number"
                                                min="0"
                                                max="252"
                                                step="1"
                                                value="0"
                                                inputmode="numeric"
                                            >

                                        </div>

                                    </div>

                                    <p
                                        class="field-error"
                                        id="ev-total-error"
                                        hidden
                                    >
                                        Total EVs cannot exceed 510.
                                    </p>

                                </fieldset>

                                <!-- =================================================
                                    Individual Values
                                ================================================== -->

                                <fieldset class="pokemon-values pokemon-ivs">

                                    <div class="pokemon-values-header">

                                        <legend>Individual Values</legend>

                                        <button
                                            type="button"
                                            class="iv-reset-button"
                                            id="reset-ivs-button"
                                        >
                                            Reset to 31
                                        </button>

                                    </div>

                                    <p class="pokemon-values-description">
                                        IVs range from 0 to 31 for each stat.
                                    </p>

                                    <div class="pokemon-values-grid">

                                        <div class="form-group">

                                            <label for="pokemon-hp-iv">
                                                HP
                                            </label>

                                            <input
                                                id="pokemon-hp-iv"
                                                name="hp_iv"
                                                type="number"
                                                min="0"
                                                max="31"
                                                step="1"
                                                value="31"
                                                inputmode="numeric"
                                            >

                                        </div>

                                        <div class="form-group">

                                            <label for="pokemon-attack-iv">
                                                Attack
                                            </label>

                                            <input
                                                id="pokemon-attack-iv"
                                                name="attack_iv"
                                                type="number"
                                                min="0"
                                                max="31"
                                                step="1"
                                                value="31"
                                                inputmode="numeric"
                                            >

                                        </div>

                                        <div class="form-group">

                                            <label for="pokemon-defense-iv">
                                                Defense
                                            </label>

                                            <input
                                                id="pokemon-defense-iv"
                                                name="defense_iv"
                                                type="number"
                                                min="0"
                                                max="31"
                                                step="1"
                                                value="31"
                                                inputmode="numeric"
                                            >

                                        </div>

                                        <div class="form-group">

                                            <label for="pokemon-special-attack-iv">
                                                Special Attack
                                            </label>

                                            <input
                                                id="pokemon-special-attack-iv"
                                                name="special_attack_iv"
                                                type="number"
                                                min="0"
                                                max="31"
                                                step="1"
                                                value="31"
                                                inputmode="numeric"
                                            >

                                        </div>

                                        <div class="form-group">

                                            <label for="pokemon-special-defense-iv">
                                                Special Defense
                                            </label>

                                            <input
                                                id="pokemon-special-defense-iv"
                                                name="special_defense_iv"
                                                type="number"
                                                min="0"
                                                max="31"
                                                step="1"
                                                value="31"
                                                inputmode="numeric"
                                            >

                                        </div>

                                        <div class="form-group">

                                            <label for="pokemon-speed-iv">
                                                Speed
                                            </label>

                                            <input
                                                id="pokemon-speed-iv"
                                                name="speed_iv"
                                                type="number"
                                                min="0"
                                                max="31"
                                                step="1"
                                                value="31"
                                                inputmode="numeric"
                                            >

                                        </div>

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

        <dialog
        class="showdown-dialog"
        id="import-showdown-dialog"
        >
            <form method="dialog" class="showdown-dialog-content">
                <div class="showdown-dialog-header">
                <div>
                    <h2>Import from Pokémon Showdown</h2>
                    <p>
                    Paste a Showdown team below. Importing will replace
                    the current Pokémon slots.
                    </p>
                </div>

                <button
                    type="submit"
                    class="showdown-dialog-close"
                    aria-label="Close import dialog"
                >
                    ×
                </button>
                </div>

                <label for="showdown-import-text">
                Showdown team
                </label>

                <textarea
                id="showdown-import-text"
                rows="18"
                placeholder="Paste your Pokémon Showdown team here..."
                ></textarea>

                <div class="showdown-dialog-actions">
                <button
                    type="submit"
                    class="button button-secondary"
                >
                    Cancel
                </button>

                <button
                    type="button"
                    class="button button-primary"
                    id="confirm-showdown-import"
                >
                    Import Team
                </button>
                </div>
            </form>
        </dialog>

    </div>

</section>

<script>
    window.BRYMON_INITIAL_TEAM = <?= json_encode(
        $initialTeamData,
        JSON_UNESCAPED_SLASHES
        | JSON_UNESCAPED_UNICODE
        | JSON_HEX_TAG
        | JSON_HEX_AMP
        | JSON_HEX_APOS
        | JSON_HEX_QUOT
    ) ?>;

    window.BRYMON_IS_EDITING = <?= $isEditing ? 'true' : 'false' ?>;

    window.BRYMON_CSRF_TOKEN = <?= json_encode(
        \App\Core\Csrf::token(),
        JSON_HEX_TAG
        | JSON_HEX_AMP
        | JSON_HEX_APOS
        | JSON_HEX_QUOT
    ) ?>;
</script>

<?php require dirname(__DIR__) . '/layouts/footer.php'; ?>