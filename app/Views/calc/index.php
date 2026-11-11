<?php

declare(strict_types=1);

$pageTitle = $pageTitle ?? 'Damage Calculator';
$savedTeams = $savedTeams ?? null;

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

        <?php
        /*
         * React renders the calculator here (resources/ts/calc/main.tsx).
         * data-signed-in tells it whether to offer saved teams or a
         * sign-in link.
         */
        ?>
        <div
            id="calc-root"
            data-signed-in="<?= $savedTeams === null ? 'false' : 'true' ?>"
        >
            <p class="calc-message">Loading the calculator...</p>

            <noscript>
                <p class="calc-message">
                    The damage calculator needs JavaScript turned on.
                </p>
            </noscript>
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
