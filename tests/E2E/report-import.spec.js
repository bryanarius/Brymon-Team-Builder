const { test, expect } = require("@playwright/test");

/*
 * A failed Showdown import explains why inside the dialog, and its
 * "Report this import" link opens a bug report already filled in with the
 * error and the pasted team. Uses real PokéAPI for the unknown species.
 */

const BROKEN_TEAM = "Fakemon @ Leftovers\nAbility: Pressure\n- Tackle";

test("a failed import can be reported with the paste attached", async ({
  page,
  context,
}) => {
  await page.goto("/login");
  await page.getByLabel("Email address").fill("e2e@example.com");
  await page.getByLabel("Password").fill("TestPassword123!");
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page).toHaveURL("/dashboard");

  await page.goto("/teambuilder");
  await page.locator("#import-showdown-button").click();
  await page.locator("#showdown-import-text").fill(BROKEN_TEAM);
  await page.locator("#confirm-showdown-import").click();

  const dialog = page.locator("#import-showdown-dialog");
  const error = dialog.getByRole("alert");

  await expect(error).toContainText("Couldn't find Fakemon (Pokémon 1).");

  // The report opens in a new tab, so the builder keeps the unsaved team.
  const [reportPage] = await Promise.all([
    context.waitForEvent("page"),
    error.getByRole("link", { name: /Report this import/ }).click(),
  ]);

  await expect(reportPage).toHaveURL(
    "/feedback?type=bug&from=%2Fteambuilder&draft=1",
  );
  await expect(reportPage.getByLabel("Summary")).toHaveValue(
    "Showdown import failed",
  );
  await expect(reportPage.getByLabel("What happened?")).toHaveValue(
    /Couldn't find Fakemon \(Pokémon 1\)/,
  );
  await expect(reportPage.getByLabel("Pasted text")).toHaveValue(BROKEN_TEAM);

  // The draft is used once: a reload starts empty.
  await reportPage.reload();
  await expect(reportPage.getByLabel("Summary")).toHaveValue("");

  // Editing the paste clears the old error.
  await page.locator("#showdown-import-text").fill("Pikachu");
  await expect(error).toBeHidden();
});

test("an empty paste explains itself without offering a report", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByLabel("Email address").fill("e2e@example.com");
  await page.getByLabel("Password").fill("TestPassword123!");
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page).toHaveURL("/dashboard");

  await page.goto("/teambuilder");
  await page.locator("#import-showdown-button").click();
  await page.locator("#confirm-showdown-import").click();

  const error = page.locator("#import-showdown-dialog").getByRole("alert");

  await expect(error).toContainText("Paste at least one Pokémon set.");
  await expect(error.getByRole("link")).toBeHidden();
});
