const { test, expect } = require("@playwright/test");

/*
 * Trainer search at /trainers. Matching and ranking are covered by
 * tests/Integration/TrainerSearchTest.php; these check the page itself.
 * Uses demo_hilda from docs/database/seed-demo.sql, which no other spec
 * follows, so the specs can run at the same time.
 */

async function signIn(page, email, password) {
  await page.goto("/login");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page).toHaveURL("/dashboard");
}

function searchBox(page) {
  return page.getByRole("searchbox", {
    name: "Search trainers by username or display name",
  });
}

test("guests can find a trainer from the header", async ({ page }) => {
  await page.goto("/pokedex");
  await page.getByRole("link", { name: "Find trainers" }).click();
  await expect(page).toHaveURL("/trainers");

  // Results come as you type: no Search button, no Enter.
  await expect(page.getByRole("button", { name: "Search" })).toBeHidden();
  await searchBox(page).pressSequentially("HILD");
  await expect(page).toHaveURL("/trainers?q=HILD");
  await expect(page.getByRole("status")).toHaveText("1 trainer found.");

  const row = page.locator(".follow-row").filter({ hasText: "@demo_hilda" });

  await expect(row).toHaveCount(1);
  await expect(row.getByRole("link", { name: /Hilda/ })).toHaveAttribute(
    "href",
    "/u/demo_hilda",
  );

  // Guests can look, but not follow.
  await expect(row.getByRole("button")).toHaveCount(0);

  // Clearing the box goes back to the start.
  await searchBox(page).clear();
  await expect(page).toHaveURL("/trainers");
  await expect(row).toHaveCount(0);
  await expect(page.locator(".profile-empty")).toContainText(
    "Search for a trainer",
  );
});

test("typing before the script loads still searches", async ({ page }) => {
  // Hold trainer-search.js back, like a slow phone connection.
  let releaseScript;
  const scriptHeld = new Promise((resolve) => {
    releaseScript = resolve;
  });

  await page.route("**/js/trainer-search.js", async (route) => {
    await scriptHeld;
    await route.continue();
  });

  await page.goto("/trainers", { waitUntil: "commit" });
  await searchBox(page).fill("hilda");

  releaseScript();

  await expect(page).toHaveURL("/trainers?q=hilda");
  await expect(
    page.locator(".follow-row").filter({ hasText: "@demo_hilda" }),
  ).toHaveCount(1);
});

test("without JavaScript, the Search button still works", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  try {
    await page.goto("/trainers");
    await searchBox(page).fill("hilda");
    await page.getByRole("button", { name: "Search" }).click();

    await expect(page).toHaveURL("/trainers?q=hilda");
    await expect(
      page.locator(".follow-row").filter({ hasText: "@demo_hilda" }),
    ).toHaveCount(1);
  } finally {
    await context.close();
  }
});

test("a search with no matches says so", async ({ page }) => {
  // % is a wildcard in SQL; here it only matches itself.
  await page.goto("/trainers?q=%25");

  await expect(page.locator(".follow-row")).toHaveCount(0);
  await expect(page.locator(".profile-empty")).toHaveText(
    "No trainers match “%”.",
  );
});

test("signed in, you can follow a trainer from the results", async ({
  page,
}) => {
  await signIn(page, "e2e@example.com", "TestPassword123!");

  const row = page.locator(".follow-row").filter({ hasText: "@demo_hilda" });
  const button = row.getByRole("button", { name: /Hilda/ });

  try {
    // Follow from a row that arrived as you typed, not with the page.
    await page.goto("/trainers");
    await searchBox(page).pressSequentially("demo_hilda");
    await expect(button).toHaveAttribute("aria-pressed", "false");

    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(button).toContainText("Following");

    // It was saved, not just changed on the page.
    await page.reload();
    await expect(button).toHaveAttribute("aria-pressed", "true");

    // No button on your own row.
    await searchBox(page).fill("Example");
    const ownRow = page.locator(".follow-row").filter({
      has: page.locator(".follow-row-username", { hasText: /^@Example$/ }),
    });

    await expect(ownRow).toHaveCount(1);
    await expect(ownRow.getByRole("button")).toHaveCount(0);
  } finally {
    // Leave Hilda unfollowed for the next run.
    await page.goto("/trainers?q=demo_hilda");

    if ((await button.getAttribute("aria-pressed")) === "true") {
      await button.click();
      await expect(button).toHaveAttribute("aria-pressed", "false");
    }
  }
});
