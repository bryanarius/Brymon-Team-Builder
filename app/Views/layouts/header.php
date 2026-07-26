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
        <a class="logo" href="/">Brymon</a>

        <nav aria-label="Primary navigation">
            <a href="/">Home</a>
            <a href="/about">About</a>
            <a
                href="https://github.com/bryanarius/Brymon-Team-Builder"
                target="_blank"
                rel="noopener noreferrer"
            >
                GitHub
            </a>
        </nav>
    </div>
</header>