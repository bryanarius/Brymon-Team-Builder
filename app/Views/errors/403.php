<?php

declare(strict_types=1);

$pageTitle = $pageTitle ?? 'Request Denied';

require dirname(__DIR__) . '/layouts/header.php';
?>

<main class="error-page">
    <div class="container error-content">

        <p class="error-code">403</p>

        <p class="eyebrow">Request denied</p>

        <h1>You can’t do that.</h1>

        <p class="error-description">
            This request could not be completed.
            Please return to Brymon and try again.
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