<?php

declare(strict_types=1);

$pageTitle = $pageTitle ?? 'Dashboard';

require dirname(__DIR__) . '/layouts/header.php';

$sections = [
    [
        'title' => 'From trainers you follow',
        'teams' => $followingTeams ?? [],
        'empty' => 'Follow some trainers to see their public teams here.',
    ],
    [
        'title' => 'Popular teams',
        'teams' => $popularTeams ?? [],
        'empty' => 'No public teams yet. Make one of yours public to start.',
    ],
    [
        'title' => 'Recently shared',
        'teams' => $recentTeams ?? [],
        'empty' => 'No public teams yet.',
    ],
];

$showOwner = true;
?>

<main class="dashboard" id="main-content">
    <div class="container">

        <header class="dashboard-header">
            <h1>Dashboard</h1>

            <p>
                Welcome back,
                <?= htmlspecialchars(
                    (string) $username,
                    ENT_QUOTES,
                    'UTF-8'
                ) ?>.
            </p>
        </header>

        <?php foreach ($sections as $section): ?>
            <section class="dashboard-section">
                <h2><?= htmlspecialchars(
                    $section['title'],
                    ENT_QUOTES,
                    'UTF-8'
                ) ?></h2>

                <?php if ($section['teams'] === []): ?>
                    <p class="dashboard-empty"><?= htmlspecialchars(
                        $section['empty'],
                        ENT_QUOTES,
                        'UTF-8'
                    ) ?></p>
                <?php else: ?>
                    <ul class="team-card-list">
                        <?php foreach ($section['teams'] as $team): ?>
                            <?php require dirname(__DIR__)
                                . '/teams/_card.php'; ?>
                        <?php endforeach; ?>
                    </ul>
                <?php endif; ?>
            </section>
        <?php endforeach; ?>

    </div>
</main>

<?php require dirname(__DIR__) . '/layouts/footer.php'; ?>
