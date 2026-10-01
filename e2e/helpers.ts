/**
 * Shared helpers for NorthArdenTech E2E tests.
 */

import { type Page, expect } from "@playwright/test";

// ── Stripe test cards ──────────────────────────────────────────────────────
export const STRIPE_CARD = {
  /** Always succeeds */
  success: "4242424242424242",
  /** Always declines */
  decline: "4000000000000002",
  /** Requires 3-D Secure authentication */
  threeds: "4000002760003184",
} as const;

export const TEST_EMAIL = "playwright-test@northardentech.test";

// ── Navigation helpers ─────────────────────────────────────────────────────

export async function goToShop(page: Page) {
  await page.goto("/iphone");
  await expect(page.getByRole("heading", { name: "Shop iPhone" })).toBeVisible();
}

export async function goToFirstPDP(page: Page) {
  await goToShop(page);
  // Click the first product card link
  const firstCard = page.locator("a[href^='/iphone/']").first();
  await firstCard.click();
  // Wait for the PDP heading (h1 or the model name)
  await expect(page.locator("h1").first()).toBeVisible();
}

// ── Cart helpers ───────────────────────────────────────────────────────────

export async function openCartDrawer(page: Page) {
  const bagButton = page.getByRole("button", { name: /bag|cart/i });
  await bagButton.click();
  // Drawer/sheet should be visible
  await expect(page.getByRole("dialog")).toBeVisible({ timeout: 3000 });
}

// ── Checkout helpers ───────────────────────────────────────────────────────

/**
 * Fills the Stripe Payment Element with a test card.
 * Must be called after the PaymentElement iframe has loaded.
 */
export async function fillStripeCard(
  page: Page,
  card = STRIPE_CARD.success
) {
  const cardFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]').first();

  // Card number
  await cardFrame.locator('[placeholder="1234 1234 1234 1234"]').fill(card);
  // Expiry
  await cardFrame.locator('[placeholder="MM / YY"]').fill("12 / 28");
  // CVC
  await cardFrame.locator('[placeholder="CVC"]').fill("123");
  // ZIP
  await cardFrame.locator('[placeholder="ZIP"]').fill("10001");
}

// ── Admin helpers ──────────────────────────────────────────────────────────

export async function goToAdminLogin(page: Page) {
  await page.goto("/admin/login");
  await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
}
