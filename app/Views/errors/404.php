<?php

declare(strict_types=1);

$pageTitle = 'Page Not Found';

require dirname(__DIR__) . '/layouts/header.php';
?>

<main class="error-page">
    <div class="container error-content">
        <p class="error-code">404</p>

        <p class="eyebrow">Page not found</p>

        <h1>This page wandered off.</h1>

        <p class="error-description">
            The page you requested does not exist, may have moved,
            or is still being built.
        </p>

        <div class="hero-actions">
            <a class="button button-primary" href="/">
                Return Home
            </a>

            <a class="button button-secondary" href="/about">
                About Brymon
            </a>
        </div>
    </div>
</main>

<?php require dirname(__DIR__) . '/layouts/footer.php'; ?>