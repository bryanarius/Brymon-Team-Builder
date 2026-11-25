<?php

declare(strict_types=1);

/**
 * The magnifying glass in the header that opens trainer search. Shown
 * twice, like the notifications heart; CSS shows one at a time.
 *
 * Expects in scope:
 *   $trainerSearchClass  string  extra class for where it sits
 */

$onTrainerSearch = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) === '/trainers';
?>
<a
    href="/trainers"
    class="header-icon-link <?= htmlspecialchars($trainerSearchClass ?? '', ENT_QUOTES, 'UTF-8') ?>"
    aria-label="Find trainers"
    title="Find trainers"
    <?= $onTrainerSearch ? 'aria-current="page"' : '' ?>
>
    <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
</a>
