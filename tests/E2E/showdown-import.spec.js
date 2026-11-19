const fs = require("node:fs");
const path = require("node:path");
const { test, expect } = require("@playwright/test");

/*
 * Two teams pasted from Showdown that used to fail to import: gender
 * markers ("(F)"), a default form named by species ("Shaymin"), a cosmetic
 * form ("Alcremie-Ruby-Cream"), and Ogerpon's mask forms. Uses real PokéAPI.
 */

function readFixture(name) {
  return fs.readFileSync(
    path.join(__dirname, "../JS/fixtures", name),
    "utf8",
  );
}

async function openTeamBuilder(page, context) {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);

  await page.goto("/login");
  await page.getByLabel("Email address").fill("e2e@example.com");
  await page.getByLabel("Password").fill("TestPassword123!");
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page).toHaveURL("/dashboard");

  await page.goto("/teambuilder");
}

async function importTeam(page, text) {
  await page.locator("#import-showdown-button").click();
  await page.locator("#showdown-import-text").fill(text);
  await page.locator("#confirm-showdown-import").click();
}

async function exportTeam(page) {
  await page.locator("#export-showdown-button").click();
  await expect(page.getByText("Export complete")).toBeVisible();

  return page.evaluate(() => navigator.clipboard.readText());
}

test("a team with gender markers and forms imports and exports", async ({
  page,
  context,
}) => {
  await openTeamBuilder(page, context);
  await importTeam(page, readFixture("showdown-gendered-team.txt"));

  await expect(page.getByText("6 Pokémon imported successfully.")).toBeVisible();
  await expect(page.locator("#summary-pokemon-count")).toHaveText("6/6");

  const slotNames = page.locator(".team-slot-pokemon-name");
  await expect(slotNames.nth(1)).toHaveText("Alolan Vulpix");
  await expect(slotNames.nth(4)).toHaveText("Shaymin Land");
  await expect(slotNames.nth(5)).toHaveText("Alcremie");

  const exported = await exportTeam(page);
  expect(exported).toContain("Snowflake (Vulpix-Alola) @ Light Clay");
  expect(exported).toContain("Petal (Shaymin) @ Life Orb");
});

test("Ogerpon's mask forms import and export by Showdown's names", async ({
  page,
  context,
}) => {
  await openTeamBuilder(page, context);
  await importTeam(page, readFixture("showdown-ogerpon-team.txt"));

  await expect(page.getByText("6 Pokémon imported successfully.")).toBeVisible();

  const exported = await exportTeam(page);
  expect(exported).toContain("Bluebell (Ogerpon-Wellspring) @ Wellspring Mask");
});

test("an unknown Pokémon names itself in the error", async ({
  page,
  context,
}) => {
  await openTeamBuilder(page, context);
  await importTeam(page, "Sylveon @ Leftovers\n- Wish\n\nNotamon @ Leftovers\n- Wish");

  await expect(
    page.getByText("Couldn't find Notamon (Pokémon 2). Check the species name."),
  ).toBeVisible();
  // All or nothing: Sylveon wasn't added on its own.
  await expect(page.locator("#summary-pokemon-count")).toHaveText("0/6");
});
