<?php

declare(strict_types=1);

$pageTitle = $pageTitle ?? 'Brymon Team Builder';

require dirname(__DIR__) . '/layouts/header.php';
?>

<main>
    <!-- Hero -->
    <section class="home-hero">
        <div class="container home-hero-container">
            <div class="home-hero-content">
                <p class="home-hero-eyebrow">
                    Build • Strategize • Battle
                </p>

                <h1>
                    Build Your Ultimate
                    <span>Pokémon Team</span>
                </h1>

                <p class="home-hero-description">
                    Create powerful teams, organize your favorite Pokémon,
                    and prepare your strategy—all in one place.
                </p>

                <div class="home-hero-actions">
                    <a class="button button-primary" href="/team-builder">
                        Start Building
                    </a>

                    <a class="button button-secondary" href="/teams">
                        View Saved Teams
                    </a>
                </div>
            </div>

            <div class="home-hero-visual">
                <div class="home-hero-image-wrapper">
                    <img
                        src="/images/hero_artwork.png"
                        alt="A team of Pokémon ready for battle"
                        class="home-hero-image"
                    >
                </div>
            </div>
        </div>
    </section>

    <!-- Features -->
    <section class="home-features" aria-labelledby="features-heading">
        <div class="container">
            <h2 class="visually-hidden" id="features-heading">
                Brymon features
            </h2>

            <div class="home-feature-grid">
                <article class="home-feature-card">
                    <span class="home-feature-icon" aria-hidden="true">
                        01
                    </span>

                    <div>
                        <h3>Team Builder</h3>

                        <p>
                            Search, select, and build your ideal
                            six-Pokémon team.
                        </p>
                    </div>
                </article>

                <article class="home-feature-card">
                    <span class="home-feature-icon" aria-hidden="true">
                        02
                    </span>

                    <div>
                        <h3>Pokémon Details</h3>

                        <p>
                            Review useful information while choosing
                            members for your team.
                        </p>
                    </div>
                </article>

                <article class="home-feature-card">
                    <span class="home-feature-icon" aria-hidden="true">
                        03
                    </span>

                    <div>
                        <h3>Save and Organize</h3>

                        <p>
                            Save multiple team ideas and keep them
                            organized in your account.
                        </p>
                    </div>
                </article>

                <article class="home-feature-card">
                    <span class="home-feature-icon" aria-hidden="true">
                        04
                    </span>

                    <div>
                        <h3>Battle Ready</h3>

                        <p>
                            Prepare your team before taking on your
                            next challenge.
                        </p>
                    </div>
                </article>
            </div>
        </div>
    </section>

    <!-- How It Works -->
    <section class="how-it-works">
        <div class="container">
            <div class="section-heading">
                <p class="eyebrow">How It Works</p>

                <h2>
                    Build. Optimize.
                    <span>Dominate.</span>
                </h2>

                <p>
                    Everything you need to create and organize your
                    Pokémon teams.
                </p>
            </div>

            <div class="steps-grid">
                <article class="step-card">
                    <span class="step-number">01</span>

                    <div>
                        <h3>Search and Select</h3>

                        <p>
                            Search for Pokémon and add your favorites
                            to a new team.
                        </p>
                    </div>
                </article>

                <span class="step-arrow" aria-hidden="true">›</span>

                <article class="step-card">
                    <span class="step-number">02</span>

                    <div>
                        <h3>Build Your Team</h3>

                        <p>
                            Arrange up to six Pokémon and create a team
                            that fits your strategy.
                        </p>
                    </div>
                </article>

                <span class="step-arrow" aria-hidden="true">›</span>

                <article class="step-card">
                    <span class="step-number">03</span>

                    <div>
                        <h3>Save and Battle</h3>

                        <p>
                            Save your completed team and return to it
                            whenever you are ready.
                        </p>
                    </div>
                </article>
            </div>
        </div>
    </section>

    <!-- Existing Development Progress -->
    <section class="project-status" id="project-status">
        <div class="container">
            <div class="status-banner">
                <strong>Work in progress</strong>

                <span>
                    Brymon is currently under active development.
                </span>
            </div>

            <p class="eyebrow">Development Progress</p>

            <h2>Currently building the MVP</h2>

            <div class="status-grid">
                <article class="status-card">
                    <span class="status-label status-complete">
                        Complete
                    </span>

                    <h3>Product Design</h3>

                    <p>
                        Wireframes, high-fidelity designs, and
                        project planning.
                    </p>
                </article>

                <article class="status-card">
                    <span class="status-label status-complete">
                        Complete
                    </span>

                    <h3>Architecture</h3>

                    <p>
                        Database design, MVC architecture, and
                        application routes.
                    </p>
                </article>

                <article class="status-card">
                    <span class="status-label status-active">
                        In progress
                    </span>

                    <h3>Application Development</h3>

                    <p>
                        Custom PHP framework, team management, and
                        PokéAPI integration.
                    </p>
                </article>
            </div>
        </div>
    </section>
</main>

<?php require dirname(__DIR__) . '/layouts/footer.php'; ?>