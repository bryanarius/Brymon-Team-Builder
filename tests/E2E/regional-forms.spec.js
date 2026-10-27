const { test, expect } = require("@playwright/test");

test("user can build, export, and save a team with regional forms", async ({
  page,
  context,
}) => {
  const teamName = `E2E Forms ${Date.now()}`;

  await context.grantPermissions(["clipboard-read", "clipboard-write"]);

  /*
  |--------------------------------------------------------------------------
  | Login And Open Team Builder
  |--------------------------------------------------------------------------
  */

  await page.goto("/login");

  await page.getByLabel("Email address").fill("e2e@example.com");

  await page.getByLabel("Password").fill("TestPassword123!");

  await page.getByRole("button", { name: "Sign In" }).click();

  await expect(page).toHaveURL("/dashboard");

  await page.goto("/teambuilder");

  await page.getByLabel("Team Name").fill(teamName);

  /*
  |--------------------------------------------------------------------------
  | Search Finds Forms By Regional Name
  |--------------------------------------------------------------------------
  */

  await page.locator("#pokemon-search").fill("hisuian samurott");

  const searchResult = page.locator(".pokemon-search-result").filter({
    hasText: "Hisuian Samurott",
  });

  await expect(searchResult).toBeVisible();

  // Forms show their species' dex number, not PokéAPI's 10236.
  await expect(searchResult).toContainText("#0503");

  await expect(searchResult).toContainText("Water");

  await expect(searchResult).toContainText("Dark");

  /*
  |--------------------------------------------------------------------------
  | Import Forms Through Showdown
  |--------------------------------------------------------------------------
  */

  // "Tauros-Paldea-Combat" is PokéAPI's "tauros-paldea-combat-breed".
  const showdownTeam = `
Samurott-Hisui @ Choice Band
Ability: Sharpness
Adamant Nature
EVs: 252 Atk / 4 SpD / 252 Spe
- Ceaseless Edge
- Razor Shell
- Sucker Punch
- Aqua Jet

Tauros-Paldea-Combat
Ability: Intimidate
Jolly Nature
- Close Combat
`.trim();

  await page.locator("#import-showdown-button").click();

  await page.locator("#showdown-import-text").fill(showdownTeam);

  await page.locator("#confirm-showdown-import").click();

  await expect(page.locator("#summary-pokemon-count")).toHaveText("2/6");

  const slotNames = page.locator(".team-slot-pokemon-name");

  await expect(slotNames.nth(0)).toHaveText("Hisuian Samurott");

  await expect(slotNames.nth(1)).toHaveText("Paldean Tauros (Combat Breed)");

  await expect(page.locator("#selected-pokemon-types")).toHaveText(
    /Water\s*Dark/,
  );

  /*
  |--------------------------------------------------------------------------
  | Export Uses Showdown's Form Names
  |--------------------------------------------------------------------------
  */

  await page.locator("#export-showdown-button").click();

  await expect(page.getByText("Export complete")).toBeVisible();

  const exported = await page.evaluate(() => navigator.clipboard.readText());

  expect(exported).toContain("Samurott-Hisui @ Choice Band");

  expect(exported).toContain("\nTauros-Paldea-Combat\n");

  /*
  |--------------------------------------------------------------------------
  | Save And View The Team
  |--------------------------------------------------------------------------
  */

  await page.locator("#save-team-button").click();

  await expect(page).toHaveURL("/teams");

  const teamCard = page.locator(".saved-team-card").filter({
    hasText: teamName,
  });

  await teamCard.getByRole("link", { name: "View Team" }).click();

  await expect(page).toHaveURL(/\/teams\/\d+/);

  await expect(
    page.getByRole("heading", { level: 2, name: "Hisuian Samurott" }),
  ).toBeVisible();

  await expect(
    page.getByRole("heading", {
      level: 2,
      name: "Paldean Tauros (Combat Breed)",
    }),
  ).toBeVisible();

  /*
  |--------------------------------------------------------------------------
  | Clean Up
  |--------------------------------------------------------------------------
  */

  page.once("dialog", (dialog) => dialog.accept());

  await page.locator(".delete-team-button").click();

  await expect(page).toHaveURL("/teams");
});
