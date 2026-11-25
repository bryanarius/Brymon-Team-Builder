<?php

declare(strict_types=1);

/**
 * The search results: on the page itself, and on their own at
 * /trainers/results for trainer-search.js to swap in as you type.
 */

$query = $query ?? '';
$trainers = $trainers ?? [];
$page = $page ?? 1;
$hasNextPage = $hasNextPage ?? false;
$viewerId = $viewerId ?? null;
$viewerFollowingIds = $viewerFollowingIds ?? [];
$viewerFollowerIds = $viewerFollowerIds ?? [];

$escape = static fn (?string $value): string => htmlspecialchars(
    (string) $value,
    ENT_QUOTES,
    'UTF-8'
);

$pageUrl = static fn (int $number): string => '/trainers?' . http_build_query(
    ['q' => $query] + ($number > 1 ? ['page' => $number] : [])
);

// Read out by screen readers after each search as you type.
$trainerCount = count($trainers) . ($hasNextPage ? '+' : '');
$summary = match (true) {
    $query === '' => '',
    $trainers === [] => 'No trainers found.',
    $trainerCount === '1' => '1 trainer found.',
    default => "{$trainerCount} trainers found.",
};
?>
<div data-trainer-search-summary="<?= $escape($summary) ?>">
    <?php if ($query === ''): ?>
        <p class="profile-empty">
            Search for a trainer to see their profile and teams.
        </p>
    <?php else: ?>
        <h2 class="trainer-search-heading">
            Results for “<?= $escape($query) ?>”
        </h2>

        <?php if ($trainers === []): ?>
            <p class="profile-empty">
                <?= $page > 1
                    ? 'No more trainers to show.'
                    : 'No trainers match “' . $escape($query) . '”.' ?>
            </p>
        <?php else: ?>
            <ul class="follow-list">
                <?php foreach ($trainers as $trainer): ?>
                    <?php require dirname(__DIR__) . '/partials/trainer-row.php'; ?>
                <?php endforeach; ?>
            </ul>
        <?php endif; ?>

        <?php if ($page > 1 || $hasNextPage): ?>
            <nav class="follow-pagination" aria-label="Pages">
                <?php if ($page > 1): ?>
                    <a href="<?= $escape($pageUrl($page - 1)) ?>" rel="prev">Previous</a>
                <?php endif; ?>

                <?php if ($hasNextPage): ?>
                    <a href="<?= $escape($pageUrl($page + 1)) ?>" rel="next">Next</a>
                <?php endif; ?>
            </nav>
        <?php endif; ?>
    <?php endif; ?>
</div>
