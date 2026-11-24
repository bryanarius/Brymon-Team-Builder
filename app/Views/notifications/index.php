<?php

declare(strict_types=1);

use App\Core\RelativeTime;

$pageTitle = $pageTitle ?? 'Notifications';

require dirname(__DIR__) . '/layouts/header.php';

$notifications = $notifications ?? [];
$page = $page ?? 1;
$hasNextPage = $hasNextPage ?? false;

$escape = static fn (?string $value): string => htmlspecialchars(
    (string) $value,
    ENT_QUOTES,
    'UTF-8'
);

$pageUrl = static fn (int $number): string => '/notifications'
    . ($number > 1 ? '?page=' . $number : '');
?>

<main class="notifications-page" id="main-content">
    <div class="container">

        <h1>Notifications</h1>

        <?php if ($notifications === []): ?>
            <p class="profile-empty">
                <?= $page > 1
                    ? 'No more notifications.'
                    : 'No notifications yet. When someone follows you or likes one of your teams, it shows up here.' ?>
            </p>
        <?php else: ?>
            <ul class="notification-list">
                <?php foreach ($notifications as $notification): ?>
                    <?php
                    $actorDisplayName = trim((string) ($notification['actor_display_name'] ?? ''));
                    $actorName = $actorDisplayName !== ''
                        ? $actorDisplayName
                        : $notification['actor_username'];
                    $actorUrl = '/u/' . rawurlencode($notification['actor_username']);
                    ?>
                    <li class="notification<?= $notification['is_unread'] ? ' is-unread' : '' ?>">
                        <?php // The name link below is the same link, for keyboards and screen readers. ?>
                        <a href="<?= $escape($actorUrl) ?>" class="notification-avatar" tabindex="-1" aria-hidden="true">
                            <?php
                            $avatarId = $notification['actor_avatar_pokemon_id'];
                            $avatarName = $actorName;
                            $avatarModifier = 'list';
                            require dirname(__DIR__) . '/partials/avatar.php';
                            ?>
                        </a>

                        <p class="notification-text">
                            <?php if ($notification['is_unread']): ?>
                                <span class="visually-hidden">New:</span>
                            <?php endif; ?>

                            <a href="<?= $escape($actorUrl) ?>" class="notification-actor"><?= $escape($actorName) ?></a>

                            <?php if ($notification['type'] === 'follow'): ?>
                                started following you.
                            <?php else: ?>
                                liked your team
                                <a href="/teams/<?= (int) $notification['team_id'] ?>" class="notification-team"><?=
                                    $escape($notification['team_name'])
                                ?></a>.
                            <?php endif; ?>

                            <time
                                class="notification-time"
                                datetime="<?= $escape($notification['created_at']) ?>"
                            ><?= $escape(RelativeTime::short(
                                $notification['age_seconds'],
                                $notification['created_at']
                            )) ?></time>
                        </p>

                        <?php if ($notification['is_unread']): ?>
                            <span class="notification-dot" aria-hidden="true"></span>
                        <?php endif; ?>
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

<?php require dirname(__DIR__) . '/layouts/footer.php'; ?>
