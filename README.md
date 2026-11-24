# Brymon Team Builder

A full-stack Pokémon team builder: build, analyze, save, and share competitive teams, with a damage calculator, meta usage stats, and Pokémon Showdown import/export.

Built from scratch with a **custom PHP MVC framework** (no Laravel), **PostgreSQL**, **vanilla JavaScript**, and **React + TypeScript** islands.

**Live:** [brymonteambuilder.com](https://brymonteambuilder.com)

![Brymon Team Builder](docs/screenshots/team-builder1.png)

<details>
<summary><strong>More screenshots</strong></summary>

### Home

![Brymon Home](docs/screenshots/home.png)

### Team Builder

![Brymon Team Builder](docs/screenshots/team-builder2.png)

### Saved Teams

![Brymon Saved Teams](docs/screenshots/saved-teams.png)

### Team Analysis

![Brymon Team Analysis](docs/screenshots/team-analysis1.png)

![Brymon Team Analysis](docs/screenshots/team-analysis2.png)

![Brymon Defensive Coverage Chart](docs/screenshots/defensive-chart.png)

### Damage Calculator

![Brymon Damage Calculator](docs/screenshots/damage-calc.png)

### Meta Usage Stats

![Brymon Meta Usage Stats](docs/screenshots/meta.png)

### Pokédex

![Brymon Pokédex](docs/screenshots/pokedex.png)

![Brymon Pokédex detail panel](docs/screenshots/pokedex-detail.png)

### Dashboard Feed

![Brymon Dashboard](docs/screenshots/dashboard.png)

### Trainer Profile

![Brymon Trainer Profile](docs/screenshots/profile.png)

### Shared Team

![Brymon Shared Team](docs/screenshots/shared-team.png)

</details>

---

## Highlights

- **Custom PHP MVC, no framework.** Routing, controllers, sessions, authentication, validation, and CSRF protection are written by hand, to learn what frameworks normally hide.
- **PostgreSQL** accessed through PDO prepared statements, with transactions for multi-step writes, access to each user's data enforced in the query itself, and hand-written migrations.
- **React + TypeScript islands.** The damage calculator and team analysis were moved to React one page at a time, without a rewrite. They use `useReducer` with typed actions, split React Context, and custom hooks, built with Vite.
- **Security:** email verification, password reset with hashed expiring tokens, idle and absolute session timeouts, CSRF on every state-changing request, and rate limiting with spam checks on public forms.
- **Tested at four levels:** PHPUnit (unit and PostgreSQL integration), Vitest with React Testing Library, Node's test runner, and Playwright end-to-end. Bugs reported by players become regression tests.
- **Real integrations:** PokéAPI (REST and GraphQL), Smogon usage stats cached on the server, `@smogon/calc` (the engine behind Showdown's calculator), and Showdown team import/export.
- **Built from player feedback:** regional forms, Mega Evolutions, the coverage chart, meta stats, and the calculator were all requested by players, and players can report bugs or suggest features from any page.

---

## Design Process

Designed in Figma before any code was written: a user flow, then low-fidelity wireframes, then high-fidelity mockups, then the finished build.

<table>
  <tr>
    <th>Wireframe</th>
    <th>Mockup</th>
    <th>Built</th>
  </tr>
  <tr>
    <td><img src="docs/low-fi/team-builder.png" alt="Team Builder wireframe"></td>
    <td><img src="docs/high-fi/team-builder.png" alt="Team Builder mockup"></td>
    <td><img src="docs/screenshots/team-builder1.png" alt="Team Builder as built"></td>
  </tr>
</table>

<details>
<summary><strong>See the user flow, all wireframes, and all mockups</strong></summary>

### User Flow

How a user moves through sign-up, building a team, configuring Pokémon, and managing saved teams.

![Brymon User Flow](docs/low-fi/user-flow.png)

### Low-Fidelity Wireframes

Page structure, information hierarchy, and the main interactions, before any visual design.

**Home**

![Brymon Low-Fidelity Home](docs/low-fi/home-page.png)

**Team Builder**

![Brymon Low-Fidelity Team Builder](docs/low-fi/team-builder.png)

**Pokémon Editor**

![Brymon Low-Fidelity Pokémon Editor](docs/low-fi/pokemon-editor.png)

**Saved Teams**

![Brymon Low-Fidelity Saved Teams](docs/low-fi/saved-pokemon.png)

### High-Fidelity Mockups

The visual design system: layout, typography, spacing, and component styles.

**Home**

![Brymon High-Fidelity Home](docs/high-fi/home.png)

**Team Builder**

![Brymon High-Fidelity Team Builder](docs/high-fi/team-builder.png)

**Saved Teams**

![Brymon High-Fidelity Saved Teams](docs/high-fi/saved-teams.png)

**About**

![Brymon High-Fidelity About](docs/high-fi/about.png)

</details>

---

## Features

- **Team Builder:** up to six Pokémon with regional forms, Mega Evolutions, abilities, items, natures, moves, EVs, and IVs, plus a live defensive coverage chart and one-click "Popular Sets" from Smogon data.
- **Team Analysis:** shared weaknesses, immunities, move coverage, role balance, and an 18-type defensive chart.
- **Damage Calculator:** damage ranges and KO chances that match Showdown's, with weather, terrain, screens, boosts, and Tera types. Load any Pokémon from your saved teams.
- **Meta Usage Stats:** the 100 most-used Pokémon per format, with their common moves, items, spreads, and teammates.
- **Pokédex:** search and filter every Pokémon by type, generation, region, and role.
- **Showdown Import/Export:** handles nicknames, gender markers, alternate forms, and cosmetic forms. A failed import says which Pokémon it couldn't find and can be reported in one click.
- **Social:** public and private teams, shareable team pages, likes, follows, trainer profiles, and a personalized feed.
- **Feedback:** bug reports and feature suggestions from the footer of every page, open to guests.

<details>
<summary><strong>Full feature list</strong></summary>

### Authentication

- Registration with email verification (and resending the verification email)
- Login blocked until the email is verified
- Password reset by email
- Account settings: change username and password
- Password hashing, session regeneration after login, and idle and absolute session timeouts
- Protected routes, CSRF protection, and secure logout

### Pokémon Browser and Pokédex

- Live search by full or partial name, filtered by generation and type, with several sort orders
- Pokédex filters by type, generation, region, role (physical or special attacker, wall, balanced, fast, powerhouse), and "has a Mega Evolution"
- Detail panel: official artwork, base stats, abilities, flavor text, evolution chain, and Mega Evolution links

### Team Builder

- Regional forms (Alolan, Galarian, Hisuian, Paldean)
- Mega Evolutions and Primal Reversions, with the Mega Stone equipped automatically
- Team names, notes, and nicknames
- Searchable held item and move selectors
- Nature selection with stat-effect hints
- EVs and IVs, base stats, and a live team summary
- A defensive coverage chart that accounts for abilities
- Popular Sets: the most-used moves, items, abilities, and EV spreads for the selected Pokémon in a chosen format

### Team Management and Analysis

- Create, view, edit, delete, search, and sort saved teams
- Shared weaknesses, immunities, type distribution, move coverage, resistance suggestions, and role balance

### Meta Usage Stats

- Formats: OU, Ubers, UU, RU, NU, PU, National Dex, Doubles OU, and VGC, each explained in plain language
- Per-Pokémon breakdown: moves, items, abilities, EV spreads, Tera types, and teammates
- Search and shareable URLs (`?format=gen9ou&pokemon=Kingambit`)
- Data from Smogon via `pkmn.github.io`, trimmed and cached on the server for a day. The cached copy is still served if the source is down.

### Damage Calculator

- Attacker and defender: species, level, ability, item, nature, Tera type, status, EVs, IVs, and stat boosts
- Battle conditions: singles or doubles, weather, terrain, Reflect, Light Screen, Aurora Veil, and critical hits
- Swap attacker and defender, or open a Pokémon straight from its saved team page

### Social

- Public and private teams, with read-only share pages (`/p/{id}`)
- Likes, following, and trainer profiles (`/u/{username}`)
- Profile display name, bio, and Pokémon sprite avatar
- Dashboard feed: followed trainers, popular teams, and recent teams

### Feedback

- Bug reports (what happened, what you expected, pasted text) and feature suggestions
- Saved to PostgreSQL and emailed to the maintainer
- Protected by CSRF, a hidden spam field, a per-session limit, and a pause on emails during a flood of reports

</details>

---

## Architecture

```text
Browser ──► public/index.php ──► Router ──► Controller ──► Model ──► PostgreSQL
                                                │
                                                └──► View (PHP template)

Browser JavaScript and React islands ──► PokéAPI
```

Every request goes through one front controller, which loads the environment, starts the session, and lets the hand-written `Router` dispatch to a controller. Models query PostgreSQL directly with prepared statements: there is no ORM. Team-building rules live in one place, `Validator::pokemonTeam`.

PHP renders every page. On the React pages, React renders into a single mount element, with data passed from PHP as embedded JSON. `app/Core/Vite.php` prints the bundle's script tags from Vite's manifest.

<details>
<summary><strong>MVC diagram, database design, and project structure</strong></summary>

### MVC Architecture

![Brymon MVC Architecture](docs/architecture/brymon-mvc.drawio.png)

### Database Design

Planned as an entity-relationship diagram before the persistence layer was written.

![Brymon ERD](docs/architecture/brymon-erd.png)

### Project Structure

```text
app/
  Controllers/     # Page, Auth, Account, Team, Profile, Dashboard, UsageStats, Feedback
  Core/            # Router, Auth, Csrf, Validator, Database, Mailer, Config, Vite
  Models/          # Team, User, Follow, TeamLike, Feedback
  Views/           # templates grouped by feature, plus shared layouts
docs/
  database/migrations/   # hand-applied SQL migrations
public/
  css/             # stylesheets for each feature, plus design tokens
  js/              # vanilla JavaScript, one file per feature area
  index.php        # front controller
resources/ts/
  calc/            # damage calculator island (reducer, context, panels)
  analysis/        # team analysis island (calculations, hook, panel)
  components/      # shared React components
routes/web.php
tests/
  Unit/  Integration/  TS/  JS/  E2E/
```

</details>

---

## Tech Stack

| Layer      | Technology                                                           |
| ---------- | -------------------------------------------------------------------- |
| Backend    | PHP 8, custom MVC, PDO                                               |
| Database   | PostgreSQL                                                           |
| Frontend   | HTML, CSS, vanilla JavaScript, React, TypeScript, Vite               |
| APIs       | PokéAPI (REST + GraphQL), Smogon usage stats, `@smogon/calc`, Resend |
| Testing    | PHPUnit, Vitest, React Testing Library, Node test runner, Playwright |
| Deployment | Docker, Render                                                       |
| Design     | Figma                                                                |

---

## Run It Locally

You'll need PHP 8+, Composer, PostgreSQL, Node.js, and npm.

```bash
git clone https://github.com/bryanarius/brymon-team-builder.git
cd brymon-team-builder

composer install
npm install
npm run build          # compiles the React + TypeScript islands

cp .env.example .env   # then add your PostgreSQL and Resend settings
```

Create a PostgreSQL database, apply the migrations in `docs/database/migrations/` in filename order, then start the server:

```bash
php -S localhost:8000 -t public
```

<details>
<summary><strong>Environment variables</strong></summary>

```env
APP_ENV=development
APP_URL=http://localhost:8000

DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=brymon
DB_USER=your_username
DB_PASSWORD=your_password

RESEND_API_KEY=your_resend_api_key
MAIL_FROM=noreply@yourdomain.com
FEEDBACK_EMAIL=you@example.com
```

- `APP_URL` builds the links in verification and password reset emails.
- `RESEND_API_KEY` and `MAIL_FROM` send email through [Resend](https://resend.com). `MAIL_FROM`'s domain must be verified in Resend.
- `FEEDBACK_EMAIL` receives bug reports and suggestions. Leave it empty to only save them to the database.
- For React development with instant reloads, run `npm run dev` and set `VITE_DEV_SERVER=http://localhost:5173`.

</details>

---

## Testing

```bash
./vendor/bin/phpunit   # unit tests, plus integration tests against a real PostgreSQL database
npm run test:ts        # Vitest + React Testing Library
npm run test:js        # Node test runner for the vanilla JavaScript
npx playwright test    # end-to-end tests (start the PHP server first)
```

Integration tests use a separate `brymon_test` database, configured in `.env.testing`, so they never touch development or production data.

They cover:

- **Ownership:** one user can't read, edit, or delete another user's team.
- **Accounts:** verification and reset tokens are hashed and expire.
- **Social:** follows and likes can't be duplicated.
- **Showdown import:** real teams that players reported broken are kept as fixtures.

---

## Roadmap

- [x] **Version 1:** custom MVC, authentication, team building, analysis, Showdown import/export, testing, deployment
- [x] **Version 2:** email verification, password reset, Pokédex, public teams, likes, follows, profiles, feed, accessibility improvements
- [x] **Version 2.1:** player-requested regional forms, Mega Evolutions, coverage chart, meta usage stats, damage calculator
- [ ] **Version 3, in progress:** incremental modernization without a rewrite
  - [x] React + TypeScript islands for the calculator and team analysis
  - [x] Player feedback: bug reports and suggestions
  - [ ] Follower and following lists on profiles
  - [ ] Admin page for feedback
  - [ ] Automated accessibility checks (axe)
  - [ ] CI/CD running every test suite on each push

---

## Lessons Learned

- **Frameworks make more sense after building one.** Writing the router, sessions, and CSRF protection by hand showed what Laravel is actually doing behind the scenes.
- **Check access in the query, not after it.** Filtering by `user_id` in SQL means a forgotten check can't expose someone else's team.
- **Choose state tools by how state flows.** The calculator moved from many `useState` calls to `useReducer` with split Context once several panels needed the same state.
- **Measure before optimizing.** I tried splitting the calculator bundle with `React.lazy`, measured it, and skipped it because it only delayed the page.
- **Player bug reports make the best tests.** Each broken Showdown import became a fixture, so the same bug can't return unnoticed.

---

## Acknowledgements

Pokémon data and artwork come from [PokéAPI](https://pokeapi.co/). Brymon is a fan-made portfolio project and is not affiliated with or endorsed by Nintendo, Game Freak, Creatures Inc., or The Pokémon Company. Pokémon and all related trademarks belong to their respective owners.

## License

MIT
