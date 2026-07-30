<?php
declare(strict_types=1);

use App\Core\Auth;

$pageTitle = $pageTitle ?? 'Brymon';
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1"
    >

    <meta
        name="description"
        content="Brymon is a Pokémon team-building application built with custom PHP MVC architecture."
    >

    <title><?= htmlspecialchars($pageTitle, ENT_QUOTES, 'UTF-8') ?></title>

    <link rel="stylesheet" href="/css/app.css">
    <link rel="icon" type="image/x-icon" href="/favicon/favicon.ico">
    <link rel="icon" type="image/svg+xml" href="/favicon/favicon.svg">
    <link rel="icon" type="image/png" sizes="96x96" href="/favicon/favicon-96x96.png">

    <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png">

    <link rel="manifest" href="/favicon/site.webmanifest">
</head>

<body>
<header class="site-header">
    <div class="container navigation">
        <a class="logo" href="/">
            <img src="/images/logo/brymon-symbol.png" class="logo-symbol" alt="">
            <img src="/images/logo/brymon-stacked.png" class="logo-wordmark" alt="Brymon">
        </a>

        <nav class="primary-navigation" aria-label="Primary navigation">
            <a href="/">Home</a>

            <?php if (Auth::check()): ?>
                <a href="/teambuilder">Team Builder</a>
                <a href="/teams">Saved Teams</a>
            <?php endif; ?>

            <a href="/about">About</a>
        </nav>

        <div class="navigation-actions">
            <?php if (Auth::check()): ?>

                <a
                    href="/dashboard"
                    class="navigation-button navigation-button--login"
                >
                    <?= htmlspecialchars(
                        Auth::username() ?? 'Dashboard',
                        ENT_QUOTES,
                        'UTF-8'
                    ) ?>
                </a>

                <form action="/logout" method="POST">
                    <button
                        type="submit"
                        class="navigation-button navigation-button--register"
                    >
                        Logout
                    </button>
                </form>

            <?php else: ?>

                <a
                    href="/login"
                    class="navigation-button navigation-button--login"
                >
                    Sign In
                </a>

                <a
                    href="/register"
                    class="navigation-button navigation-button--register"
                >
                    Sign Up
                </a>

            <?php endif; ?>
        </div>

        <button
            type="button"
            class="mobile-nav-toggle"
            aria-label="Open navigation menu"
            aria-controls="mobile-navigation"
            aria-expanded="false"
        >
            <span></span>
            <span></span>
            <span></span>
        </button>
    </div>

    <nav
        id="mobile-navigation"
        class="mobile-navigation"
        aria-label="Mobile navigation"
        hidden
    >
        <div class="container mobile-navigation-inner">
            <a href="/">Home</a>

            <?php if (Auth::check()): ?>
                <a href="/teambuilder">Team Builder</a>
                <a href="/teams">Saved Teams</a>
                <a href="/dashboard">
                    <?= htmlspecialchars(
                        Auth::username() ?? 'Dashboard',
                        ENT_QUOTES,
                        'UTF-8'
                    ) ?>
                </a>

                <form action="/logout" method="POST">
                    <button type="submit" class="mobile-navigation-link">
                        Logout
                    </button>
                </form>
            <?php else: ?>
                <a href="/login">Sign In</a>
                <a href="/register">Sign Up</a>
            <?php endif; ?>

            <a href="/about">About</a>
        </div>
    </nav>
</header>