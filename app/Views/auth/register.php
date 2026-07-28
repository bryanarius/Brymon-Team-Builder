<h1>Register</h1>

<form method="POST" action="/register">
    <div>
        <label for="username">Username</label><br>
        <input
            type="text"
            id="username"
            name="username"
            required
        >
    </div>

    <br>

    <div>
        <label for="email">Email</label><br>
        <input
            type="email"
            id="email"
            name="email"
            required
        >
    </div>

    <br>

    <div>
        <label for="password">Password</label><br>
        <input
            type="password"
            id="password"
            name="password"
            required
        >
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
            required
        >
    </div>

    <br>

    <button type="submit">
        Register
    </button>
</form>