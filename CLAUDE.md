# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Brymon is a full-stack Pokémon team builder built with a **custom PHP MVC architecture** (no framework), **PostgreSQL**, and **vanilla JavaScript**. It was built deliberately without Laravel/Symfony to demonstrate understanding of routing, auth, sessions, validation, and CSRF protection at a low level — keep that in mind before suggesting a framework or a framework-style abstraction.

## Commands

### Run the app locally

```bash
php -S localhost:8000 -t public
```

### Install dependencies

```bash
composer install   # PHP deps
npm install         # Playwright/E2E deps
```

### Tests

```bash
./vendor/bin/phpunit              # PHPUnit: Unit + Integration suites (see phpunit.xml)
./vendor/bin/phpunit --filter TestName   # run a single test/method
npx playwright test               # E2E suite (tests/E2E)
npx playwright test tests/E2E/login.spec.js   # run a single E2E spec
npx playwright test --headed      # run E2E with a visible browser
```

- PHPUnit bootstraps via `tests/bootstrap.php`, which loads env vars from `.env.testing` (not `.env`). Integration tests (`tests/Integration`) hit a **real PostgreSQL database** — create a separate `brymon_test` database and configure `.env.testing` before running them; each test truncates `team_pokemon`, `teams`, `users` in `setUp`/`tearDown`.
- Playwright expects the dev server already running at `http://localhost:8000` (see `playwright.config.js`) — start `php -S localhost:8000 -t public` first.

## Architecture

### Request lifecycle

All requests hit `public/index.php`, which: loads `.env` via `vlucas/phpdotenv`, sets error display based on `APP_ENV`, installs a global exception handler that renders `app/Views/errors/500.php`, starts the PHP session, then builds an `App\Core\Router` and requires `routes/web.php` to register routes before dispatching.

```
Browser → public/index.php → Router (routes/web.php) → Controller → Model → PostgreSQL
                                                             │
                                                             └──→ View (app/Views/**)
Browser JS → PokéAPI (client-side fetches, independent of the PHP backend)
```

### Core layer (`app/Core/`)

Hand-rolled infrastructure, no framework:

- **`Router`** — registers `GET`/`POST` routes as `[ControllerClass::class, 'method']` pairs, supports `{param}` path segments, matches with regex, dispatches by instantiating the controller and calling the method. Unmatched routes render `app/Views/errors/404.php`.
- **`Controller`** (abstract base) — `view($name, $data)` renders `app/Views/{$name}.php` after `extract()`ing `$data`.
- **`Model`** (abstract base) — just opens a `Database::connection()` PDO instance in the constructor. Domain models (`App\Models\Team`, `App\Models\User`) query PostgreSQL directly with prepared PDO statements; there is no query builder or ORM.
- **`Database`** — lazy singleton PDO connection. Prefers a `DATABASE_URL` env var (used in production/Render); falls back to discrete `DB_HOST`/`DB_PORT`/`DB_NAME`/`DB_USER`/`DB_PASSWORD` for local dev.
- **`Auth`** — session-based auth (`$_SESSION['user_id']`). Enforces both an idle timeout (60 min) and an absolute session timeout (8 hours). `Auth::requireLogin()` guards protected routes; `Auth::guestOnly()` guards login/register.
- **`Csrf`** — token stored in `$_SESSION['csrf_token']`, verified with `hash_equals`. JSON endpoints check the `X-CSRF-Token` header; classic form POSTs (e.g. team delete) check `$_POST['csrf_token']`. Every state-changing POST route must validate CSRF — follow the existing pattern in `TeamController` when adding new mutating endpoints.
- **`Validator`** — static helper methods for basic field checks (`required`, `email`, `minLength`, etc.) plus a dedicated `pokemonTeam(array $pokemon)` that encodes all team-building business rules (max 6 slots, unique slot numbers 1–6, EVs 0–252 per stat / ≤510 total, IVs 0–31, max 4 moves). This is the single source of truth for team validation rules — extend it rather than duplicating checks in controllers.
- **`Config::get($key, $default)`** — thin wrapper over `$_ENV`.

### Controllers → Models → Views

- Controllers (`app/Controllers/`) are `final` classes extending `Core\Controller`. JSON API-style endpoints (`TeamController::save/update`) set `Content-Type: application/json`, parse the raw request body with `json_decode(..., JSON_THROW_ON_ERROR)`, validate, and return structured JSON errors with explicit HTTP status codes (400/403/404/422/500) — follow this pattern for new API-style actions rather than mixing HTML and JSON responses in one action.
- All team data access is scoped by `user_id` at the query level (e.g. `findByIdAndUserId`, `deleteByIdAndUserId`) rather than fetched-then-checked in PHP — preserve this pattern for authorization; it's what the integration tests in `tests/Integration/TeamOwnershipTest.php` verify.
- Multi-statement writes (`Team::createWithPokemon`, `Team::updateWithPokemon`) wrap inserts/deletes in a PDO transaction with rollback on `Throwable`.
- Views (`app/Views/`) are plain PHP templates grouped by feature (`teams/`, `auth/`, `home/`, `about/`, `dashboard/`, `errors/`) plus shared `layouts/header.php` / `layouts/footer.php`.

### Frontend (`public/js/`)

Vanilla JS, no build step or bundler — files are included directly by views. Each file owns one feature area: `team-builder.js` (Pokémon search/filtering, team slot editing, EV/IV inputs, and Pokémon Showdown import/export parsing — the largest and most complex file), `team-analysis.js` (type/weakness analysis), `saved-teams.js`, `team-show.js`, `navigation.js`, `toast.js` (shared toast notifications). Pokémon data (species, stats, types, abilities) is fetched client-side directly from **PokéAPI**; the PHP backend only persists what the user configures.

### Database

PostgreSQL, accessed only via PDO prepared statements (no ORM). Core tables: `users`, `teams` (owned by a user), `team_pokemon` (up to 6 per team, ordered by `slot_number`, storing ability/item/nature/4 moves/EVs/IVs). Schema/migrations live under `database/` (`schema.sql`, `seeds.sql`) — note these files are currently empty in the working tree; check `database/migrations/` or ask before assuming schema state.

## Environment configuration

Two env files, both git-ignored: `.env` (app runtime, loaded by `public/index.php`) and `.env.testing` (used only by `tests/bootstrap.php` for PHPUnit). See `.env.example` for the required keys (`APP_ENV`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`); production instead supplies a single `DATABASE_URL`.
