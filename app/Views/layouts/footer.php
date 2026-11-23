<footer class="site-footer">
    <div class="container">
        <p>
            Brymon Team Builder &copy;
            <?= date('Y') ?> Bryan Arius
        </p>

        <p>Built with PHP, PostgreSQL, and PokéAPI.</p>

        <?php
        // Tells a report which page it came from, e.g. /teambuilder.
        $footerPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
        $feedbackFrom = $footerPath === '/feedback' ? [] : ['from' => $footerPath];
        ?>
        <p class="site-footer-links">
            <?php
            /*
             * A new tab, so a visitor doesn't lose an unsaved team.
             * noopener: the portfolio can't control this tab.
             */
            ?>
            <a
                href="https://bryanarius.github.io/Portfolio-Website/"
                target="_blank"
                rel="noopener"
                aria-label="My portfolio (opens in a new tab)"
            >My portfolio</a>

            <a href="/feedback?<?= htmlspecialchars(
                http_build_query(['type' => 'bug'] + $feedbackFrom),
                ENT_QUOTES,
                'UTF-8'
            ) ?>">Report a bug</a>

            <a href="/feedback?<?= htmlspecialchars(
                http_build_query(['type' => 'suggestion'] + $feedbackFrom),
                ENT_QUOTES,
                'UTF-8'
            ) ?>">Suggest a feature</a>
        </p>
    </div>
    <div
        id="toast-container"
        class="toast-container"
        aria-live="polite"
        aria-atomic="true">
    </div>
</footer>
<script src="/js/toast.js" defer></script>
<script src="/js/navigation.js" defer></script>
<script src="/js/form-submit.js" defer></script>
<script src="/js/combobox.js"></script>
<script src="/js/pokemon-forms.js"></script>
<script src="/js/type-chart.js"></script>
<script src="/js/popular-sets.js"></script>
<script src="/js/feedback-draft.js"></script>
<script src="/js/team-builder.js"></script>
<script src="/js/team-show.js" defer></script>
<script src="/js/saved-teams.js" defer></script>
<script src="/js/pokedex.js" defer></script>
<script src="/js/meta.js" defer></script>
<script src="/js/profile.js" defer></script>
<script src="/js/account.js" defer></script>
<?php // Scripts only one page needs, e.g. a large library. ?>
<?php foreach ($pageScripts ?? [] as $pageScript): ?>
<script src="<?= htmlspecialchars($pageScript, ENT_QUOTES, 'UTF-8') ?>" defer></script>
<?php endforeach; ?>
</body>
</html>