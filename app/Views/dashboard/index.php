<pre>
<?php print_r($_SESSION); ?>
</pre>

<h1>Dashboard</h1>

<p>
    Welcome,
    <?= htmlspecialchars($username, ENT_QUOTES, 'UTF-8') ?>!
</p>