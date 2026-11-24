const { test, expect } = require("@playwright/test");

/*
 * The notifications page: a new follower shows up as new, then as read on
 * the next visit. Likes use the same list and are covered by
 * tests/Integration/NotificationTest.php.
 * Uses demo_raihan from docs/database/seed-demo.sql; follow-lists.spec.js
 * uses Nessa, so the two can run at the same time.
 */

async function signIn(browser, email, password) {
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto("/login");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page).toHaveURL("/dashboard");

  return { context, page };
}

async function setFollowing(page, username, following) {
  await page.goto(`/u/${username}`);

  const button = page.locator("#profile-follow-button");
  const wanted = following ? "true" : "false";

  if ((await button.getAttribute("aria-pressed")) !== wanted) {
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", wanted);
  }
}

test("guests are sent to sign in", async ({ page }) => {
  await page.goto("/notifications");

  await expect(page).toHaveURL("/login");
});

test("a new follower shows as new, then as read", async ({ browser }) => {
  const example = await signIn(browser, "e2e@example.com", "TestPassword123!");
  const fan = await signIn(
    browser,
    "demo_raihan@demo.brymon.local",
    "DemoPass123!",
  );

  try {
    // Start clean: no follow, and nothing unread from earlier runs.
    await setFollowing(fan.page, "Example", false);
    await example.page.goto("/notifications");

    await setFollowing(fan.page, "Example", true);

    await example.page.goto("/notifications");

    const notification = example.page
      .locator(".notification")
      .filter({ hasText: "Raihan started following you." });

    await expect(notification).toHaveCount(1);
    await expect(notification).toHaveClass(/is-unread/);
    await expect(notification).toContainText("New:");
    await expect(notification.locator("time")).toHaveText("now");

    // The name opens their profile.
    await expect(
      notification.getByRole("link", { name: "Raihan" }),
    ).toHaveAttribute("href", "/u/demo_raihan");

    // Opening the page marked it read.
    await example.page.reload();
    await expect(notification).not.toHaveClass(/is-unread/);

    // Unfollowing removes it.
    await setFollowing(fan.page, "Example", false);
    await example.page.goto("/notifications");
    await expect(notification).toHaveCount(0);
  } finally {
    await setFollowing(fan.page, "Example", false);
    await example.context.close();
    await fan.context.close();
  }
});
