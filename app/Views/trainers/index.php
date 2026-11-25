<?php

declare(strict_types=1);

$pageTitle = $pageTitle ?? 'Find Trainers';

require dirname(__DIR__) . '/layouts/header.php';

$query = $query ?? '';
$viewerId = $viewerId ?? null;
?>

<main class="profile-page follow-list-page trainer-search-page" id="main-content">
    <div class="container">

        <h1>Find Trainers</h1>

        <?php // Works as a plain GET form; trainer-search.js updates the results as you type. ?>
        <form
            action="/trainers"
            method="GET"
            class="trainer-search"
            role="search"
            data-trainer-search
        >
            <label for="trainer-search-input" class="visually-hidden">
                Search trainers by username or display name
            </label>

            <i class="fa-solid fa-magnifying-glass trainer-search-icon" aria-hidden="true"></i>

            <input
                type="search"
                id="trainer-search-input"
                name="q"
                value="<?= htmlspecialchars($query, ENT_QUOTES, 'UTF-8') ?>"
                placeholder="Search by username or display name"
                maxlength="50"
                autocomplete="off"
                spellcheck="false"
            >

            <?php // Results come as you type; the button is only for browsers without JavaScript. ?>
            <noscript>
                <button type="submit" class="button button-primary">Search</button>
            </noscript>
        </form>

        <p class="visually-hidden" role="status" data-trainer-search-status></p>

        <div data-trainer-results>
            <?php require __DIR__ . '/results.php'; ?>
        </div>

    </div>
</main>

<?php if ($viewerId !== null): ?>
    <script>
        window.BRYMON_CSRF_TOKEN = <?= json_encode(
            \App\Core\Csrf::token(),
            JSON_THROW_ON_ERROR
        ) ?>;
    </script>
<?php endif; ?>

<?php
$pageScripts = ['/js/trainer-search.js'];
require dirname(__DIR__) . '/layouts/footer.php';
?>
