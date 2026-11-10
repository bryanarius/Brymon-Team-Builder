const { test, expect } = require("@playwright/test");

/*
 * Proves the Vite build reaches the browser: PHP prints the manifest's
 * script tag, the bundle loads, and React replaces the HTML fallback.
 * Needs `npm run build` (or `npm run dev` with VITE_DEV_SERVER set).
 */

test("the damage calculator's React island renders", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/calc");

  const credit = page.locator("#calc-credit-root .calc-credit");

  await expect(credit).toHaveAttribute("data-rendered-by", "react");
  await expect(credit).toHaveCount(1);
  await expect(credit.getByRole("link", { name: "@smogon/calc" })).toBeVisible();

  expect(errors).toEqual([]);
});
