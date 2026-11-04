const { test, expect } = require("@playwright/test");

test("defensive chart reflects types and abilities in the builder and analysis", async ({
  page,
}) => {
  const teamName = `E2E Chart ${Date.now()}`;

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

  await expect(page.locator("#save-team-button")).toBeEnabled();

  await page.getByLabel("Team Name").fill(teamName);

  const builderChart = page.locator("#builder-defensive-chart");

  await expect(builderChart).toContainText("Add Pokémon to see");

  /*
  |--------------------------------------------------------------------------
  | Import A Team
  |--------------------------------------------------------------------------
  */

  await page.locator("#import-showdown-button").click();

  await page.locator("#showdown-import-text").fill(
    `
Charizard
Ability: Blaze
- Flamethrower

Bronzong
Ability: Heatproof
- Gyro Ball
`.trim(),
  );

  await page.locator("#confirm-showdown-import").click();

  await expect(page.locator("#summary-pokemon-count")).toHaveText("2/6");

  // Cells per row: [Charizard, Bronzong, Weak, Resist, Immune].
  const builderRow = (type) =>
    builderChart.locator("tbody tr").filter({ hasText: type }).locator("td");

  // Charizard (Fire/Flying) takes 4x from Rock; Bronzong (Steel) resists it.
  await expect(builderRow("Rock").nth(0)).toHaveText("4×");
  await expect(builderRow("Rock").nth(1)).toHaveText("½×");
  await expect(builderRow("Rock").nth(2)).toHaveText("1");
  await expect(builderRow("Rock").nth(3)).toHaveText("1");

  // Heatproof Bronzong is weak to Ground and neutral to Fire.
  await expect(builderRow("Ground").nth(0)).toHaveText("0×");
  await expect(builderRow("Ground").nth(1)).toHaveText("2×");
  await expect(builderRow("Fire").nth(1)).toHaveText("");

  /*
  |--------------------------------------------------------------------------
  | Changing An Ability Updates The Chart
  |--------------------------------------------------------------------------
  */

  await page.locator(".team-slot").nth(1).click();

  await page.locator("#pokemon-ability").selectOption("levitate");

  await expect(builderRow("Ground").nth(1)).toHaveText("0×");
  await expect(builderRow("Ground").nth(4)).toHaveText("2");
  await expect(builderRow("Fire").nth(1)).toHaveText("2×");

  /*
  |--------------------------------------------------------------------------
  | Saved Team Analysis Shows The Same Chart
  |--------------------------------------------------------------------------
  */

  await page.locator("#save-team-button").click();

  await expect(page).toHaveURL("/teams");

  await page
    .locator(".saved-team-card")
    .filter({ hasText: teamName })
    .getByRole("link", { name: "View Team" })
    .click();

  await expect(page).toHaveURL(/\/teams\/\d+/);

  const analysisRow = (type) =>
    page
      .locator("#analysis-defensive-chart tbody tr")
      .filter({ hasText: type })
      .locator("td");

  await expect(analysisRow("Rock").nth(0)).toHaveText("4×");
  await expect(analysisRow("Ground").nth(1)).toHaveText("0×");

  /*
  |--------------------------------------------------------------------------
  | Clean Up
  |--------------------------------------------------------------------------
  */

  page.once("dialog", (dialog) => dialog.accept());

  await page.locator(".delete-team-button").click();

  await expect(page).toHaveURL("/teams");
});
