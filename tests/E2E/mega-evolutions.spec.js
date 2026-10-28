const { test, expect } = require("@playwright/test");

test("user can add, export, and save a Mega Evolution", async ({
  page,
  context,
}) => {
  const teamName = `E2E Mega ${Date.now()}`;

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
  | Add A Mega From Search
  |--------------------------------------------------------------------------
  */

  await page.locator("#pokemon-search").fill("mega charizard x");

  await page
    .getByRole("button", { name: "Add Mega Charizard X to team" })
    .click();

  await expect(page.locator(".team-slot-pokemon-name").first()).toHaveText(
    "Mega Charizard X",
  );

  // Megas share their species' dex number.
  await expect(page.locator("#selected-pokemon-number")).toHaveText("#0006");

  await expect(page.locator("#selected-pokemon-types")).toHaveText(
    /Fire\s*Dragon/,
  );

  // The Mega Stone and the Mega's only ability are filled in automatically.
  await expect(page.locator("#pokemon-item")).toHaveValue("Charizardite X");

  await expect(page.locator("#pokemon-ability")).toHaveValue("tough-claws");

  // A Mega can't be given a different item.
  await expect(page.locator("#pokemon-item")).toBeDisabled();

  await expect(page.locator("#pokemon-item-hint")).toBeVisible();

  /*
  |--------------------------------------------------------------------------
  | Export Uses Showdown's Mega Name
  |--------------------------------------------------------------------------
  */

  await page.locator("#export-showdown-button").click();

  await expect(page.getByText("Export complete")).toBeVisible();

  const exported = await page.evaluate(() => navigator.clipboard.readText());

  expect(exported).toContain("Charizard-Mega-X @ Charizardite X");

  expect(exported).toContain("Ability: Tough Claws");

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
    page.getByRole("heading", { level: 2, name: "Mega Charizard X" }),
  ).toBeVisible();

  /*
  |--------------------------------------------------------------------------
  | Clean Up
  |--------------------------------------------------------------------------
  */

  page.once("dialog", (dialog) => dialog.accept());

  await page.locator(".delete-team-button").click();

  await expect(page).toHaveURL("/teams");

  /*
  |--------------------------------------------------------------------------
  | Imported Megas Keep Their Stone; Other Items Stay Editable
  |--------------------------------------------------------------------------
  */

  await page.goto("/teambuilder");

  await expect(page.locator("#save-team-button")).toBeEnabled();

  await page.locator("#import-showdown-button").click();

  await page.locator("#showdown-import-text").fill(
    `
Gengar-Mega @ Leftovers
Ability: Shadow Tag
- Shadow Ball

Pikachu @ Light Ball
Ability: Static
- Thunderbolt
`.trim(),
  );

  await page.locator("#confirm-showdown-import").click();

  await expect(page.locator("#summary-pokemon-count")).toHaveText("2/6");

  await expect(page.locator("#pokemon-item")).toHaveValue("Gengarite");

  await expect(page.locator("#pokemon-item")).toBeDisabled();

  await page.locator(".team-slot").nth(1).click();

  await expect(page.locator("#pokemon-item")).toHaveValue("Light Ball");

  await expect(page.locator("#pokemon-item")).toBeEnabled();

  await expect(page.locator("#pokemon-item-hint")).toBeHidden();
});
