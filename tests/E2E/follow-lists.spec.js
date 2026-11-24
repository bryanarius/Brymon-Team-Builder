const { test, expect } = require("@playwright/test");

/*
 * Followers and following lists, opened from the counts on a profile.
 * Uses the demo trainers from docs/database/seed-demo.sql.
 */

test("a guest opens a trainer's followers from their profile", async ({
  page,
}) => {
  await page.goto("/u/demo_cynthia");

  await page.getByRole("link", { name: /followers?$/ }).click();

  await expect(page).toHaveURL("/u/demo_cynthia/followers");
  await expect(
    page.getByRole("heading", { name: "Followers", level: 1 }),
  ).toBeVisible();

  const tabs = page.getByRole("navigation", { name: "Followers and following" });
  await expect(tabs.getByRole("link", { name: /Followers/ })).toHaveAttribute(
    "aria-current",
    "page",
  );

  // Each trainer in the list opens their own profile.
  const firstTrainer = page.locator(".follow-row").first();
  const username = (
    await firstTrainer.locator(".follow-row-username").textContent()
  ).replace("@", "");

  await firstTrainer.click();
  await expect(page).toHaveURL(`/u/${username}`);
});

test("following someone adds you to their followers list", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByLabel("Email address").fill("e2e@example.com");
  await page.getByLabel("Password").fill("TestPassword123!");
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page).toHaveURL("/dashboard");

  await page.goto("/u/demo_cynthia");

  const followButton = page.locator("#profile-follow-button");

  // Start from "not following", whatever an earlier run left behind.
  if ((await followButton.getAttribute("aria-pressed")) === "true") {
    await followButton.click();
    await expect(followButton).toHaveAttribute("aria-pressed", "false");
  }

  await followButton.click();
  await expect(followButton).toHaveAttribute("aria-pressed", "true");

  // Newest first: the new follower is at the top.
  await page.goto("/u/demo_cynthia/followers");
  await expect(page.locator(".follow-row-username").first()).toHaveText(
    "@Example",
  );

  // And Cynthia is in the e2e user's following list.
  await page.goto("/u/Example/following");
  await expect(
    page.getByRole("link", { name: /@demo_cynthia/ }),
  ).toBeVisible();

  // Clean up, so the demo data stays as seeded.
  await page.goto("/u/demo_cynthia");
  await followButton.click();
  await expect(followButton).toHaveAttribute("aria-pressed", "false");

  await page.goto("/u/demo_cynthia/followers");
  await expect(page.getByRole("link", { name: /@Example/ })).toHaveCount(0);
});

test("an unknown trainer's list is a 404", async ({ page }) => {
  const response = await page.goto("/u/no-such-trainer/followers");

  expect(response.status()).toBe(404);
});
