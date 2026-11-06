const { test, expect } = require("@playwright/test");

test("owners open their own feed teams with edit controls", async ({
  page,
  browser,
}) => {
  const teamName = `E2E Feed ${Date.now()}`;

  /*
  |--------------------------------------------------------------------------
  | Login And Save A Public Team
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

  await page.locator("#import-showdown-button").click();

  await page.locator("#showdown-import-text").fill("Pikachu");

  await page.locator("#confirm-showdown-import").click();

  await expect(page.locator("#summary-pokemon-count")).toHaveText("1/6");

  await page.locator("#save-team-button").click();

  await expect(page).toHaveURL("/teams");

  await page
    .locator(".saved-team-card")
    .filter({ hasText: teamName })
    .getByRole("link", { name: "View Team" })
    .click();

  await expect(page).toHaveURL(/\/teams\/\d+$/);

  const ownerUrl = page.url();
  const teamId = ownerUrl.match(/\/teams\/(\d+)$/)[1];

  // The toggle's click handler is attached once the page's scripts load;
  // a click before that is silently ignored.
  await page.waitForLoadState("load");

  await page.locator("#team-share-toggle").click();

  await expect(page.locator("#team-share-toggle")).toHaveText("Make Private");

  /*
  |--------------------------------------------------------------------------
  | Clicking It In The Feed Opens The Owner Page
  |--------------------------------------------------------------------------
  */

  await page.goto("/dashboard");

  await page
    .locator(".team-card")
    .filter({ hasText: teamName })
    .first()
    .locator(".team-card-link")
    .click();

  await expect(page).toHaveURL(ownerUrl);

  await expect(
    page.getByRole("link", { name: "Edit Team" }),
  ).toBeVisible();

  /*
  |--------------------------------------------------------------------------
  | Everyone Else Still Gets The Read-Only Page
  |--------------------------------------------------------------------------
  */

  const guestContext = await browser.newContext();
  const guestPage = await guestContext.newPage();

  await guestPage.goto(`/p/${teamId}`);

  await expect(guestPage).toHaveURL(`/p/${teamId}`);

  await expect(guestPage.locator(".team-public-banner")).toBeVisible();

  await expect(
    guestPage.getByRole("link", { name: "Edit Team" }),
  ).toHaveCount(0);

  await guestContext.close();

  /*
  |--------------------------------------------------------------------------
  | Clean Up
  |--------------------------------------------------------------------------
  */

  page.once("dialog", (dialog) => dialog.accept());

  await page.locator(".delete-team-button").click();

  await expect(page).toHaveURL("/teams");
});
