/**
 * E2E: Guest checkout flow
 * Add to cart → checkout → Stripe test payment → order confirmation
 *
 * Requires: dev server running, STRIPE_SECRET_KEY set to a test key
 */
import { test, expect } from "@playwright/test";

test.describe("Guest checkout flow", () => {
  test("can add a product to cart and reach checkout", async ({ page }) => {
    // Navigate to products page
    await page.goto("/products");
    await expect(page).toHaveTitle(/products|aero/i);

    // Click the first product card
    const firstCard = page.locator("a[href^='/products/']").first();
    await firstCard.click();
    await page.waitForURL(/\/products\/.+/);

    // Select a size if picker is present
    const sizeButton = page.locator("button[data-size]").first();
    if (await sizeButton.isVisible()) {
      await sizeButton.click();
    }

    // Add to cart
    const addToCartBtn = page.getByRole("button", { name: /add to cart/i });
    await addToCartBtn.click();

    // Navigate to cart
    await page.goto("/cart");
    await expect(page.locator("text=/cart/i").first()).toBeVisible();

    // Proceed to checkout
    const checkoutBtn = page.getByRole("link", { name: /checkout/i }).first();
    await checkoutBtn.click();
    await page.waitForURL(/\/checkout/);

    // Checkout page should be visible
    await expect(page).toHaveURL(/\/checkout/);
  });

  test("empty cart redirects away from checkout", async ({ page }) => {
    // Clear cookies to ensure guest session with empty cart
    await page.context().clearCookies();
    await page.goto("/checkout");
    // Should redirect to cart or home
    await expect(page).not.toHaveURL(/\/checkout$/);
  });
});
