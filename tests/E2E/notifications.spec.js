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

test("guests are sent to sign in, and see no heart", async ({ page }) => {
  await page.goto("/pokedex");
  await expect(page.locator(".notification-heart")).toHaveCount(0);

  await page.goto("/notifications");
  await expect(page).toHaveURL("/login");
});

test("on a phone the heart sits next to the menu button", async ({
  browser,
}) => {
  const example = await signIn(browser, "e2e@example.com", "TestPassword123!");

  try {
    await example.page.setViewportSize({ width: 390, height: 844 });
    await example.page.goto("/pokedex");

    // Exactly one heart is visible at each width.
    await expect(
      example.page.getByRole("link", { name: /^Notifications/ }),
    ).toHaveCount(1);
    await expect(
      example.page.locator(".navigation-mobile-end .notification-heart"),
    ).toBeVisible();
  } finally {
    await example.context.close();
  }
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

    // The heart on any page shows one unread, and opens the page.
    await example.page.goto("/pokedex");

    const heart = example.page.getByRole("link", { name: /^Notifications/ });

    await expect(heart).toHaveAccessibleName("Notifications, 1 new");
    await expect(heart.locator(".notification-heart-badge")).toHaveText("1");

    await heart.click();
    await expect(example.page).toHaveURL("/notifications");

    // On the page itself, the badge is already cleared.
    await expect(heart).toHaveAccessibleName("Notifications");
    await expect(heart).toHaveAttribute("aria-current", "page");

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
