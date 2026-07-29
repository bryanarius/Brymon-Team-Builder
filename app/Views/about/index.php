<?php

declare(strict_types=1);

$pageTitle = $pageTitle ?? 'About Brymon';

require dirname(__DIR__) . '/layouts/header.php';
?>

<main class="about-page">
    <!-- Portfolio introduction -->
    <section class="about-hero">
        <div class="container">
            <p class="eyebrow">About the Project</p>

            <h1>
                Built to explore full-stack
                PHP development.
            </h1>

            <p class="about-introduction">
                Brymon is a Pokémon team-building application designed
                to help players create, organize, and manage teams
                through a simple and intuitive interface.
            </p>
        </div>
    </section>

    <!-- Main About section -->
    <section class="about-overview">
        <div class="container about-overview-grid">
            <article class="about-main-card">
                <div class="about-artwork">
                    <img
                        src="/images/about-pokemon.png"
                        alt="Bulbasaur, Pikachu, Charmander, and Squirtle"
                    >
                </div>

                <div class="about-main-content">
                    <h2>
                        About <span>Brymon</span>
                    </h2>

                    <p class="about-main-lead">
                        Brymon is a clean, simple, and powerful Pokémon
                        team builder created for fans who want an easier
                        way to plan and organize their teams.
                    </p>

                    <p>
                        Search for Pokémon, create a team of up to six,
                        customize team details, and save your builds for
                        later. Whether you play casually or competitively,
                        Brymon helps you build with confidence.
                    </p>

                    <div class="about-benefit-grid">
                        <article class="about-benefit">
                            <span class="about-benefit-icon" aria-hidden="true">
                                01
                            </span>

                            <div>
                                <h3>Fast</h3>
                                <p>Quick searching and straightforward results.</p>
                            </div>
                        </article>

                        <article class="about-benefit">
                            <span class="about-benefit-icon" aria-hidden="true">
                                02
                            </span>

                            <div>
                                <h3>Simple</h3>
                                <p>A clean interface that stays easy to use.</p>
                            </div>
                        </article>

                        <article class="about-benefit">
                            <span class="about-benefit-icon" aria-hidden="true">
                                03
                            </span>

                            <div>
                                <h3>Organized</h3>
                                <p>Save and manage your teams in one place.</p>
                            </div>
                        </article>
                    </div>
                </div>
            </article>

            <aside class="about-audience-card">
                <p class="about-card-eyebrow">Built for Trainers</p>

                <div class="audience-list">
                    <article class="audience-item">
                        <span class="audience-icon" aria-hidden="true">01</span>

                        <div>
                            <h3>Casual Players</h3>
                            <p>
                                Build fun teams and experiment with your
                                favorite Pokémon.
                            </p>
                        </div>
                    </article>

                    <article class="audience-item">
                        <span class="audience-icon" aria-hidden="true">02</span>

                        <div>
                            <h3>Competitive Players</h3>
                            <p>
                                Organize balanced teams and prepare before
                                entering battle.
                            </p>
                        </div>
                    </article>

                    <article class="audience-item">
                        <span class="audience-icon" aria-hidden="true">03</span>

                        <div>
                            <h3>New Trainers</h3>
                            <p>
                                Learn, explore, and create teams with confidence.
                            </p>
                        </div>
                    </article>
                </div>
            </aside>
        </div>
    </section>

    <!-- Features and data source -->
    <section class="about-details">
        <div class="container about-details-grid">
            <article class="about-features-card">
                <p class="about-card-eyebrow">Features</p>

                <div class="about-feature-grid">
                    <article class="about-feature-item">
                        <span class="about-feature-icon" aria-hidden="true">
                            01
                        </span>

                        <div>
                            <h3>Search and Filter</h3>
                            <p>
                                Find Pokémon by name, type, generation,
                                and other useful details.
                            </p>
                        </div>
                    </article>

                    <article class="about-feature-item">
                        <span class="about-feature-icon" aria-hidden="true">
                            02
                        </span>

                        <div>
                            <h3>Set Customization</h3>
                            <p>
                                Customize important team information for
                                each selected Pokémon.
                            </p>
                        </div>
                    </article>

                    <article class="about-feature-item">
                        <span class="about-feature-icon" aria-hidden="true">
                            03
                        </span>

                        <div>
                            <h3>Pokémon Details</h3>
                            <p>
                                Review useful Pokémon data while building
                                your team.
                            </p>
                        </div>
                    </article>

                    <article class="about-feature-item">
                        <span class="about-feature-icon" aria-hidden="true">
                            04
                        </span>

                        <div>
                            <h3>Team Builder</h3>
                            <p>
                                Add up to six Pokémon and arrange your
                                preferred lineup.
                            </p>
                        </div>
                    </article>

                    <article class="about-feature-item">
                        <span class="about-feature-icon" aria-hidden="true">
                            05
                        </span>

                        <div>
                            <h3>Save and Manage</h3>
                            <p>
                                Save multiple teams and access them whenever
                                you return.
                            </p>
                        </div>
                    </article>

                    <article class="about-feature-item">
                        <span class="about-feature-icon" aria-hidden="true">
                            06
                        </span>

                        <div>
                            <h3>Team Notes</h3>
                            <p>
                                Add reminders and strategy notes to your
                                saved teams.
                            </p>
                        </div>
                    </article>
                </div>
            </article>

            <aside class="about-source-card">
                <p class="about-card-eyebrow">Data Source</p>

                <p>
                    Brymon uses data from PokéAPI, a free and open-source
                    Pokémon API.
                </p>

                <a
                    class="pokeapi-logo-link"
                    href="https://pokeapi.co/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Visit the PokéAPI website"
                >
                    <img
                        class="pokeapi-logo"
                        src="/images/pokeapi.png"
                        alt="PokéAPI"
                    >
                </a>

                <a
                    class="pokeapi-text-link"
                    href="https://pokeapi.co/"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Visit PokéAPI
                </a>
            </aside>
        </div>
    </section>

    <!-- Portfolio details -->
    <section class="about-project-details">
        <div class="container">
            <div class="about-project-grid">
                <article class="about-project-card">
                    <h2>Why I built Brymon</h2>

                    <p>
                        Brymon is a portfolio project created to demonstrate
                        application architecture, backend development,
                        database design, API integration, and responsive
                        interface design.
                    </p>
                </article>

                <article class="about-project-card">
                    <h2>Technology</h2>

                    <ul>
                        <li>Custom PHP MVC architecture</li>
                        <li>PostgreSQL database</li>
                        <li>PokéAPI integration</li>
                        <li>HTML, CSS, and JavaScript</li>
                        <li>Composer PSR-4 autoloading</li>
                    </ul>
                </article>

                <article class="about-project-card">
                    <h2>Current status</h2>

                    <p>
                        Brymon is currently under active development. The
                        initial release focuses on building, saving, editing,
                        and managing Pokémon teams.
                    </p>
                </article>
            </div>
        </div>
    </section>
</main>

<?php require dirname(__DIR__) . '/layouts/footer.php'; ?>