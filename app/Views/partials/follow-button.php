<?php

declare(strict_types=1);

/**
 * Follow / Following / Follow back button, wired up by public/js/profile.js.
 *
 * Expects in scope:
 *   $followButtonUsername       string  the trainer to follow
 *   $followButtonName           string  their display name, for screen readers
 *   $followButtonFollowing      bool    the viewer follows them
 *   $followButtonFollowsViewer  bool    they follow the viewer ("Follow back")
 *   $followButtonSize           string  "large" (profile) | "small" (list rows)
 *   $followButtonId             ?string optional id
 */

$followButtonFollowing = !empty($followButtonFollowing);
$followButtonFollowsViewer = !empty($followButtonFollowsViewer);
$followButtonSize = ($followButtonSize ?? 'large') === 'small' ? 'small' : 'large';
$followButtonId = $followButtonId ?? null;

$followButtonLabel = match (true) {
    $followButtonFollowing => 'Following',
    $followButtonFollowsViewer => 'Follow back',
    default => 'Follow',
};

$followButtonEscape = static fn (string $value): string => htmlspecialchars(
    $value,
    ENT_QUOTES,
    'UTF-8'
);
?>
<button
    type="button"
    class="profile-follow-button profile-follow-button--<?= $followButtonSize ?><?=
        $followButtonFollowing ? ' is-following' : ''
    ?>"
    <?= $followButtonId !== null ? 'id="' . $followButtonEscape($followButtonId) . '"' : '' ?>
    data-follow-button
    data-username="<?= $followButtonEscape((string) $followButtonUsername) ?>"
    data-follows-viewer="<?= $followButtonFollowsViewer ? 'true' : 'false' ?>"
    aria-pressed="<?= $followButtonFollowing ? 'true' : 'false' ?>"
>
    <span data-follow-label><?= $followButtonLabel ?></span><?php
    // "Follow" alone is ambiguous in a list of trainers.
    if ($followButtonSize === 'small'): ?><span class="visually-hidden"> <?=
        $followButtonEscape((string) $followButtonName)
    ?></span><?php endif; ?>
</button>
