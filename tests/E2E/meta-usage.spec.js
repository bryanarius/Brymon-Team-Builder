const path = require("path");
const { test, expect } = require("@playwright/test");

/*
 * Real usage stats change every month, so both tests serve a small fixed
 * stats file in place of /api/usage/{format}.
 */
const USAGE_FIXTURE = path.join(__dirname, "fixtures", "usage-gen9ou.json");

test.beforeEach(async ({ page }) => {
  await page.route("**/api/usage/*", (route) =>
    route.fulfill({ path: USAGE_FIXTURE }),
  );
});

test("meta page ranks Pokémon and shows what players run", async ({
  page,
}) => {
  await page.goto("/meta");

  await expect(page.locator("#meta-status")).toContainText(
    "OU: top 2 Pokémon from 123,456 battles.",
  );

  await expect(page.locator("#meta-format-description")).toContainText(
    "OverUsed",
  );

  const usageItems = page.locator(".meta-usage-item");

  await expect(usageItems).toHaveCount(2);
  await expect(usageItems.nth(0)).toContainText("Great Tusk");
  await expect(usageItems.nth(0)).toHaveAttribute("aria-pressed", "true");

  const detail = page.locator("#meta-detail");

  await expect(detail.locator("h2")).toHaveText("Great Tusk");
  await expect(detail).toContainText("#1 in OU · on 30.0% of teams");
  await expect(detail).toContainText("Jolly · 252 Atk / 4 Def / 252 Spe");

  /*
  |--------------------------------------------------------------------------
  | Teammate Links Open That Pokémon And Update The URL
  |--------------------------------------------------------------------------
  */

  await detail.getByRole("button", { name: "Kingambit" }).click();

  await expect(detail.locator("h2")).toHaveText("Kingambit");
  await expect(page).toHaveURL(/format=gen9ou&pokemon=Kingambit/);

  /*
  |--------------------------------------------------------------------------
  | Search Filters The Ranking
  |--------------------------------------------------------------------------
  */

  await page.locator("#meta-search").fill("tusk");

  await expect(usageItems).toHaveCount(1);
  await expect(usageItems.nth(0)).toContainText("Great Tusk");

  await page.locator("#meta-search").fill("pikachu");

  await expect(page.locator(".meta-empty")).toHaveText(
    "No Pokémon match your search.",
  );

  /*
  |--------------------------------------------------------------------------
  | A Shared Link Opens The Same View
  |--------------------------------------------------------------------------
  */

  await page.goto("/meta?format=gen9ou&pokemon=Kingambit");

  await expect(detail.locator("h2")).toHaveText("Kingambit");
});

test("popular sets in the builder apply what players run", async ({
  page,
}) => {
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

  await page.locator("#popular-sets-format").selectOption("gen9ou");

  /*
  |--------------------------------------------------------------------------
  | Add A Pokémon With No Set
  |--------------------------------------------------------------------------
  */

  await page.locator("#import-showdown-button").click();

  await page.locator("#showdown-import-text").fill("Great Tusk");

  await page.locator("#confirm-showdown-import").click();

  await expect(page.locator("#summary-pokemon-count")).toHaveText("1/6");

  await page.locator(".team-slot").nth(0).click();

  const popularSets = page.locator("#popular-sets");

  const chip = (kind, value) =>
    popularSets.locator(
      `.popular-set-chip[data-kind="${kind}"][data-value="${value}"]`,
    );

  await expect(popularSets).toContainText(
    "What OU players run on Great Tusk.",
  );

  /*
  |--------------------------------------------------------------------------
  | Clicking Suggestions Applies Them
  |--------------------------------------------------------------------------
  */

  await chip("move", "headlong-rush").click();
  await chip("move", "rapid-spin").click();
  await chip("item", "booster-energy").click();
  await chip("ability", "protosynthesis").click();
  await chip("spread", "jolly").click();

  for (const [kind, value] of [
    ["move", "headlong-rush"],
    ["move", "rapid-spin"],
    ["item", "booster-energy"],
    ["ability", "protosynthesis"],
    ["spread", "jolly"],
  ]) {
    await expect(chip(kind, value)).toHaveAttribute("aria-pressed", "true");
  }

  // Unused suggestions stay unpressed.
  await expect(chip("move", "ice-spinner")).toHaveAttribute(
    "aria-pressed",
    "false",
  );

  await expect(page.locator("#pokemon-nature")).toHaveValue("jolly");
  await expect(page.locator("#ev-total")).toContainText("508");

  /*
  |--------------------------------------------------------------------------
  | Pokémon Without Usage Data Get A Message
  |--------------------------------------------------------------------------
  */

  await page.locator("#import-showdown-button").click();

  await page.locator("#showdown-import-text").fill("Great Tusk\n\nPikachu");

  await page.locator("#confirm-showdown-import").click();

  await expect(page.locator("#summary-pokemon-count")).toHaveText("2/6");

  await page.locator(".team-slot").nth(1).click();

  await expect(popularSets).toContainText(
    "Pikachu isn't used enough in OU to have usage data.",
  );
});
