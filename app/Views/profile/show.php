<?php

declare(strict_types=1);

$pageTitle = $pageTitle ?? 'Trainer Profile';

require dirname(__DIR__) . '/layouts/header.php';

$isOwnProfile = $isOwnProfile ?? false;

$viewerLoggedIn = $viewerLoggedIn ?? false;

$isFollowedByViewer = !empty($isFollowedByViewer);

$teams = $teams ?? [];
?>

<section class="profile-page">
    <div class="container">

        <header class="profile-header">
            <h1><?= htmlspecialchars(
                (string) $profileUser['username'],
                ENT_QUOTES,
                'UTF-8'
            ) ?></h1>

            <p class="profile-stats">
                <span>
                    <strong id="profile-follower-count"><?=
                        (int) $followerCount
                    ?></strong> followers
                </span>
                <span>
                    <strong><?= (int) $followingCount ?></strong> following
                </span>
                <span>
                    <strong><?= count($teams) ?></strong> public teams
                </span>
            </p>

            <?php if ($viewerLoggedIn && !$isOwnProfile): ?>
                <button
                    type="button"
                    class="profile-follow-button<?= $isFollowedByViewer
                        ? ' is-following'
                        : '' ?>"
                    id="profile-follow-button"
                    data-username="<?= htmlspecialchars(
                        (string) $profileUser['username'],
                        ENT_QUOTES,
                        'UTF-8'
                    ) ?>"
                    aria-pressed="<?= $isFollowedByViewer ? 'true' : 'false' ?>"
                >
                    <?= $isFollowedByViewer ? 'Following' : 'Follow' ?>
                </button>
            <?php elseif (!$viewerLoggedIn): ?>
                <a href="/login" class="profile-follow-signin">
                    Sign in to follow
                </a>
            <?php endif; ?>
        </header>

        <?php if ($teams === []): ?>
            <p class="profile-empty">
                <?= $isOwnProfile
                    ? 'You have no public teams yet. Make a team public to '
                        . 'show it here.'
                    : 'This trainer has no public teams yet.' ?>
            </p>
        <?php else: ?>
            <ul class="team-card-list">
                <?php $showOwner = false; ?>
                <?php foreach ($teams as $team): ?>
                    <?php require dirname(__DIR__) . '/teams/_card.php'; ?>
                <?php endforeach; ?>
            </ul>
        <?php endif; ?>

    </div>
</section>

<?php if ($viewerLoggedIn): ?>
    <script>
        window.BRYMON_CSRF_TOKEN = <?= json_encode(
            \App\Core\Csrf::token(),
            JSON_THROW_ON_ERROR
        ) ?>;
    </script>
<?php endif; ?>

<?php require dirname(__DIR__) . '/layouts/footer.php'; ?>
