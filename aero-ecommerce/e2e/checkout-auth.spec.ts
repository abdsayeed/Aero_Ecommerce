/**
 * E2E: Authenticated user checkout flow
 * Sign in → add to cart → checkout → order confirmation
 *
 * Requires: dev server running, test user seeded in DB
 */
import { test, expect } from "@playwright/test";

const TEST_EMAIL = process.env.E2E_TEST_EMAIL ?? "test@example.com";
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD ?? "password123";

test.describe("Authenticated checkout flow", () => {
  test.beforeEach(async ({ page }) => {
    // Sign in
    await page.goto("/sign-in");
    await page.getByLabel(/email/i).fill(TEST_EMAIL);
    await page.getByLabel(/password/i).fill(TEST_PASSWORD);
    await page.getByRole("button", { name: /sign in/i }).click();
    // Wait for redirect after sign-in
    await page.waitForURL((url) => !url.pathname.includes("/sign-in"), { timeout: 10_000 });
  });

  test("signed-in user can reach checkout page", async ({ page }) => {
    // Add a product to cart
    await page.goto("/products");
    const firstCard = page.locator("a[href^='/products/']").first();
    await firstCard.click();
    await page.waitForURL(/\/products\/.+/);

    const sizeButton = page.locator("button[data-size]").first();
    if (await sizeButton.isVisible()) {
      await sizeButton.click();
    }

    const addToCartBtn = page.getByRole("button", { name: /add to cart/i });
    await addToCartBtn.click();

    await page.goto("/cart");
    const checkoutBtn = page.getByRole("link", { name: /checkout/i }).first();
    await checkoutBtn.click();

    await expect(page).toHaveURL(/\/checkout/);
  });

  test("account orders page is accessible after sign-in", async ({ page }) => {
    await page.goto("/account/orders");
    await expect(page).toHaveURL(/\/account\/orders/);
    // Should not redirect to sign-in
    await expect(page).not.toHaveURL(/\/sign-in/);
  });
});
