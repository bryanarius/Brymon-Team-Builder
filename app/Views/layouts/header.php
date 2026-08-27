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

            <div class="account-menu">
                <button
                    type="button"
                    class="navigation-button navigation-button--login account-menu-button"
                    id="account-menu-button"
                    aria-expanded="false"
                    aria-controls="account-menu-dropdown"
                    aria-haspopup="true"
                >
                    <span>
                        <?= htmlspecialchars(
                            Auth::username() ?? 'Account',
                            ENT_QUOTES,
                            'UTF-8'
                        ) ?>
                    </span>

                    <span
                        class="account-menu-chevron"
                        aria-hidden="true"
                    >
                        ▾
                    </span>
                </button>

                <div
                    class="account-menu-dropdown"
                    id="account-menu-dropdown"
                    hidden
                >
                    <a href="/account" class="account-menu-link">
                        <span>⚙</span>
                        Account Settings
                    </a>

                    <form action="/logout" method="POST">
                        <input
                            type="hidden"
                            name="csrf_token"
                            value="<?= htmlspecialchars(
                                \App\Core\Csrf::token(),
                                ENT_QUOTES,
                                'UTF-8'
                            ) ?>"
                        >

                        <button
                            type="submit"
                            class="account-menu-link account-menu-logout"
                        >
                            <span>↩</span>
                            Logout
                        </button>
                    </form>
                </div>
            </div>

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
                <a href="/account">Account Settings</a>
                <span class="mobile-navigation-username">
                    Signed in as
                    <strong>
                        <?= htmlspecialchars(
                            Auth::username() ?? 'Account',
                            ENT_QUOTES,
                            'UTF-8'
                        ) ?>
                    </strong>
                </span>

                <form action="/logout" method="POST">
                    <input
                        type="hidden"
                        name="csrf_token"
                        value="<?= htmlspecialchars(
                            \App\Core\Csrf::token(),
                            ENT_QUOTES,
                            'UTF-8'
                        ) ?>"
                    >

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