const { test, expect } = require("@playwright/test");

/*
 * Damage numbers come from @smogon/calc and don't depend on outside data,
 * so the exact ranges are safe to assert.
 */

test("calculator shows damage, KO chances, and reacts to changes", async ({
  page,
}) => {
  await page.goto("/calc");

  // Guests are told how to load saved Pokémon, and get no team data.
  await expect(page.locator(".calc-saved-hint").first()).toContainText(
    "Sign in",
  );
  await expect(page.locator("#calc-saved-teams")).toHaveCount(0);

  const result = (move) =>
    page.locator(".calc-result").filter({ hasText: move });

  /*
  |--------------------------------------------------------------------------
  | Sample Matchup
  |--------------------------------------------------------------------------
  */

  await expect(page.locator(".calc-matchup")).toHaveText(
    "Great Tusk attacking Kingambit",
  );

  // Booster Energy activates Protosynthesis.
  await expect(result("Headlong Rush")).toContainText("108.9% – 128.2%");
  await expect(result("Headlong Rush")).toContainText("Guaranteed OHKO");
  await expect(result("Headlong Rush")).toContainText("Protosynthesis");

  /*
  |--------------------------------------------------------------------------
  | Changing The Defender, Status, And Conditions
  |--------------------------------------------------------------------------
  */

  await page.locator("#calc-defender-species").fill("gholdengo");
  await page
    .locator("#calc-defender .combobox-option")
    .filter({ hasText: /^Gholdengo$/ })
    .click();

  await expect(page.locator("#calc-defender-ability")).toHaveValue(
    "Good as Gold",
  );

  // Ghost types are immune to Fighting moves.
  await expect(result("Close Combat")).toContainText(
    "No effect: the defender is immune.",
  );

  await expect(result("Headlong Rush")).toContainText("141.7% – 167.1%");

  // A burn and Reflect each halve physical damage.
  await page.locator("#calc-attacker-status").selectOption("brn");
  await expect(result("Headlong Rush")).toContainText("70.8% – 83.5%");

  await page.locator("#calc-attacker-status").selectOption("");
  await page.locator("#calc-reflect").check();
  await expect(result("Headlong Rush")).toContainText("70.8% – 83.5%");

  await page.locator("#calc-reflect").uncheck();

  /*
  |--------------------------------------------------------------------------
  | Long Lists Say When They're Cut Short
  |--------------------------------------------------------------------------
  */

  await page.locator("#calc-attacker-move-2").click();

  await expect(
    page.locator("#calc-attacker-move-2 ~ .combobox-list .combobox-more"),
  ).toContainText("Type to narrow the list.");

  await page.locator("#calc-attacker-move-2").fill("swords dance");
  await page
    .locator("#calc-attacker .combobox-option")
    .filter({ hasText: "Swords Dance" })
    .click();

  await expect(result("Swords Dance")).toContainText(
    "Status move: it doesn't deal damage.",
  );

  /*
  |--------------------------------------------------------------------------
  | Swap
  |--------------------------------------------------------------------------
  */

  await page.locator("#calc-swap").click();

  await expect(page.locator("#calc-attacker-species")).toHaveValue(
    "Gholdengo",
  );
  await expect(page.locator("#calc-defender-species")).toHaveValue(
    "Great Tusk",
  );

  // Gholdengo had no moves as the defender.
  await expect(page.locator(".calc-message")).toHaveText(
    "Choose at least one move for the attacker.",
  );

  await page.locator("#calc-swap").click();

  await expect(page.locator("#calc-attacker-move-1")).toHaveValue(
    "Headlong Rush",
  );
});

test("saved Pokémon load into the calculator", async ({ page }) => {
  const teamName = `E2E Calc ${Date.now()}`;

  /*
  |--------------------------------------------------------------------------
  | Login And Save A Team
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

  // The nickname checks that saved text can't break out of the page's JSON.
  await page.locator("#import-showdown-button").click();

  await page.locator("#showdown-import-text").fill(
    `
</script><b>Chomp</b> (Garchomp) @ Choice Band
Ability: Rough Skin
Jolly Nature
EVs: 252 Atk / 4 SpD / 252 Spe
- Earthquake
- Outrage

Samurott-Hisui @ Focus Sash
Ability: Sharpness
Adamant Nature
- Ceaseless Edge
`.trim(),
  );

  await page.locator("#confirm-showdown-import").click();

  await expect(page.locator("#summary-pokemon-count")).toHaveText("2/6");

  await page.locator("#save-team-button").click();

  await expect(page).toHaveURL("/teams");

  await page
    .locator(".saved-team-card")
    .filter({ hasText: teamName })
    .getByRole("link", { name: "View Team" })
    .click();

  await expect(page).toHaveURL(/\/teams\/\d+/);

  const teamUrl = page.url();

  /*
  |--------------------------------------------------------------------------
  | Open A Pokémon From Its Saved Team
  |--------------------------------------------------------------------------
  */

  await page.locator(".team-detail-calc-link").first().click();

  await expect(page).toHaveURL(/\/calc\?team=\d+&slot=1/);

  await expect(page.locator("#calc-attacker-species")).toHaveValue(
    "Garchomp",
  );
  await expect(page.locator("#calc-attacker-ability")).toHaveValue(
    "Rough Skin",
  );
  await expect(page.locator("#calc-attacker-item")).toHaveValue("Choice Band");
  await expect(page.locator("#calc-attacker-move-2")).toHaveValue("Outrage");

  // The nickname is shown as text, never as HTML.
  await expect(page.locator("main b")).toHaveCount(0);

  /*
  |--------------------------------------------------------------------------
  | Load The Defender From The Saved Teams List
  |--------------------------------------------------------------------------
  */

  const defenderSaved = page.locator("#calc-defender-saved");

  await defenderSaved.selectOption({ label: "Hisuian Samurott" });

  await expect(page.locator("#calc-defender-species")).toHaveValue(
    "Hisuian Samurott",
  );
  await expect(defenderSaved).toHaveValue("");

  await expect(
    page.locator(".calc-result").filter({ hasText: "Earthquake" }),
  ).toContainText("91.9% – 108.4%");

  /*
  |--------------------------------------------------------------------------
  | Clean Up
  |--------------------------------------------------------------------------
  */

  await page.goto(teamUrl);

  page.once("dialog", (dialog) => dialog.accept());

  await page.locator(".delete-team-button").click();

  await expect(page).toHaveURL("/teams");
});
