/**
 * 03 — Checkout: Stripe Payment Element, test card, webhook simulation.
 *
 * Prerequisites:
 *   1. NEXT_PUBLIC_COMMERCE_PROVIDER=db (checkout requires real DB stock)
 *   2. DATABASE_URL pointing to a test/staging Neon branch with seeded data
 *   3. NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY and STRIPE_SECRET_KEY set to test keys
 *   4. Stripe CLI running: stripe listen --forward-to localhost:3000/api/webhooks/stripe
 *
 * Tests that can run without the above (DB_SKIP=1) are marked with the "smoke"
 * tag and rely on the mock provider.
 */

import { test, expect } from "@playwright/test";
import { STRIPE_CARD, TEST_EMAIL, fillStripeCard } from "./helpers";

const SKIP_DB = !!process.env.DB_SKIP;

test.describe("Checkout page — structure", () => {
  test("checkout page redirects or shows content", async ({ page }) => {
    await page.goto("/checkout");
    // Either renders checkout form or redirects to /iphone (empty cart)
    const url = page.url();
    expect(
      url.includes("/checkout") || url.includes("/iphone") || url.includes("/bag")
    ).toBe(true);
  });
});

test.describe("Full checkout flow @db", () => {
  test.skip(SKIP_DB, "Skipped: DB_SKIP=1 — requires live DB + Stripe test mode");

  test("POST /api/checkout validates empty lines", async ({ page }) => {
    const res = await page.request.post("/api/checkout", {
      data: { lines: [], email: TEST_EMAIL },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("required");
  });

  test("POST /api/checkout validates missing email", async ({ page }) => {
    const res = await page.request.post("/api/checkout", {
      data: { lines: [{ variantId: "fake-id", qty: 1 }], email: "" },
    });
    expect(res.status()).toBe(400);
  });

  test("POST /api/checkout rejects unknown variant", async ({ page }) => {
    const res = await page.request.post("/api/checkout", {
      data: {
        lines: [{ variantId: "00000000-0000-0000-0000-000000000000", qty: 1 }],
        email: TEST_EMAIL,
      },
    });
    expect(res.status()).toBe(409);
  });

  test("full checkout: add item → checkout → pay with test card", async ({
    page,
  }) => {
    // 1. Navigate to shop, pick a product
    await page.goto("/iphone");
    const firstCard = page.locator("a[href^='/iphone/']").first();
    await firstCard.click();

    // 2. Select options if needed and add to bag
    await page.waitForTimeout(500);
    const addBtn = page.getByRole("button", { name: /add to bag|buy/i }).first();
    await expect(addBtn).toBeVisible({ timeout: 5000 });
    await addBtn.click();

    // 3. Go to checkout
    await page.goto("/checkout");
    await expect(page.locator("form, [data-testid='checkout-form']")).toBeVisible({
      timeout: 8000,
    });

    // 4. Fill email if shown
    const emailInput = page.locator("input[type='email']").first();
    if (await emailInput.isVisible()) {
      await emailInput.fill(TEST_EMAIL);
    }

    // 5. Wait for Stripe Payment Element to load
    const stripeFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]').first();
    await expect(stripeFrame.locator('[placeholder="1234 1234 1234 1234"]')).toBeVisible({
      timeout: 15000,
    });
    await fillStripeCard(page);

    // 6. Fill shipping address (AddressElement)
    const addressFrame = page
      .frameLocator('iframe[name^="__privateStripeFrame"]')
      .nth(1);
    const line1 = addressFrame.locator('[placeholder*="Address"]').first();
    if (await line1.isVisible()) {
      await line1.fill("123 Test Street");
      await addressFrame.locator('[placeholder*="City"]').fill("New York");
      await addressFrame.locator('[placeholder*="State"]').selectOption("NY");
      await addressFrame.locator('[placeholder*="ZIP"]').fill("10001");
    }

    // 7. Submit
    const payBtn = page.getByRole("button", { name: /pay|place order|confirm/i });
    await payBtn.click();

    // 8. Expect redirect to /order/confirm or /order/NAT-xxxxx
    await page.waitForURL(/\/order\//i, { timeout: 30000 });
    expect(page.url()).toMatch(/\/order\//);
  });
});

test.describe("Rate limiting on /api/checkout", () => {
  test.skip(
    !process.env.UPSTASH_REDIS_REST_URL,
    "Skipped: UPSTASH_REDIS_REST_URL not set — rate limiting is disabled in dev"
  );

  test("returns 429 after many rapid requests", async ({ page }) => {
    const responses: number[] = [];
    for (let i = 0; i < 8; i++) {
      const res = await page.request.post("/api/checkout", {
        data: { lines: [], email: TEST_EMAIL },
      });
      responses.push(res.status());
    }
    expect(responses).toContain(429);
  });
});

test.describe("Order status lookup", () => {
  test("GET /api/orders/lookup rejects missing params", async ({ page }) => {
    const res = await page.request.get("/api/orders/lookup");
    expect(res.status()).toBe(400);
  });

  test("GET /api/orders/lookup returns 404 for unknown order", async ({ page }) => {
    const res = await page.request.get(
      "/api/orders/lookup?email=nobody@example.com&number=NAT-99999"
    );
    expect(res.status()).toBe(404);
  });

  test("order status page renders lookup form", async ({ page }) => {
    await page.goto("/order-status");
    await expect(page.getByRole("main")).toBeVisible();
    const emailInput = page.locator("input[type='email']");
    await expect(emailInput).toBeVisible({ timeout: 5000 });
  });
});
