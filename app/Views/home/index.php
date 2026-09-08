<?php

declare(strict_types=1);

$pageTitle = $pageTitle ?? 'Brymon Team Builder';

require dirname(__DIR__) . '/layouts/header.php';
?>

<main id="main-content">
    <!-- Hero -->
    <section class="home-hero">
        <div class="container home-hero-container">
            <div class="home-hero-content">
                <p class="home-hero-eyebrow">
                    Build • Analyze • Share
                </p>

                <h1>
                    Build Your Ultimate
                    <span>Pokémon Team</span>
                </h1>

                <p class="home-hero-description">
                    Assemble a competitive six-Pokémon team, break down its
                    weaknesses and coverage, explore a full Pokédex, and
                    share what you build with other trainers.
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
                        href="/pokedex"
                    >
                        Browse the Pokédex
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
                            Search any Pokémon and configure full sets:
                            ability, held item, four moves, EVs, IVs,
                            and nature.
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
                            Shared weaknesses with resistance suggestions,
                            full type-coverage, and offensive and defensive
                            role balance.
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
                                d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
                            />
                            <path
                                d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
                            />
                        </svg>
                    </span>

                    <div>
                        <h3>Pokédex</h3>

                        <p>
                            Browse 1,000+ Pokémon with type, generation,
                            and region filters, evolution lines, and a full
                            Mega Evolution gallery.
                        </p>
                    </div>
                </article>

                <article class="home-feature-card">
                    <span
                        class="home-feature-icon"
                        aria-hidden="true"
                    >
                        <svg viewBox="0 0 24 24">
                            <path d="M8 3 4 7l4 4" />
                            <path d="M4 7h16" />
                            <path d="m16 21 4-4-4-4" />
                            <path d="M20 17H4" />
                        </svg>
                    </span>

                    <div>
                        <h3>Showdown Import &amp; Export</h3>

                        <p>
                            Move teams in and out of Pokémon Showdown with
                            a single paste, straight from the builder.
                        </p>
                    </div>
                </article>

                <article class="home-feature-card">
                    <span
                        class="home-feature-icon"
                        aria-hidden="true"
                    >
                        <svg viewBox="0 0 24 24">
                            <circle cx="18" cy="5" r="3" />
                            <circle cx="6" cy="12" r="3" />
                            <circle cx="18" cy="19" r="3" />
                            <path d="m8.6 13.5 6.8 4" />
                            <path d="m15.4 6.5-6.8 4" />
                        </svg>
                    </span>

                    <div>
                        <h3>Share &amp; Discover</h3>

                        <p>
                            Make teams public with a shareable link, like
                            what others build, and browse popular and recent
                            teams from your dashboard.
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
                                d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
                            />
                            <circle cx="9" cy="7" r="4" />
                            <path d="m16 11 2 2 4-4" />
                        </svg>
                    </span>

                    <div>
                        <h3>Follow Trainers</h3>

                        <p>
                            Follow other trainers, get their new teams in
                            your feed, and customize your profile with a
                            display name, bio, and Pokémon avatar.
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
                    Build. Analyze.
                    <span>Share.</span>
                </h2>

                <p>
                    From a blank slate to a team the whole community
                    can see.
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

                        <h3>Build your team</h3>

                        <p>
                            Search the National Dex and configure every set
                            detail: ability, item, four moves, EVs, IVs,
                            and nature.
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

                        <h3>Check the analysis</h3>

                        <p>
                            Review shared weaknesses with resistance
                            suggestions, type coverage, and team role
                            balance, then adjust.
                        </p>
                    </div>
                </article>

                <article class="step-card">
                    <span
                        class="step-icon"
                        aria-hidden="true"
                    >
                        <svg viewBox="0 0 24 24">
                            <circle cx="18" cy="5" r="3"></circle>
                            <circle cx="6" cy="12" r="3"></circle>
                            <circle cx="18" cy="19" r="3"></circle>
                            <path d="m8.6 13.5 6.8 4"></path>
                            <path d="m15.4 6.5-6.8 4"></path>
                        </svg>
                    </span>

                    <div class="step-content">
                        <span class="step-label">Step 3</span>

                        <h3>Share and discover</h3>

                        <p>
                            Publish your team with a link, like and follow
                            other trainers, and keep up with new teams from
                            your dashboard.
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
                    Version 2
                </strong>

                <span>
                    Brymon now ships with a full Pokédex and a social layer
                    for sharing and discovering teams.
                </span>
            </div>

            <p class="eyebrow">
                Product Status
            </p>

            <h2>
                Built, tested, and production-ready
            </h2>

            <div class="status-grid">
                <article class="status-card">
                    <span class="status-label status-complete">
                        Complete
                    </span>

                    <h3>Team Builder &amp; Analysis</h3>

                    <p>
                        Full competitive set editing plus type coverage,
                        weakness resistance, and role-balance analysis.
                    </p>
                </article>

                <article class="status-card">
                    <span class="status-label status-complete">
                        Complete
                    </span>

                    <h3>Pokédex</h3>

                    <p>
                        Every Pokémon with type, generation, and region
                        filters, evolution chains, and a full Mega
                        Evolution gallery.
                    </p>
                </article>

                <article class="status-card">
                    <span class="status-label status-complete">
                        Complete
                    </span>

                    <h3>Public Teams &amp; Social</h3>

                    <p>
                        Shareable team pages, likes, trainer profiles,
                        following, and a personalized dashboard feed.
                    </p>
                </article>

                <article class="status-card">
                    <span class="status-label status-complete">
                        Complete
                    </span>

                    <h3>Production Ready</h3>

                    <p>
                        CSRF protection, server-side validation, email
                        verification, and 50+ automated tests.
                    </p>
                </article>
            </div>
        </div>
    </section>
</main>

<?php require dirname(__DIR__) . '/layouts/footer.php'; ?>
