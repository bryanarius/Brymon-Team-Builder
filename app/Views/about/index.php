<?php

declare(strict_types=1);

$pageTitle = $pageTitle ?? 'About Brymon';

require dirname(__DIR__) . '/layouts/header.php';
?>

<main>
    <section class="about-hero">
        <div class="container">
            <p class="eyebrow">About the project</p>

            <h1>Built to explore full-stack PHP development.</h1>

            <p class="about-introduction">
                Brymon is a Pokémon team-building application designed to help
                players create, organize, and manage teams through a simple and
                intuitive interface.
            </p>
        </div>
    </section>

    <section class="about-content">
        <div class="container about-grid">
            <article class="about-card">
                <h2>Why I built Brymon</h2>

                <p>
                    Brymon is a portfolio project created to demonstrate
                    application architecture, backend development, database
                    design, API integration, and responsive interface design.
                </p>
            </article>

            <article class="about-card">
                <h2>Technology</h2>

                <ul>
                    <li>Custom PHP MVC architecture</li>
                    <li>PostgreSQL database</li>
                    <li>PokéAPI integration</li>
                    <li>HTML, CSS, and JavaScript</li>
                    <li>Composer PSR-4 autoloading</li>
                </ul>
            </article>

            <article class="about-card">
                <h2>Current status</h2>

                <p>
                    Brymon is currently under active development. The initial
                    release will focus on building, saving, editing, and
                    managing Pokémon teams.
                </p>
            </article>
        </div>
    </section>
</main>

<?php require dirname(__DIR__) . '/layouts/footer.php'; ?>