<?php

declare(strict_types=1);

$pageTitle = $pageTitle ?? 'Server Error';

require dirname(__DIR__) . '/layouts/header.php';
?>

<main class="error-page">
    <div class="container error-content">

        <p class="error-code">500</p>

        <p class="eyebrow">Server error</p>

        <h1>Something went wrong.</h1>

        <p class="error-description">
            Brymon ran into an unexpected problem.
            Please try again in a moment.
        </p>

        <div class="hero-actions">
            <a class="button button-primary" href="/">
                Return Home
            </a>

            <a class="button button-secondary" href="/teams">
                Saved Teams
            </a>
        </div>

    </div>
</main>

<?php require dirname(__DIR__) . '/layouts/footer.php'; ?>