const { test, expect } = require("@playwright/test");

test("user can login and logout", async ({ page }) => {
  await page.goto("/login");

  await page.getByLabel("Email address").fill("e2e@example.com");

  await page.getByLabel("Password").fill("TestPassword123!");

  await page.getByRole("button", { name: "Sign In" }).click();

  // Login succeeded and redirected home.
  await expect(page).toHaveURL("/");

  // Account menu should now exist because Auth::check() is true.
  const accountMenuButton = page.locator("#account-menu-button");

  await expect(accountMenuButton).toBeVisible();

  await accountMenuButton.click();

  // Make sure clicking the account button actually opened the dropdown.
  const accountDropdown = page.locator("#account-menu-dropdown");

  await expect(accountDropdown).toBeVisible();

  // Use the desktop logout button specifically.
  await page.locator(".account-menu-logout").click();

  // Logout redirects home.
  await expect(page).toHaveURL("/");

  // And the logged-out navigation should now show Sign In.
  await expect(
    page.getByRole("link", { name: "Sign In" }).first(),
  ).toBeVisible();
});
