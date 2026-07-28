<h1>Register</h1>

<form method="POST" action="/register">
    <div>
        <label for="username">Username</label><br>

        <input
            type="text"
            id="username"
            name="username"
            value="<?= htmlspecialchars($old['username'] ?? '', ENT_QUOTES, 'UTF-8') ?>"
        >

        <?php if (isset($errors['username'])): ?>
            <p><?= htmlspecialchars($errors['username'], ENT_QUOTES, 'UTF-8') ?></p>
        <?php endif; ?>
    </div>

    <br>

    <div>
        <label for="email">Email</label><br>

        <input
            type="email"
            id="email"
            name="email"
            value="<?= htmlspecialchars($old['email'] ?? '', ENT_QUOTES, 'UTF-8') ?>"
        >

        <?php if (isset($errors['email'])): ?>
            <p><?= htmlspecialchars($errors['email'], ENT_QUOTES, 'UTF-8') ?></p>
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
            <p><?= htmlspecialchars($errors['password'], ENT_QUOTES, 'UTF-8') ?></p>
        <?php endif; ?>
    </div>

    <br>

    <div>
        <label for="password_confirmation">
            Confirm Password
        </label><br>

        <input
            type="password"
            id="password_confirmation"
            name="password_confirmation"
        >

        <?php if (isset($errors['password_confirmation'])): ?>
            <p>
                <?= htmlspecialchars(
                    $errors['password_confirmation'],
                    ENT_QUOTES,
                    'UTF-8'
                ) ?>
            </p>
        <?php endif; ?>
    </div>

    <br>

    <button type="submit">Register</button>
</form>