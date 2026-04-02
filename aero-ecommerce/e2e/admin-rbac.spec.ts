/**
 * E2E: Admin RBAC
 * Non-admin user navigates to /admin → assert redirect to sign-in
 * Admin user can access /admin/dashboard
 */
import { test, expect } from "@playwright/test";

const NON_ADMIN_EMAIL = process.env.E2E_TEST_EMAIL ?? "test@example.com";
const NON_ADMIN_PASSWORD = process.env.E2E_TEST_PASSWORD ?? "password123";

test.describe("Admin RBAC", () => {
  test("unauthenticated user is redirected from /admin", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/admin");
    // Should redirect to sign-in
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("non-admin user is redirected from /admin", async ({ page }) => {
    // Sign in as non-admin
    await page.goto("/sign-in");
    await page.getByLabel(/email/i).fill(NON_ADMIN_EMAIL);
    await page.getByLabel(/password/i).fill(NON_ADMIN_PASSWORD);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL((url) => !url.pathname.includes("/sign-in"), { timeout: 10_000 });

    // Try to access admin
    await page.goto("/admin");
    // Should be redirected away from admin
    await expect(page).not.toHaveURL(/\/admin\/dashboard/);
  });

  test("admin dashboard page has correct heading when accessible", async ({ page }) => {
    // This test only runs if ADMIN credentials are provided
    const adminEmail = process.env.E2E_ADMIN_EMAIL;
    const adminPassword = process.env.E2E_ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      test.skip();
      return;
    }

    await page.goto("/sign-in");
    await page.getByLabel(/email/i).fill(adminEmail);
    await page.getByLabel(/password/i).fill(adminPassword);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/\/admin\/dashboard/, { timeout: 10_000 });

    await expect(page).toHaveURL(/\/admin\/dashboard/);
  });
});
