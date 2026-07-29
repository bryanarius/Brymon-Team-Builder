<?php

declare(strict_types=1);

$pageTitle = $pageTitle ?? 'Saved Teams';

require dirname(__DIR__) . '/layouts/header.php';

$teamCount = count($teams);

$formatDate = static function (?string $date): string {
    if (empty($date)) {
        return 'Unknown';
    }

    $timestamp = strtotime($date);

    if ($timestamp === false) {
        return 'Unknown';
    }

    return date('M j, Y', $timestamp);
};
?>

<section class="saved-teams-page">
    <div class="saved-teams-container">

        <div class="saved-teams-header">
            <div class="saved-teams-heading">
                <h1>Saved Teams</h1>

                <p>
                    View, manage, and load your saved Pokémon teams.
                </p>

                <span class="saved-teams-count">
                    <?= $teamCount ?>
                    <?= $teamCount === 1 ? 'Team' : 'Teams' ?> Saved
                </span>
            </div>

            <?php if ($teamCount > 0): ?>
                <div class="saved-teams-controls">
                    <div class="team-search">
                        <label class="sr-only" for="team-search">
                            Search teams
                        </label>

                        <span class="team-search-icon" aria-hidden="true">
                            &#128269;
                        </span>

                        <input
                            id="team-search"
                            type="search"
                            placeholder="Search teams..."
                            autocomplete="off"
                        >
                    </div>

                    <div class="team-sort">
                        <label class="sr-only" for="team-sort">
                            Sort teams
                        </label>

                        <select id="team-sort">
                            <option value="updated-desc">
                                Sort by: Recently Updated
                            </option>

                            <option value="updated-asc">
                                Sort by: Least Recently Updated
                            </option>

                            <option value="name-asc">
                                Sort by: Name A–Z
                            </option>

                            <option value="name-desc">
                                Sort by: Name Z–A
                            </option>
                        </select>
                    </div>

                    <div class="view-buttons" aria-label="Team view options">
                        <button
                            class="view-button active"
                            type="button"
                            aria-label="Grid view"
                            aria-pressed="true"
                        >
                            <span aria-hidden="true">&#9638;</span>
                        </button>

                        <button
                            class="view-button"
                            type="button"
                            aria-label="List view"
                            aria-pressed="false"
                        >
                            <span aria-hidden="true">&#9776;</span>
                        </button>
                    </div>
                </div>
            <?php endif; ?>
        </div>

        <?php if ($teamCount === 0): ?>

            <div class="teams-empty-state">
                <div class="teams-empty-icon" aria-hidden="true">
                    +
                </div>

                <h2>No saved teams yet</h2>

                <p>
                    Create your first team and begin building your Pokémon
                    lineup.
                </p>

                <a class="teams-primary-button" href="/teams/teambuilder">
                    Create Your First Team
                </a>
            </div>

        <?php else: ?>

            <div class="teams-grid" id="teams-grid">

                <?php foreach ($teams as $team): ?>
                    <?php
                    $teamId = (int) $team['id'];
                    $teamName = (string) $team['name'];
                    $teamNotes = trim((string) ($team['notes'] ?? ''));
                    $updatedAt = $team['updated_at'] ?? null;
                    ?>

                    <article
                        class="saved-team-card"
                        data-team-name="<?= htmlspecialchars(
                            strtolower($teamName),
                            ENT_QUOTES,
                            'UTF-8'
                        ) ?>"
                        data-updated-at="<?= htmlspecialchars(
                            (string) $updatedAt,
                            ENT_QUOTES,
                            'UTF-8'
                        ) ?>"
                    >
                        <div class="saved-team-card-header">
                            <div>
                                <h2>
                                    <?= htmlspecialchars(
                                        $teamName,
                                        ENT_QUOTES,
                                        'UTF-8'
                                    ) ?>
                                </h2>

                                <p class="saved-team-updated">
                                    Updated
                                    <?= htmlspecialchars(
                                        $formatDate($updatedAt),
                                        ENT_QUOTES,
                                        'UTF-8'
                                    ) ?>
                                </p>
                            </div>

                            <button
                                class="team-menu-button"
                                type="button"
                                aria-label="Open options for <?= htmlspecialchars(
                                    $teamName,
                                    ENT_QUOTES,
                                    'UTF-8'
                                ) ?>"
                            >
                                &#8942;
                            </button>
                        </div>

                        <div
                            class="team-pokemon-preview"
                            aria-label="Pokémon team slots"
                        >
                            <?php for ($slot = 1; $slot <= 6; $slot++): ?>
                                <div
                                    class="pokemon-preview-slot"
                                    aria-label="Empty Pokémon slot <?= $slot ?>"
                                >
                                    <span aria-hidden="true">
                                        +
                                    </span>
                                </div>
                            <?php endfor; ?>
                        </div>

                        <?php if ($teamNotes !== ''): ?>
                            <p class="saved-team-notes">
                                <?= htmlspecialchars(
                                    $teamNotes,
                                    ENT_QUOTES,
                                    'UTF-8'
                                ) ?>
                            </p>
                        <?php endif; ?>

                        <div class="saved-team-summary">
                            <div class="team-summary-item">
                                <span class="team-summary-label">
                                    Pokémon
                                </span>

                                <strong>0/6</strong>
                            </div>

                            <div class="team-summary-item">
                                <span class="team-summary-label">
                                    Types
                                </span>

                                <strong>—</strong>
                            </div>

                            <div class="team-summary-item">
                                <span class="team-summary-label">
                                    Team Coverage
                                </span>

                                <strong>—</strong>
                            </div>
                        </div>

                        <a
                            class="view-team-button"
                            href="/teams/<?= $teamId ?>"
                        >
                            View Team
                        </a>
                    </article>
                <?php endforeach; ?>

                <a class="create-team-card" href="/teams/teambuilder">
                    <span class="create-team-icon" aria-hidden="true">
                        +
                    </span>

                    <span class="create-team-content">
                        <strong>Create New Team</strong>

                        <small>
                            Start building a team from scratch
                        </small>
                    </span>
                </a>

            </div>

        <?php endif; ?>

    </div>
</section>

<?php require dirname(__DIR__) . '/layouts/footer.php'; ?>