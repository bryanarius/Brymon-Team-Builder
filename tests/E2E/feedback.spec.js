const { test, expect } = require("@playwright/test");

/*
 * Bug reports and suggestions, sent as a guest from the footer links.
 * Each test uses a fresh browser context, so a fresh session and its own
 * 5-an-hour limit.
 */

test("a guest reports a bug from the page it happened on", async ({ page }) => {
  // A public page; /teambuilder would send a guest to /login first.
  await page.goto("/calc");

  await page.getByRole("link", { name: "Report a bug" }).click();

  await expect(page).toHaveURL("/feedback?type=bug&from=%2Fcalc");
  await expect(
    page.getByRole("heading", { name: "Report a bug" }),
  ).toBeVisible();

  await page.getByLabel("Summary").fill(`E2E bug ${Date.now()}`);
  await page.getByLabel("What happened?").fill("Import failed for my team.");
  await page.getByLabel("What did you expect?").fill("The team imports.");
  await page
    .getByLabel("Pasted text")
    .fill("Bluebell (Ogerpon-Wellspring) @ Wellspring Mask\n- Ivy Cudgel");
  await page
    .getByRole("textbox", { name: /^Email \(optional/ })
    .fill("guest@example.com");

  await page.getByRole("button", { name: "Send Bug Report" }).click();

  // Redirected back to an empty form, so a refresh can't send it twice.
  await expect(page).toHaveURL("/feedback?type=bug");
  await expect(page.getByRole("status")).toHaveText(
    "Thanks! Your bug report was sent. It helps a lot.",
  );
  await expect(page.getByLabel("Summary")).toHaveValue("");

  await page.reload();
  await expect(page.getByRole("status")).toHaveCount(0);
});

test("a suggestion only asks for a summary and the idea", async ({ page }) => {
  await page.goto("/feedback?type=bug&from=%2Fcalc");

  // The tab, not the footer link with the same name.
  await page
    .getByRole("navigation", { name: "Feedback type" })
    .getByRole("link", { name: "Suggest a feature" })
    .click();

  // The tab keeps the page the player came from.
  await expect(page).toHaveURL("/feedback?type=suggestion&from=%2Fcalc");
  await expect(page.getByLabel("What did you expect?")).toHaveCount(0);
  await expect(page.getByLabel("Pasted text")).toHaveCount(0);

  await page.getByLabel("Summary").fill(`E2E idea ${Date.now()}`);
  await page.getByLabel("Your idea").fill("Show Speed tiers in the builder.");
  await page.getByRole("button", { name: "Send Suggestion" }).click();

  await expect(page.getByRole("status")).toHaveText(
    "Thanks! Your suggestion was sent.",
  );
});

test("the server explains a missing field", async ({ page }) => {
  await page.goto("/feedback?type=bug");

  await page.getByLabel("Summary").fill("Only a summary");
  // Skip the browser's own required check to reach the server's.
  await page.locator("#details").evaluate((field) => {
    field.required = false;
  });
  await page.getByRole("button", { name: "Send Bug Report" }).click();

  await expect(page.getByText("Describe what happened.")).toBeVisible();
  await expect(page.getByLabel("What happened?")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  // What was typed is kept.
  await expect(page.getByLabel("Summary")).toHaveValue("Only a summary");
});

test("a bot that fills the hidden field is thanked but not saved", async ({
  page,
}) => {
  await page.goto("/feedback?type=bug");

  await page.getByLabel("Summary").fill("Spam");
  await page.getByLabel("What happened?").fill("Buy things");
  await page.locator("#website").fill("https://spam.example");
  await page.getByRole("button", { name: "Send Bug Report" }).click();

  await expect(page.getByRole("status")).toHaveText(
    "Thanks! Your bug report was sent. It helps a lot.",
  );
});
