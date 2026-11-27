const { test, expect } = require("@playwright/test");

/*
 * Recent searches on an empty trainer search, like Instagram. The model is
 * covered by tests/Integration/RecentSearchTest.php; this checks recording,
 * ✕ and Clear all on the page. Uses demo_gloria and demo_marnie from
 * docs/database/seed-demo.sql, which no other spec uses.
 */

async function signIn(page) {
  await page.goto("/login");
  await page.getByLabel("Email address").fill("e2e@example.com");
  await page.getByLabel("Password").fill("TestPassword123!");
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page).toHaveURL("/dashboard");
}

// Avatars come from raw.githubusercontent.com, and goto() normally waits
// for every image. With the whole suite fetching sprites at once, that
// sometimes took longer than the test, so wait for the HTML and scripts only.
function openTrainerSearch(page) {
  return page.goto("/trainers", { waitUntil: "domcontentloaded" });
}

async function clearRecentSearches(page) {
  await openTrainerSearch(page);

  const clearAll = page.getByRole("button", { name: "Clear all" });

  if (await clearAll.isVisible()) {
    await clearAll.click();
    await expect(clearAll).toHaveCount(0);
  }
}

// Search, then open the trainer from the results (not from Recent, which
// may already list them).
async function openFromSearch(page, username, name) {
  await openTrainerSearch(page);
  await page
    .getByRole("searchbox", {
      name: "Search trainers by username or display name",
    })
    .fill(username);

  const results = page.locator("[data-trainer-results]");

  await expect(
    results.getByRole("heading", { name: `Results for “${username}”` }),
  ).toBeVisible();

  // Wait for the request to go out, not for its response: the profile can
  // load first, and Playwright stops seeing the old page's responses.
  // keepalive lets the request finish after the page has moved on.
  const recorded = page.waitForRequest(
    (request) =>
      request.method() === "POST" &&
      request.url().endsWith(`/u/${username}/recent-search`),
  );

  await results.getByRole("link", { name: new RegExp(name) }).click();
  await recorded;
  await expect(page).toHaveURL(`/u/${username}`);
}

// The Recent list, reloading until it matches: the last search may be saved
// a moment after its profile opened.
async function expectRecent(page, usernames) {
  await expect(async () => {
    await openTrainerSearch(page);
    await expect(recentUsernames(page)).toHaveText(usernames, {
      timeout: 1000,
    });
  }).toPass();
}

function recentUsernames(page) {
  return page.locator(".recent-searches .follow-row-username");
}

test("guests don't get a Recent list", async ({ page }) => {
  await openTrainerSearch(page);

  await expect(page.getByRole("heading", { name: "Recent" })).toHaveCount(0);
  await expect(page.locator(".profile-empty")).toContainText(
    "Search for a trainer",
  );
});

test("trainers you open show under Recent, newest first", async ({
  page,
}) => {
  await signIn(page);
  await clearRecentSearches(page);

  try {
    await expect(page.getByRole("heading", { name: "Recent" })).toBeVisible();
    await expect(page.locator(".profile-empty")).toHaveText(
      "No recent searches.",
    );

    await openFromSearch(page, "demo_gloria", "Gloria");
    await openFromSearch(page, "demo_marnie", "Marnie");

    await expectRecent(page, ["@demo_marnie", "@demo_gloria"]);

    // Opening Gloria again moves her back to the top, not in twice.
    await openFromSearch(page, "demo_gloria", "Gloria");
    await expectRecent(page, ["@demo_gloria", "@demo_marnie"]);

    // Recent rows have ✕, not Follow.
    await expect(
      page.locator(".recent-searches").getByRole("button", { name: /Follow/ }),
    ).toHaveCount(0);

    // ✕ removes one, keeps focus nearby, and it stays removed.
    await page
      .getByRole("button", { name: "Remove Gloria from recent searches" })
      .click();

    await expect(recentUsernames(page)).toHaveText(["@demo_marnie"]);
    await expect(
      page.getByRole("button", { name: "Remove Marnie from recent searches" }),
    ).toBeFocused();

    await page.reload();
    await expect(recentUsernames(page)).toHaveText(["@demo_marnie"]);

    // Clear all empties the list.
    await page.getByRole("button", { name: "Clear all" }).click();
    await expect(page.locator(".profile-empty")).toHaveText(
      "No recent searches.",
    );
    await expect(page.getByRole("status")).toHaveText(
      "Recent searches cleared.",
    );

    await page.reload();
    await expect(recentUsernames(page)).toHaveCount(0);
  } finally {
    await clearRecentSearches(page);
  }
});
