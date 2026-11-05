<?php

declare(strict_types=1);

$pageTitle = $pageTitle ?? 'Meta';
$formats = $formats ?? [];

// Plain-language explanations of each format, keyed like $formats.
$formatDescriptions = [
    'gen9ou' => 'OverUsed. Smogon\'s standard singles format and the most '
        . 'popular. Any Pokémon is allowed except those too strong for it, '
        . 'which are moved to Ubers.',
    'gen9ubers' => 'The most powerful Pokémon, such as most box-art '
        . 'legendaries, that are banned from OU. Almost anything goes.',
    'gen9uu' => 'UnderUsed. Pokémon that aren\'t used enough to be in OU. '
        . 'OU and Ubers Pokémon are banned, so weaker Pokémon get to shine.',
    'gen9ru' => 'RarelyUsed. The tier below UU: Pokémon from UU and above '
        . 'are banned.',
    'gen9nu' => 'NeverUsed. The tier below RU: Pokémon from RU and above '
        . 'are banned.',
    'gen9pu' => 'The tier below NU: Pokémon from NU and above are banned. '
        . 'Its name started as a community joke and doesn\'t officially '
        . 'stand for anything.',
    'gen9nationaldex' => 'OU-style rules, but Pokémon, moves, and items '
        . 'missing from Scarlet and Violet are allowed, including Mega '
        . 'Evolutions.',
    'gen9doublesou' => 'Smogon\'s standard doubles format: each player has '
        . 'two Pokémon in battle at once.',
    'gen9vgc2026' => 'The official Pokémon doubles format used at Nintendo '
        . 'tournaments, including the World Championships. Players bring six '
        . 'Pokémon and choose four for each battle.',
];

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

                <select
                    id="meta-format"
                    aria-describedby="meta-format-description"
                >
                    <?php foreach ($formats as $formatId => $formatName): ?>
                        <option
                            value="<?= htmlspecialchars($formatId, ENT_QUOTES, 'UTF-8') ?>"
                            data-description="<?= htmlspecialchars($formatDescriptions[$formatId] ?? '', ENT_QUOTES, 'UTF-8') ?>"
                        >
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

            <p
                class="meta-format-description"
                id="meta-format-description"
            ></p>

            <details class="meta-glossary">
                <summary>What do these formats mean?</summary>

                <p>
                    Smogon splits competitive play into tiers by how often
                    Pokémon are used, so that less popular Pokémon still
                    have a format where they can compete. Each tier bans
                    the Pokémon from the tiers above it.
                </p>

                <dl>
                    <?php foreach ($formats as $formatId => $formatName): ?>
                        <?php if (isset($formatDescriptions[$formatId])): ?>
                            <div>
                                <dt><?= htmlspecialchars($formatName, ENT_QUOTES, 'UTF-8') ?></dt>
                                <dd><?= htmlspecialchars($formatDescriptions[$formatId], ENT_QUOTES, 'UTF-8') ?></dd>
                            </div>
                        <?php endif; ?>
                    <?php endforeach; ?>
                </dl>
            </details>

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
