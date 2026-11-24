<?php

declare(strict_types=1);

/**
 * The heart in the header that opens /notifications, with a badge for
 * unread ones. Shown twice (next to the account menu, and next to the
 * mobile menu button on phones); CSS shows one at a time.
 *
 * Expects in scope:
 *   $unreadNotifications  int     unread count, already capped at 10
 *   $notificationHeartClass string extra class for where it sits
 */

$unreadNotifications = (int) ($unreadNotifications ?? 0);
$notificationBadge = $unreadNotifications >= 10 ? '9+' : (string) $unreadNotifications;
$onNotificationsPage = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) === '/notifications';

// The badge is hidden from screen readers, so the label carries the count.
$notificationLabel = $unreadNotifications > 0
    ? "Notifications, {$notificationBadge} new"
    : 'Notifications';
?>
<a
    href="/notifications"
    class="notification-heart <?= htmlspecialchars($notificationHeartClass ?? '', ENT_QUOTES, 'UTF-8') ?><?=
        $unreadNotifications > 0 ? ' has-unread' : ''
    ?>"
    aria-label="<?= $notificationLabel ?>"
    title="Notifications"
    <?= $onNotificationsPage ? 'aria-current="page"' : '' ?>
>
    <i
        class="<?= $onNotificationsPage ? 'fa-solid' : 'fa-regular' ?> fa-heart notification-heart-icon"
        aria-hidden="true"
    ></i>

    <?php if ($unreadNotifications > 0): ?>
        <span class="notification-heart-badge" aria-hidden="true"><?= $notificationBadge ?></span>
    <?php endif; ?>
</a>
