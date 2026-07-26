<?php

declare(strict_types=1);

$pageTitle = $pageTitle ?? 'Brymon Team Builder';

require dirname(__DIR__) . '/layouts/header.php';
?>

<main>
    <section class="hero">
        <div class="container">
            <div class="status-banner">
                <strong>Work in progress</strong>
                <span>Brymon is currently under active development.</span>
            </div>

            <p class="eyebrow">Pokémon Team-Building Application</p>

            <h1>Build your team.<br>Plan your strategy.</h1>

            <p class="hero-description">
                Brymon helps players create, organize, and manage Pokémon
                teams through a clean and intuitive team-building experience.
            </p>

            <div class="hero-actions">
                <a class="button button-primary" href="#project-status">
                    View Project Status
                </a>

                <a
                    class="button button-secondary"
                    href="https://github.com/bryanarius/Brymon-Team-Builder"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    View GitHub
                </a>
            </div>
        </div>
    </section>

    <section class="project-status" id="project-status">
        <div class="container">
            <p class="eyebrow">Development Progress</p>
            <h2>Currently building the MVP</h2>

            <div class="status-grid">
                <article class="status-card">
                    <span class="status-label status-complete">Complete</span>
                    <h3>Product Design</h3>
                    <p>Wireframes, high-fidelity designs, and project planning.</p>
                </article>

                <article class="status-card">
                    <span class="status-label status-complete">Complete</span>
                    <h3>Architecture</h3>
                    <p>Database design, MVC architecture, and application routes.</p>
                </article>

                <article class="status-card">
                    <span class="status-label status-active">In progress</span>
                    <h3>Application Development</h3>
                    <p>Custom PHP framework, team management, and PokéAPI integration.</p>
                </article>
            </div>
        </div>
    </section>
</main>

<?php require dirname(__DIR__) . '/layouts/footer.php'; ?>