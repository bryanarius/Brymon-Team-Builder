<?php

declare(strict_types=1);

$pageTitle = $pageTitle ?? 'Followers';

require dirname(__DIR__) . '/layouts/header.php';

$list = $list ?? 'followers';
$isFollowersList = $list === 'followers';
$trainers = $trainers ?? [];
$page = $page ?? 1;
$hasNextPage = $hasNextPage ?? false;
$isOwnProfile = $isOwnProfile ?? false;
$viewerId = $viewerId ?? null;
$viewerFollowingIds = $viewerFollowingIds ?? [];
$viewerFollowerIds = $viewerFollowerIds ?? [];

$escape = static fn (?string $value): string => htmlspecialchars(
    (string) $value,
    ENT_QUOTES,
    'UTF-8'
);

$profileUsername = (string) $profileUser['username'];
$profileDisplayName = trim((string) ($profileUser['display_name'] ?? ''));
$profileHeading = $profileDisplayName !== '' ? $profileDisplayName : $profileUsername;
$profileUrl = '/u/' . rawurlencode($profileUsername);

$pageUrl = static fn (int $number): string => "{$profileUrl}/{$list}"
    . ($number > 1 ? '?page=' . $number : '');

$emptyMessage = match (true) {
    $page > 1 => 'No more trainers to show.',
    $isFollowersList && $isOwnProfile => 'No followers yet. Share a public team to get noticed.',
    $isFollowersList => 'No followers yet.',
    $isOwnProfile => "You aren't following anyone yet.",
    default => "Not following anyone yet.",
};
?>

<main class="profile-page follow-list-page" id="main-content">
    <div class="container">

        <header class="follow-list-header">
            <a href="<?= $escape($profileUrl) ?>" class="follow-list-back">
                <?php
                $avatarId = $profileUser['avatar_pokemon_id'] ?? null;
                $avatarName = $profileHeading;
                $avatarModifier = 'card';
                require dirname(__DIR__) . '/partials/avatar.php';
                ?>
                <span>
                    <span class="visually-hidden">Back to the profile of</span>
                    <?= $escape($profileHeading) ?>
                </span>
            </a>

            <h1><?= $isFollowersList ? 'Followers' : 'Following' ?></h1>
        </header>

        <nav class="follow-tabs" aria-label="Followers and following">
            <a
                href="<?= $escape($profileUrl . '/followers') ?>"
                class="follow-tab"
                <?= $isFollowersList ? 'aria-current="page"' : '' ?>
            >
                <strong><?= (int) $followerCount ?></strong>
                <?= (int) $followerCount === 1 ? 'Follower' : 'Followers' ?>
            </a>

            <a
                href="<?= $escape($profileUrl . '/following') ?>"
                class="follow-tab"
                <?= $isFollowersList ? '' : 'aria-current="page"' ?>
            >
                <strong><?= (int) $followingCount ?></strong> Following
            </a>
        </nav>

        <?php if ($trainers === []): ?>
            <p class="profile-empty"><?= $escape($emptyMessage) ?></p>
        <?php else: ?>
            <ul class="follow-list">
                <?php foreach ($trainers as $trainer): ?>
                    <?php
                    $trainerDisplayName = trim((string) ($trainer['display_name'] ?? ''));
                    $trainerName = $trainerDisplayName !== ''
                        ? $trainerDisplayName
                        : $trainer['username'];
                    ?>
                    <li class="follow-row">
                        <a
                            href="/u/<?= $escape(rawurlencode($trainer['username'])) ?>"
                            class="follow-row-link"
                        >
                            <?php
                            $avatarId = $trainer['avatar_pokemon_id'];
                            $avatarName = $trainerName;
                            $avatarModifier = 'list';
                            require dirname(__DIR__) . '/partials/avatar.php';
                            ?>

                            <span class="follow-row-names">
                                <span class="follow-row-name"><?= $escape($trainerName) ?></span>
                                <span class="follow-row-username">@<?= $escape($trainer['username']) ?></span>
                            </span>
                        </a>

                        <?php
                        // Signed-in viewers only, and never on their own row.
                        if ($viewerId !== null && $trainer['id'] !== $viewerId):
                            $followButtonUsername = $trainer['username'];
                            $followButtonName = $trainerName;
                            $followButtonFollowing = in_array($trainer['id'], $viewerFollowingIds, true);
                            $followButtonFollowsViewer = in_array($trainer['id'], $viewerFollowerIds, true);
                            $followButtonSize = 'small';
                            require dirname(__DIR__) . '/partials/follow-button.php';
                        endif;
                        ?>
                    </li>
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

    </div>
</main>

<?php if ($viewerId !== null): ?>
    <script>
        window.BRYMON_CSRF_TOKEN = <?= json_encode(
            \App\Core\Csrf::token(),
            JSON_THROW_ON_ERROR
        ) ?>;
    </script>
<?php endif; ?>

<?php require dirname(__DIR__) . '/layouts/footer.php'; ?>
