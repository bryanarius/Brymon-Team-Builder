<?php

declare(strict_types=1);

$pageTitle = $pageTitle ?? 'Damage Calculator';
$savedTeams = $savedTeams ?? null;

$sides = [
    'attacker' => 'Attacker',
    'defender' => 'Defender',
];

$stats = [
    'hp' => 'HP',
    'attack' => 'Atk',
    'defense' => 'Def',
    'specialAttack' => 'SpA',
    'specialDefense' => 'SpD',
    'speed' => 'Spe',
];

$statuses = [
    '' => 'Healthy',
    'brn' => 'Burned',
    'par' => 'Paralyzed',
    'psn' => 'Poisoned',
    'tox' => 'Badly poisoned',
    'slp' => 'Asleep',
    'frz' => 'Frozen',
];

$teraTypes = [
    'Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice', 'Fighting',
    'Poison', 'Ground', 'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost',
    'Dragon', 'Dark', 'Steel', 'Fairy', 'Stellar',
];

require dirname(__DIR__) . '/layouts/header.php';
?>

<main class="calc-page" id="main-content">
    <div class="container">

        <header class="calc-header">
            <p class="eyebrow">Competitive</p>

            <h1>Damage Calculator</h1>

            <p class="calc-intro">
                See how much damage the attacker's moves do to the defender,
                as a percentage of its HP. Damage has a random roll, so each
                move shows a range, and how many hits it takes to knock the
                defender out.
            </p>
        </header>

        <section
            class="calc-panel calc-results"
            aria-labelledby="calc-results-heading"
        >
            <header class="calc-results-header">
                <h2 id="calc-results-heading">Results</h2>

                <button
                    type="button"
                    class="calc-swap-button"
                    id="calc-swap"
                >
                    ⇄ Swap attacker and defender
                </button>
            </header>

            <div id="calc-results" aria-live="polite">
                <p class="calc-message">Loading the calculator...</p>
            </div>
        </section>

        <div class="calc-sides">
            <?php foreach ($sides as $side => $sideTitle): ?>
                <section
                    class="calc-panel calc-side"
                    id="calc-<?= $side ?>"
                    data-side="<?= $side ?>"
                    aria-labelledby="calc-<?= $side ?>-heading"
                >
                    <header class="calc-side-header">
                        <h2 id="calc-<?= $side ?>-heading"><?= $sideTitle ?></h2>

                        <div
                            class="calc-types"
                            id="calc-<?= $side ?>-types"
                        ></div>
                    </header>

                    <?php if ($savedTeams === null): ?>
                        <p class="calc-saved-hint">
                            <a href="/login">Sign in</a> to load Pokémon
                            from your saved teams.
                        </p>
                    <?php elseif ($savedTeams === []): ?>
                        <p class="calc-saved-hint">
                            Save a team in the
                            <a href="/teambuilder">Team Builder</a>
                            to load its Pokémon here.
                        </p>
                    <?php else: ?>
                        <div class="form-group calc-saved">
                            <label for="calc-<?= $side ?>-saved">
                                Load a saved Pokémon
                            </label>

                            <?php // Options are filled from the saved teams JSON below. ?>
                            <select
                                id="calc-<?= $side ?>-saved"
                                data-role="saved"
                            >
                                <option value="">Choose from your teams</option>
                            </select>
                        </div>
                    <?php endif; ?>

                    <div class="calc-fields">
                        <div class="form-group">
                            <label for="calc-<?= $side ?>-species">Pokémon</label>

                            <div class="combobox">
                                <input
                                    type="text"
                                    id="calc-<?= $side ?>-species"
                                    placeholder="Search Pokémon"
                                >
                                <ul
                                    class="combobox-list"
                                    role="listbox"
                                    aria-label="<?= $sideTitle ?> Pokémon options"
                                    hidden
                                ></ul>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="calc-<?= $side ?>-level">Level</label>

                            <input
                                type="number"
                                id="calc-<?= $side ?>-level"
                                min="1"
                                max="100"
                                value="100"
                            >
                        </div>

                        <div class="form-group">
                            <label for="calc-<?= $side ?>-ability">Ability</label>

                            <div class="combobox">
                                <input
                                    type="text"
                                    id="calc-<?= $side ?>-ability"
                                    placeholder="Search abilities"
                                >
                                <ul
                                    class="combobox-list"
                                    role="listbox"
                                    aria-label="<?= $sideTitle ?> ability options"
                                    hidden
                                ></ul>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="calc-<?= $side ?>-item">Item</label>

                            <div class="combobox">
                                <input
                                    type="text"
                                    id="calc-<?= $side ?>-item"
                                    placeholder="No item"
                                >
                                <ul
                                    class="combobox-list"
                                    role="listbox"
                                    aria-label="<?= $sideTitle ?> item options"
                                    hidden
                                ></ul>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="calc-<?= $side ?>-nature">Nature</label>

                            <select id="calc-<?= $side ?>-nature"></select>
                        </div>

                        <div class="form-group">
                            <label for="calc-<?= $side ?>-tera">Tera Type</label>

                            <select id="calc-<?= $side ?>-tera">
                                <option value="">Not Terastallized</option>

                                <?php foreach ($teraTypes as $teraType): ?>
                                    <option value="<?= $teraType ?>"><?= $teraType ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="calc-<?= $side ?>-status">Status</label>

                            <select id="calc-<?= $side ?>-status">
                                <?php foreach ($statuses as $statusCode => $statusName): ?>
                                    <option value="<?= $statusCode ?>"><?= $statusName ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                    </div>

                    <div class="calc-stats-wrapper">
                        <table class="calc-stats">
                            <caption class="visually-hidden">
                                <?= $sideTitle ?> stats
                            </caption>

                            <thead>
                                <tr>
                                    <th scope="col">Stat</th>
                                    <th scope="col">Base</th>
                                    <th scope="col">EVs</th>
                                    <th scope="col">IVs</th>
                                    <th scope="col">Boost</th>
                                    <th scope="col">Total</th>
                                </tr>
                            </thead>

                            <tbody>
                                <?php foreach ($stats as $stat => $statLabel): ?>
                                    <tr data-stat="<?= $stat ?>">
                                        <th scope="row"><?= $statLabel ?></th>

                                        <td data-role="base">-</td>

                                        <td>
                                            <input
                                                type="number"
                                                data-role="ev"
                                                min="0"
                                                max="252"
                                                step="4"
                                                value="0"
                                                aria-label="<?= $sideTitle ?> <?= $statLabel ?> EVs"
                                            >
                                        </td>

                                        <td>
                                            <input
                                                type="number"
                                                data-role="iv"
                                                min="0"
                                                max="31"
                                                value="31"
                                                aria-label="<?= $sideTitle ?> <?= $statLabel ?> IVs"
                                            >
                                        </td>

                                        <td>
                                            <?php // HP can't be boosted. ?>
                                            <?php if ($stat !== 'hp'): ?>
                                                <select
                                                    data-role="boost"
                                                    aria-label="<?= $sideTitle ?> <?= $statLabel ?> boost"
                                                >
                                                    <?php for ($boost = 6; $boost >= -6; $boost--): ?>
                                                        <option
                                                            value="<?= $boost ?>"
                                                            <?= $boost === 0 ? 'selected' : '' ?>
                                                        ><?= $boost > 0 ? "+{$boost}" : ($boost < 0 ? "−" . abs($boost) : '0') ?></option>
                                                    <?php endfor; ?>
                                                </select>
                                            <?php endif; ?>
                                        </td>

                                        <td data-role="total">-</td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>

                        <p class="calc-ev-total">
                            EVs used:
                            <span data-role="ev-total">0</span>/510
                        </p>
                    </div>

                    <?php if ($side === 'attacker'): ?>
                        <fieldset class="calc-moves">
                            <legend>Moves</legend>

                            <?php for ($slot = 1; $slot <= 4; $slot++): ?>
                                <div class="combobox">
                                    <input
                                        type="text"
                                        id="calc-attacker-move-<?= $slot ?>"
                                        data-role="move"
                                        placeholder="Move <?= $slot ?>"
                                        aria-label="Move <?= $slot ?>"
                                    >
                                    <ul
                                        class="combobox-list"
                                        role="listbox"
                                        aria-label="Move <?= $slot ?> options"
                                        hidden
                                    ></ul>
                                </div>
                            <?php endfor; ?>

                            <label class="calc-checkbox">
                                <input type="checkbox" id="calc-critical-hit">
                                Critical hit
                            </label>
                        </fieldset>
                    <?php endif; ?>
                </section>
            <?php endforeach; ?>
        </div>

        <section
            class="calc-panel calc-conditions"
            aria-labelledby="calc-conditions-heading"
        >
            <h2 id="calc-conditions-heading">Battle Conditions</h2>

            <div class="calc-fields">
                <div class="form-group">
                    <label for="calc-game-type">Battle</label>

                    <select id="calc-game-type">
                        <option value="Singles">Singles</option>
                        <option value="Doubles">Doubles</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="calc-weather">Weather</label>

                    <select id="calc-weather">
                        <option value="">None</option>
                        <option value="Sun">Sun</option>
                        <option value="Rain">Rain</option>
                        <option value="Sand">Sandstorm</option>
                        <option value="Snow">Snow</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="calc-terrain">Terrain</label>

                    <select id="calc-terrain">
                        <option value="">None</option>
                        <option value="Electric">Electric</option>
                        <option value="Grassy">Grassy</option>
                        <option value="Psychic">Psychic</option>
                        <option value="Misty">Misty</option>
                    </select>
                </div>

                <fieldset class="calc-screens">
                    <legend>Defender's side</legend>

                    <label class="calc-checkbox">
                        <input type="checkbox" id="calc-reflect">
                        Reflect
                    </label>

                    <label class="calc-checkbox">
                        <input type="checkbox" id="calc-light-screen">
                        Light Screen
                    </label>

                    <label class="calc-checkbox">
                        <input type="checkbox" id="calc-aurora-veil">
                        Aurora Veil
                    </label>
                </fieldset>
            </div>
        </section>

        <?php // React island (resources/ts/calc). The <p> is the no-JS fallback. ?>
        <div id="calc-credit-root">
            <p class="calc-credit">
                Calculations by
                <a href="https://github.com/smogon/damage-calc" rel="noopener">@smogon/calc</a>,
                the calculator behind Pokémon Showdown.
            </p>
        </div>

    </div>

    <?php if (!empty($savedTeams)): ?>
        <?php
        /*
         * Data, not code: the browser never runs a JSON script block.
         * JSON_HEX_TAG encodes < and > so text like a nickname can't
         * close the tag early.
         */
        ?>
        <script type="application/json" id="calc-saved-teams"><?= json_encode(
            $savedTeams,
            JSON_THROW_ON_ERROR | JSON_HEX_TAG | JSON_HEX_AMP
        ) ?></script>
    <?php endif; ?>
</main>

<?php require dirname(__DIR__) . '/layouts/footer.php'; ?>
