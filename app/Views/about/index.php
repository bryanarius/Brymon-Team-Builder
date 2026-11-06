<?php

declare(strict_types=1);

$pageTitle = $pageTitle ?? 'About Brymon';

require dirname(__DIR__) . '/layouts/header.php';
?>

<main class="about-page" id="main-content">
    <!-- Hero -->
    <section class="about-hero">
        <div class="container">
            <p class="eyebrow">
                About Brymon
            </p>

            <h1>
                Built for Pokémon trainers.
            </h1>

            <p class="about-introduction">
                Build, analyze, organize, and export Pokémon teams
                with a modern team-building experience powered by
                PokéAPI.
            </p>
        </div>
    </section>

    <!-- Main overview -->
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
                        Brymon is a modern Pokémon team-building
                        application designed to help trainers create
                        complete teams, customize Pokémon sets, and
                        manage their favorite builds in one place.
                    </p>

                    <p>
                        Search for Pokémon, configure abilities, items,
                        moves, EVs, IVs, and natures, review shared
                        weaknesses and type distribution, and transfer
                        teams between Brymon and Pokémon Showdown.
                    </p>

                    <div class="about-benefit-grid">
                        <article class="about-benefit">
                            <span
                                class="about-benefit-icon"
                                aria-hidden="true"
                            >
                                <svg viewBox="0 0 24 24">
                                    <path d="M13 2 3 14h8l-1 8 10-12h-8z"></path>
                                </svg>
                            </span>

                            <div>
                                <h3>Fast</h3>

                                <p>
                                    Quickly search for Pokémon and build
                                    complete teams without unnecessary
                                    friction.
                                </p>
                            </div>
                        </article>

                        <article class="about-benefit">
                            <span
                                class="about-benefit-icon"
                                aria-hidden="true"
                            >
                                <svg viewBox="0 0 24 24">
                                    <path d="M12 3v18"></path>
                                    <path d="M3 12h18"></path>
                                    <path d="m5 5 14 14"></path>
                                    <path d="m19 5-14 14"></path>
                                </svg>
                            </span>

                            <div>
                                <h3>Simple</h3>

                                <p>
                                    A focused interface keeps advanced
                                    team configuration approachable.
                                </p>
                            </div>
                        </article>

                        <article class="about-benefit">
                            <span
                                class="about-benefit-icon"
                                aria-hidden="true"
                            >
                                <svg viewBox="0 0 24 24">
                                    <path d="M4 5h16v14H4z"></path>
                                    <path d="M8 5V3h8v2"></path>
                                    <path d="M8 9h8"></path>
                                    <path d="M8 13h8"></path>
                                </svg>
                            </span>

                            <div>
                                <h3>Organized</h3>

                                <p>
                                    Save, edit, and revisit multiple team
                                    ideas from one account.
                                </p>
                            </div>
                        </article>
                    </div>
                </div>
            </article>

            <aside class="about-audience-card">
                <p class="about-card-eyebrow">
                    Built for Trainers
                </p>

                <div class="audience-list">
                    <article class="audience-item">
                        <span
                            class="audience-icon"
                            aria-hidden="true"
                        >
                            <svg viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="8"></circle>
                                <path d="M4 12h16"></path>
                                <circle cx="12" cy="12" r="2"></circle>
                            </svg>
                        </span>

                        <div>
                            <h3>Casual Players</h3>

                            <p>
                                Experiment with fun team ideas and save
                                combinations featuring your favorite
                                Pokémon.
                            </p>
                        </div>
                    </article>

                    <article class="audience-item">
                        <span
                            class="audience-icon"
                            aria-hidden="true"
                        >
                            <svg viewBox="0 0 24 24">
                                <path d="M8 3h8v4a4 4 0 0 1-8 0z"></path>
                                <path d="M6 5H3v2a4 4 0 0 0 4 4"></path>
                                <path d="M18 5h3v2a4 4 0 0 1-4 4"></path>
                                <path d="M12 11v5"></path>
                                <path d="M8 21h8"></path>
                                <path d="M10 16h4v5h-4z"></path>
                            </svg>
                        </span>

                        <div>
                            <h3>Competitive Battlers</h3>

                            <p>
                                Fine-tune complete sets, study the meta,
                                calculate damage, and export directly to
                                Pokémon Showdown.
                            </p>
                        </div>
                    </article>

                    <article class="audience-item">
                        <span
                            class="audience-icon"
                            aria-hidden="true"
                        >
                            <svg viewBox="0 0 24 24">
                                <path d="M4 5h16v14H4z"></path>
                                <path d="M8 9h8"></path>
                                <path d="M8 13h8"></path>
                                <path d="M8 17h5"></path>
                            </svg>
                        </span>

                        <div>
                            <h3>Collectors and Planners</h3>

                            <p>
                                Organize multiple teams and return to
                                your saved ideas whenever inspiration
                                strikes.
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
                <p class="about-card-eyebrow">
                    Core Features
                </p>

                <div class="about-feature-grid">
                    <article class="about-feature-item">
                        <span
                            class="about-feature-icon"
                            aria-hidden="true"
                        >
                            <svg viewBox="0 0 24 24">
                                <circle cx="11" cy="11" r="7"></circle>
                                <path d="m20 20-4-4"></path>
                                <path d="M11 8v6"></path>
                                <path d="M8 11h6"></path>
                            </svg>
                        </span>

                        <div>
                            <h3>Pokémon Search</h3>

                            <p>
                                Search and filter Pokémon by name, type,
                                generation, and sort order.
                            </p>
                        </div>
                    </article>

                    <article class="about-feature-item">
                        <span
                            class="about-feature-icon"
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

                        <div>
                            <h3>Set Customization</h3>

                            <p>
                                Configure abilities, items, natures,
                                moves, EVs, IVs, and nicknames.
                            </p>
                        </div>
                    </article>

                    <article class="about-feature-item">
                        <span
                            class="about-feature-icon"
                            aria-hidden="true"
                        >
                            <svg viewBox="0 0 24 24">
                                <path d="M4 19V9"></path>
                                <path d="M10 19V5"></path>
                                <path d="M16 19v-7"></path>
                                <path d="M22 19V2"></path>
                            </svg>
                        </span>

                        <div>
                            <h3>Team Analysis</h3>

                            <p>
                                A defensive coverage chart across all 18
                                types, shared weaknesses, immunities, and
                                type distribution.
                            </p>
                        </div>
                    </article>

                    <article class="about-feature-item">
                        <span
                            class="about-feature-icon"
                            aria-hidden="true"
                        >
                            <svg viewBox="0 0 24 24">
                                <path d="M5 4h12l2 2v14H5z"></path>
                                <path d="M8 4v6h8V4"></path>
                                <path d="M9 17h6"></path>
                            </svg>
                        </span>

                        <div>
                            <h3>Saved Teams</h3>

                            <p>
                                Create, edit, delete, search, and sort
                                multiple teams from your account.
                            </p>
                        </div>
                    </article>

                    <article class="about-feature-item">
                        <span
                            class="about-feature-icon"
                            aria-hidden="true"
                        >
                            <svg viewBox="0 0 24 24">
                                <path d="M8 7 4 11l4 4"></path>
                                <path d="M4 11h12"></path>
                                <path d="m16 17 4-4-4-4"></path>
                                <path d="M20 13H8"></path>
                            </svg>
                        </span>

                        <div>
                            <h3>Showdown Integration</h3>

                            <p>
                                Import and export teams using Pokémon
                                Showdown's familiar text format.
                            </p>
                        </div>
                    </article>

                    <article class="about-feature-item">
                        <span
                            class="about-feature-icon"
                            aria-hidden="true"
                        >
                            <svg viewBox="0 0 24 24">
                                <path d="M4 4h16v16H4z"></path>
                                <path d="M7 8h10"></path>
                                <path d="M7 12h10"></path>
                                <path d="M7 16h6"></path>
                            </svg>
                        </span>

                        <div>
                            <h3>Team Notes</h3>

                            <p>
                                Save strategy reminders and useful notes
                                alongside each team.
                            </p>
                        </div>
                    </article>

                    <article class="about-feature-item">
                        <span
                            class="about-feature-icon"
                            aria-hidden="true"
                        >
                            <svg viewBox="0 0 24 24">
                                <path d="m12 3 1.9 5.8L20 10.5l-5 3.6 1.9 5.9L12 16.4 7.1 20l1.9-5.9-5-3.6 6.1-1.7z"></path>
                            </svg>
                        </span>

                        <div>
                            <h3>Forms and Megas</h3>

                            <p>
                                Use regional forms and Mega Evolutions,
                                with the right typing and abilities.
                            </p>
                        </div>
                    </article>

                    <article class="about-feature-item">
                        <span
                            class="about-feature-icon"
                            aria-hidden="true"
                        >
                            <svg viewBox="0 0 24 24">
                                <path d="m3 17 6-6 4 4 8-8"></path>
                                <path d="M14 7h7v7"></path>
                            </svg>
                        </span>

                        <div>
                            <h3>Meta Usage Stats</h3>

                            <p>
                                See what's popular in each Smogon format
                                and apply common sets in one click.
                            </p>
                        </div>
                    </article>

                    <article class="about-feature-item">
                        <span
                            class="about-feature-icon"
                            aria-hidden="true"
                        >
                            <svg viewBox="0 0 24 24">
                                <rect x="5" y="2" width="14" height="20" rx="2"></rect>
                                <path d="M8 6h8"></path>
                                <path d="M8 11h2"></path>
                                <path d="M14 11h2"></path>
                                <path d="M8 15h2"></path>
                                <path d="M14 15h2"></path>
                            </svg>
                        </span>

                        <div>
                            <h3>Damage Calculator</h3>

                            <p>
                                Check damage ranges and KO chances, the
                                same way Pokémon Showdown does.
                            </p>
                        </div>
                    </article>
                </div>
            </article>

            <aside class="about-source-card">
                <p class="about-card-eyebrow">
                    Powered by PokéAPI
                </p>

                <p>
                    Brymon uses PokéAPI to retrieve Pokémon species,
                    sprites, types, abilities, moves, items, stats, and
                    related game data.
                </p>

                <p>
                    Usage stats come from Smogon, and damage calculations
                    from @smogon/calc, the engine behind Pokémon
                    Showdown's calculator.
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

    <!-- Project details -->
    <section class="about-project-details">
        <div class="container">
            <div class="about-project-grid">
                <article class="about-project-card">
                    <h2>About the Project</h2>

                    <p>
                        Brymon was developed as a full-stack Pokémon
                        team-building application focused on usability,
                        organization, and competitive team preparation.
                    </p>

                    <p>
                        The project also demonstrates custom PHP
                        architecture, authentication and authorization,
                        relational database design, third-party API
                        integration, responsive interface development,
                        asynchronous JavaScript, application security,
                        automated testing, and production deployment.
                    </p>
                </article>

                <article class="about-project-card">
                    <h2>Technology</h2>

                    <div class="about-technology-groups">
                        <div>
                            <h3>Backend</h3>

                            <ul>
                                <li>PHP 8</li>
                                <li>Custom MVC architecture</li>
                                <li>PostgreSQL</li>
                                <li>PDO</li>
                                <li>Composer PSR-4 autoloading</li>
                            </ul>
                        </div>

                        <div>
                            <h3>Frontend</h3>

                            <ul>
                                <li>Semantic HTML</li>
                                <li>Responsive CSS</li>
                                <li>Vanilla JavaScript</li>
                            </ul>
                        </div>

                        <div>
                            <h3>Integrations</h3>

                            <ul>
                                <li>PokéAPI</li>
                                <li>Pokémon Showdown import/export</li>
                                <li>Smogon usage stats</li>
                                <li>@smogon/calc</li>
                            </ul>
                        </div>

                        <div>
                            <h3>Testing and Deployment</h3>

                            <ul>
                                <li>PHPUnit</li>
                                <li>Playwright</li>
                                <li>Node test runner</li>
                                <li>Render</li>
                                <li>PostgreSQL production database</li>
                            </ul>
                        </div>
                    </div>
                </article>

                <article class="about-project-card">
                    <h2>Current Version</h2>

                    <p class="about-version">
                        Version 2.1
                    </p>

                    <ul class="about-version-list">
                        <li>Full Pokémon team builder and team analysis</li>
                        <li>Regional forms and Mega Evolutions</li>
                        <li>Defensive coverage chart</li>
                        <li>Meta usage stats and Popular Sets suggestions</li>
                        <li>Damage calculator</li>
                        <li>Pokédex</li>
                        <li>Public teams, likes, profiles, and following</li>
                        <li>Showdown import and export</li>
                        <li>Email verification and password reset</li>
                        <li>
                            Automated unit, integration, and E2E testing
                        </li>
                    </ul>

                    <h3>Future Roadmap</h3>

                    <ul>
                        <li>
                            Automated testing on every push (CI/CD)
                        </li>
                        <li>
                            A React and TypeScript team analysis view
                        </li>
                        <li>A small Laravel-powered API</li>
                        <li>Uploaded profile pictures</li>
                    </ul>
                </article>
            </div>
        </div>
    </section>
</main>

<?php require dirname(__DIR__) . '/layouts/footer.php'; ?>