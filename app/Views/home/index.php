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
                    Create powerful teams, analyze your strategy,
                    and organize your favorite Pokémon—all in one place.
                </p>

                <div class="home-hero-actions">
                    <a
                        class="button button-primary"
                        href="/teambuilder"
                    >
                        Start Building
                    </a>

                    <a
                        class="button button-secondary"
                        href="/teams"
                    >
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
    <section
        class="home-features"
        aria-labelledby="features-heading"
    >
        <div class="container">
            <h2
                class="visually-hidden"
                id="features-heading"
            >
                Brymon features
            </h2>

            <div class="home-feature-grid">
                <article class="home-feature-card">
                    <span
                        class="home-feature-icon"
                        aria-hidden="true"
                    >
                        <svg viewBox="0 0 24 24">
                            <path
                                d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
                            />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M19 8v6" />
                            <path d="M22 11h-6" />
                        </svg>
                    </span>

                    <div>
                        <h3>Team Builder</h3>

                        <p>
                            Search, configure, and build your ideal
                            six-Pokémon team.
                        </p>
                    </div>
                </article>

                <article class="home-feature-card">
                    <span
                        class="home-feature-icon"
                        aria-hidden="true"
                    >
                        <svg viewBox="0 0 24 24">
                            <path d="M4 19V9" />
                            <path d="M10 19V5" />
                            <path d="M16 19v-7" />
                            <path d="M22 19V2" />
                        </svg>
                    </span>

                    <div>
                        <h3>Team Analysis</h3>

                        <p>
                            Review weaknesses, immunities, types,
                            abilities, moves, and team balance.
                        </p>
                    </div>
                </article>

                <article class="home-feature-card">
                    <span
                        class="home-feature-icon"
                        aria-hidden="true"
                    >
                        <svg viewBox="0 0 24 24">
                            <path
                                d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"
                            />
                            <path d="M9 12l2 2 4-4" />
                        </svg>
                    </span>

                    <div>
                        <h3>Save and Organize</h3>

                        <p>
                            Save multiple teams and keep your ideas
                            organized in one account.
                        </p>
                    </div>
                </article>

                <article class="home-feature-card">
                    <span
                        class="home-feature-icon"
                        aria-hidden="true"
                    >
                        <svg viewBox="0 0 24 24">
                            <path d="M14.5 17.5 3 6V3h3l11.5 11.5" />
                            <path d="m13 19 6-6" />
                            <path d="m16 16 4 4" />
                            <path d="m19 21 2-2" />
                            <path d="m14.5 6.5 3-3H21v3l-3 3" />
                            <path d="m5 14-2 2 5 5 2-2" />
                        </svg>
                    </span>

                    <div>
                        <h3>Battle Ready</h3>

                        <p>
                            Import and export Pokémon Showdown teams
                            and prepare for your next battle.
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
                <p class="eyebrow">
                    How It Works
                </p>

                <h2>
                    Build. Optimize.
                    <span>Dominate.</span>
                </h2>

                <p>
                    Everything you need to create, analyze,
                    and organize your Pokémon teams.
                </p>
            </div>

            <div class="steps-grid">
                <article class="step-card">
                    <span
                        class="step-icon"
                        aria-hidden="true"
                    >
                        <svg viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="7"></circle>
                            <path d="m20 20-4-4"></path>
                            <path d="M11 8v6"></path>
                            <path d="M8 11h6"></path>
                        </svg>
                    </span>

                    <div class="step-content">
                        <span class="step-label">Step 1</span>

                        <h3>Search and Select</h3>

                        <p>
                            Search for Pokémon and add your favorites
                            to a new team.
                        </p>
                    </div>
                </article>

                <article class="step-card">
                    <span
                        class="step-icon"
                        aria-hidden="true"
                    >
                        <svg viewBox="0 0 24 24">
                            <path d="M4 6h16"></path>
                            <path d="M4 12h16"></path>
                            <path d="M4 18h16"></path>
                            <circle cx="8" cy="6" r="1"></circle>
                            <circle cx="14" cy="12" r="1"></circle>
                            <circle cx="10" cy="18" r="1"></circle>
                        </svg>
                    </span>

                    <div class="step-content">
                        <span class="step-label">Step 2</span>

                        <h3>Configure and Analyze</h3>

                        <p>
                            Choose abilities, items, moves, EVs,
                            IVs, and review your team analysis.
                        </p>
                    </div>
                </article>

                <article class="step-card">
                    <span
                        class="step-icon"
                        aria-hidden="true"
                    >
                        <svg viewBox="0 0 24 24">
                            <path d="M5 4h12l2 2v14H5z"></path>
                            <path d="M8 4v6h8V4"></path>
                            <path d="M9 17h6"></path>
                        </svg>
                    </span>

                    <div class="step-content">
                        <span class="step-label">Step 3</span>

                        <h3>Save and Battle</h3>

                        <p>
                            Save your completed team or export it
                            directly to Pokémon Showdown.
                        </p>
                    </div>
                </article>
            </div>
        </div>
    </section>

    <!-- Product Status -->
    <section
        class="project-status"
        id="project-status"
    >
        <div class="container">
            <div class="status-banner status-banner--launch">
                <span
                    class="status-indicator"
                    aria-hidden="true"
                ></span>

                <strong>
                    Version 1 Ready
                </strong>

                <span>
                    Brymon’s core team-building experience is complete
                    and ready to use.
                </span>
            </div>

            <p class="eyebrow">
                Product Status
            </p>

            <h2>
                Built, tested, and ready to launch
            </h2>

            <div class="status-grid">
                <article class="status-card">
                    <span class="status-label status-complete">
                        Complete
                    </span>

                    <h3>Core Team Builder</h3>

                    <p>
                        Search Pokémon, configure full sets,
                        and save teams to your account.
                    </p>
                </article>

                <article class="status-card">
                    <span class="status-label status-complete">
                        Complete
                    </span>

                    <h3>Team Analysis</h3>

                    <p>
                        Review shared weaknesses, immunities,
                        and team type distribution.
                    </p>
                </article>

                <article class="status-card">
                    <span class="status-label status-complete">
                        Complete
                    </span>

                    <h3>Showdown Integration</h3>

                    <p>
                        Import and export Pokémon Showdown teams
                        directly from the builder.
                    </p>
                </article>

                <article class="status-card">
                    <span class="status-label status-complete">
                        Complete
                    </span>

                    <h3>Production Ready</h3>

                    <p>
                        Protected with CSRF validation, production
                        error handling, backend validation,
                        and automated testing.
                    </p>
                </article>
            </div>
        </div>
    </section>
</main>

<?php require dirname(__DIR__) . '/layouts/footer.php'; ?>