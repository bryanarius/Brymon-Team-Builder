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

  // Guests see the list but no Follow buttons.
  await expect(page.locator("[data-follow-button]")).toHaveCount(0);

  // Each trainer in the list opens their own profile.
  const firstTrainer = page.locator(".follow-row-link").first();
  const username = (
    await firstTrainer.locator(".follow-row-username").textContent()
  ).replace("@", "");

  await firstTrainer.click();
  await expect(page).toHaveURL(`/u/${username}`);
});

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

// Follows or unfollows from a profile, whatever the current state.
async function setFollowing(page, username, following) {
  await page.goto(`/u/${username}`);

  const button = page.locator("#profile-follow-button");
  const wanted = following ? "true" : "false";

  if ((await button.getAttribute("aria-pressed")) !== wanted) {
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", wanted);
  }
}

test("a new follower can be followed back from the followers list", async ({
  browser,
}) => {
  const example = await signIn(browser, "e2e@example.com", "TestPassword123!");
  const nessa = await signIn(
    browser,
    "demo_nessa@demo.brymon.local",
    "DemoPass123!",
  );

  try {
    await setFollowing(nessa.page, "Example", false);
    await setFollowing(example.page, "demo_nessa", true);

    // Nessa sees her new follower with a "Follow back" button.
    await nessa.page.goto("/u/demo_nessa/followers");

    const row = nessa.page.locator(".follow-row", { hasText: "@Example" });
    const button = row.getByRole("button", { name: /Example/ });

    await expect(button).toHaveText(/Follow back/);
    await expect(button).toHaveAttribute("aria-pressed", "false");

    await button.click();
    await expect(button).toHaveText(/Following/);
    await expect(button).toHaveAttribute("aria-pressed", "true");

    // Saved, not just changed on the page.
    await nessa.page.reload();
    await expect(button).toHaveText(/Following/);

    // Unfollowing goes back to "Follow back", since Example still follows her.
    await button.click();
    await expect(button).toHaveText(/Follow back/);

    // Your own row in a list has no button.
    await example.page.goto("/u/demo_nessa/followers");
    await expect(
      example.page
        .locator(".follow-row", { hasText: "@Example" })
        .getByRole("button"),
    ).toHaveCount(0);
  } finally {
    // Leave the demo data as seeded.
    await setFollowing(nessa.page, "Example", false);
    await setFollowing(example.page, "demo_nessa", false);
    await example.context.close();
    await nessa.context.close();
  }
});

test("the follower count's word matches the number", async ({ browser }) => {
  const example = await signIn(browser, "e2e@example.com", "TestPassword123!");

  try {
    await setFollowing(example.page, "demo_nessa", false);

    const count = example.page.locator("#profile-follower-count");
    const before = Number(await count.textContent());

    await example.page.locator("#profile-follow-button").click();
    await expect(count).toHaveText(String(before + 1));
    await expect(example.page.locator("#profile-follower-label")).toHaveText(
      before + 1 === 1 ? "follower" : "followers",
    );
  } finally {
    await setFollowing(example.page, "demo_nessa", false);
    await example.context.close();
  }
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
