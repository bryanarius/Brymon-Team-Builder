<h1>Login</h1>

<?php if (isset($errors['login'])): ?>
    <p>
        <?= htmlspecialchars(
            $errors['login'],
            ENT_QUOTES,
            'UTF-8'
        ) ?>
    </p>
<?php endif; ?>

<form method="POST" action="/login">
    <div>
        <label for="email">Email</label><br>

        <input
            type="email"
            id="email"
            name="email"
            value="<?= htmlspecialchars(
                $old['email'] ?? '',
                ENT_QUOTES,
                'UTF-8'
            ) ?>"
        >

        <?php if (isset($errors['email'])): ?>
            <p>
                <?= htmlspecialchars(
                    $errors['email'],
                    ENT_QUOTES,
                    'UTF-8'
                ) ?>
            </p>
        <?php endif; ?>
    </div>

    <br>

    <div>
        <label for="password">Password</label><br>

        <input
            type="password"
            id="password"
            name="password"
        >

        <?php if (isset($errors['password'])): ?>
            <p>
                <?= htmlspecialchars(
                    $errors['password'],
                    ENT_QUOTES,
                    'UTF-8'
                ) ?>
            </p>
        <?php endif; ?>
    </div>

    <br>

    <button type="submit">Login</button>
</form>

<p>
    Don't have an account?
    <a href="/register">Register</a>
</p>