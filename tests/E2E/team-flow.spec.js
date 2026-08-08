const { test, expect } = require("@playwright/test");

test("user can create, edit, delete a team, and logout", async ({ page }) => {
  const teamName = `E2E Team ${Date.now()}`;
  const updatedTeamName = `${teamName} Updated`;

  /*
  |--------------------------------------------------------------------------
  | Login
  |--------------------------------------------------------------------------
  */

  await page.goto("/login");

  await page.getByLabel("Email address").fill("e2e@example.com");

  await page.getByLabel("Password").fill("TestPassword123!");

  await page.getByRole("button", { name: "Sign In" }).click();

  await expect(page).toHaveURL("/");

  /*
  |--------------------------------------------------------------------------
  | Open Team Builder
  |--------------------------------------------------------------------------
  */

  await page.getByRole("link", { name: "Team Builder" }).click();

  await expect(page).toHaveURL("/teambuilder");

  /*
  |--------------------------------------------------------------------------
  | Give Team A Name
  |--------------------------------------------------------------------------
  */

  await page.getByLabel("Team Name").fill(teamName);

  /*
  |--------------------------------------------------------------------------
  | Import One Pokémon Through Showdown
  |--------------------------------------------------------------------------
  */

  await page.locator("#import-showdown-button").click();

  await expect(page.locator("#import-showdown-dialog")).toBeVisible();

  const showdownTeam = `
Pikachu @ Light Ball
Ability: Static
Level: 100
Timid Nature
EVs: 4 HP / 252 SpA / 252 Spe
- Thunderbolt
- Volt Switch
- Grass Knot
- Protect
`.trim();

  await page.locator("#showdown-import-text").fill(showdownTeam);

  await page.locator("#confirm-showdown-import").click();

  /*
  |--------------------------------------------------------------------------
  | Confirm Import Worked
  |--------------------------------------------------------------------------
  */

  await expect(page.locator("#summary-pokemon-count")).toHaveText("1/6");

  /*
  |--------------------------------------------------------------------------
  | Save Team
  |--------------------------------------------------------------------------
  */

  await page.locator("#save-team-button").click();

  /*
  |--------------------------------------------------------------------------
  | Confirm Team Was Saved
  |--------------------------------------------------------------------------
  */

  await expect(page).toHaveURL("/teams");

  const teamCard = page.locator(".saved-team-card").filter({
    hasText: teamName,
  });

  await expect(teamCard).toBeVisible();

  await teamCard.getByRole("link", { name: "View Team" }).click();

  await expect(page).toHaveURL(/\/teams\/\d+/);

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: teamName,
    }),
  ).toBeVisible();

  /*
  |--------------------------------------------------------------------------
  | Edit Team
  |--------------------------------------------------------------------------
  */

  await page.getByRole("link", { name: "Edit Team" }).click();

  await expect(page).toHaveURL(/\/teams\/\d+\/edit/);

  await page.getByLabel("Team Name").fill(updatedTeamName);

  await page.locator("#save-team-button").click();

  /*
  |--------------------------------------------------------------------------
  | Confirm Edit Was Saved
  |--------------------------------------------------------------------------
  */

  await expect(page).toHaveURL("/teams");

  const updatedTeamCard = page.locator(".saved-team-card").filter({
    hasText: updatedTeamName,
  });

  await expect(updatedTeamCard).toBeVisible();

  await updatedTeamCard.getByRole("link", { name: "View Team" }).click();

  await expect(page).toHaveURL(/\/teams\/\d+/);

  /*
|--------------------------------------------------------------------------
| Delete Team
|--------------------------------------------------------------------------
*/

  page.once("dialog", async (dialog) => {
    console.log("Delete dialog:", dialog.message());

    await dialog.accept();
  });

  await page.locator(".delete-team-button").click();

  await expect(page).toHaveURL("/teams");
  /*
  |--------------------------------------------------------------------------
  | Confirm Team Is Gone
  |--------------------------------------------------------------------------
  */

  await expect(
    page.getByText(updatedTeamName, {
      exact: true,
    }),
  ).toHaveCount(0);

  /*
  |--------------------------------------------------------------------------
  | Logout
  |--------------------------------------------------------------------------
  */

  await page.locator("#account-menu-button").click();

  await expect(page.locator("#account-menu-dropdown")).toBeVisible();

  await page.locator(".account-menu-logout").click();

  await expect(page).toHaveURL("/");

  await expect(
    page.getByRole("link", { name: "Sign In" }).first(),
  ).toBeVisible();
});
