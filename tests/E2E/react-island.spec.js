const { test, expect } = require("@playwright/test");

/*
 * Proves the Vite build reaches the browser: PHP prints the manifest's
 * script tag, the bundle loads, and React replaces the loading message
 * with the calculator. Needs `npm run build` (or `npm run dev` with
 * VITE_DEV_SERVER set).
 */

test("the damage calculator renders as a React island", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/calc");

  const root = page.locator("#calc-root");

  await expect(root.locator(".calc-credit")).toHaveAttribute(
    "data-rendered-by",
    "react",
  );
  await expect(root.getByText("Loading the calculator...")).toHaveCount(0);
  await expect(root.locator(".calc-side")).toHaveCount(2);

  expect(errors).toEqual([]);
});
