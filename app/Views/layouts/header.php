<?php

declare(strict_types=1);

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
</head>

<body>
<header class="site-header">
    <div class="container navigation">
        <a class="logo" href="/" aria-label="Brymon home">
            <img
                src="/images/logo/brymon-horizontal.png"
                alt="Brymon"
                class="logo-image"
            >
        </a>

        <nav class="primary-navigation" aria-label="Primary navigation">
            <a href="/">Home</a>
            <a href="/team-builder">Team Builder</a>
            <a href="/teams">Saved Teams</a>
            <a href="/about">About</a>
        </nav>

        <div class="navigation-actions">
            <a href="/login" class="navigation-button navigation-button--login">
                Sign In
            </a>

            <a
                href="/register"
                class="navigation-button navigation-button--register"
            >
                Sign Up
            </a>
        </div>
    </div>
</header>