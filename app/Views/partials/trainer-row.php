<?php

declare(strict_types=1);

/**
 * One trainer in a list: avatar and names linking to their profile, plus a
 * Follow button for signed-in viewers (never on their own row). Used by the
 * followers / following lists and trainer search.
 *
 * Expects in scope:
 *   $trainer             array   id, username, display_name, avatar_pokemon_id
 *   $viewerId            ?int    the signed-in trainer, or null for guests
 *   $viewerFollowingIds  int[]   rows the viewer follows
 *   $viewerFollowerIds   int[]   rows that follow the viewer
 *   $trainerRowAction    string  optional: 'follow' (default), or
 *                                'remove-recent' for an ✕ that removes the
 *                                trainer from your recent searches
 */

$trainerDisplayName = trim((string) ($trainer['display_name'] ?? ''));
$trainerName = $trainerDisplayName !== '' ? $trainerDisplayName : $trainer['username'];
$trainerRowAction = $trainerRowAction ?? 'follow';
?>
<li class="follow-row" data-username="<?= htmlspecialchars($trainer['username'], ENT_QUOTES, 'UTF-8') ?>">
    <a
        href="/u/<?= htmlspecialchars(rawurlencode($trainer['username']), ENT_QUOTES, 'UTF-8') ?>"
        class="follow-row-link"
    >
        <?php
        $avatarId = $trainer['avatar_pokemon_id'];
        $avatarName = $trainerName;
        $avatarModifier = 'list';
        require __DIR__ . '/avatar.php';
        ?>

        <span class="follow-row-names">
            <span class="follow-row-name"><?= htmlspecialchars($trainerName, ENT_QUOTES, 'UTF-8') ?></span>
            <span class="follow-row-username">@<?= htmlspecialchars($trainer['username'], ENT_QUOTES, 'UTF-8') ?></span>
        </span>
    </a>

    <?php if ($trainerRowAction === 'remove-recent'): ?>
        <button
            type="button"
            class="recent-search-remove"
            data-recent-search-remove
            aria-label="Remove <?= htmlspecialchars($trainerName, ENT_QUOTES, 'UTF-8') ?> from recent searches"
            title="Remove"
        >
            <i class="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>
    <?php
    elseif ($viewerId !== null && $trainer['id'] !== $viewerId):
        $followButtonUsername = $trainer['username'];
        $followButtonName = $trainerName;
        $followButtonFollowing = in_array($trainer['id'], $viewerFollowingIds, true);
        $followButtonFollowsViewer = in_array($trainer['id'], $viewerFollowerIds, true);
        $followButtonSize = 'small';
        require __DIR__ . '/follow-button.php';
    endif;
    ?>
</li>
