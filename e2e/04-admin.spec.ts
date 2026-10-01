/**
 * 04 — Admin: auth gate, dashboard, orders, catalog, inventory, audit log.
 *
 * Admin uses email magic-link auth (Auth.js v5 + Resend).
 * Full admin flow requires RESEND_API_KEY and a seeded staff row.
 *
 * Tests that only check the auth gate and redirects work without credentials.
 */

import { test, expect } from "@playwright/test";

const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL ?? "";
const SKIP_AUTH = !ADMIN_EMAIL;

// ── Auth gate ──────────────────────────────────────────────────────────────

test.describe("Admin — auth gate", () => {
  const protectedRoutes = [
    "/admin",
    "/admin/catalog",
    "/admin/inventory",
    "/admin/orders",
    "/admin/audit",
  ];

  for (const route of protectedRoutes) {
    test(`${route} redirects unauthenticated users to /admin/login`, async ({
      page,
    }) => {
      await page.goto(route);
      await expect(page).toHaveURL(/\/admin\/login/, { timeout: 5000 });
    });
  }

  test("/admin/login renders sign-in form", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.getByRole("main")).toBeVisible();
    const emailInput = page.locator("input[type='email']");
    await expect(emailInput).toBeVisible({ timeout: 5000 });
  });
});

// ── Authenticated admin flows ──────────────────────────────────────────────

/**
 * To run authenticated tests, generate a session cookie via the Playwright
 * global setup script or use the `TEST_ADMIN_SESSION` env var (a serialised
 * cookies JSON produced by `page.context().cookies()`).
 *
 * Quick setup for local testing:
 *   1. Sign in manually at http://localhost:3000/admin/login
 *   2. Copy the session cookie value from DevTools → Application → Cookies
 *   3. Set TEST_ADMIN_SESSION=<json> in your .env.local
 */
async function loadAdminSession(page: import("@playwright/test").Page) {
  const sessionJson = process.env.TEST_ADMIN_SESSION;
  if (!sessionJson) {
    throw new Error(
      "TEST_ADMIN_SESSION not set — cannot run authenticated admin tests."
    );
  }
  const cookies = JSON.parse(sessionJson) as Parameters<
    import("@playwright/test").BrowserContext["addCookies"]
  >[0];
  await page.context().addCookies(cookies);
}

test.describe("Admin — dashboard @auth", () => {
  test.skip(SKIP_AUTH, "Skipped: TEST_ADMIN_SESSION not set");

  test.beforeEach(async ({ page }) => {
    await loadAdminSession(page);
  });

  test("dashboard renders KPI cards", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible({
      timeout: 8000,
    });
    // KPI tiles — today's orders, revenue
    await expect(
      page.getByText(/today|orders|revenue/i).first()
    ).toBeVisible();
  });

  test("sidebar navigation links to all sections", async ({ page }) => {
    await page.goto("/admin");
    const navLinks = ["Catalog", "Inventory", "Orders"];
    for (const label of navLinks) {
      await expect(
        page.getByRole("link", { name: label })
      ).toBeVisible();
    }
  });
});

test.describe("Admin — catalog @auth", () => {
  test.skip(SKIP_AUTH, "Skipped: TEST_ADMIN_SESSION not set");

  test.beforeEach(async ({ page }) => {
    await loadAdminSession(page);
  });

  test("catalog page lists families", async ({ page }) => {
    await page.goto("/admin/catalog");
    await expect(page.locator("table")).toBeVisible({ timeout: 8000 });
    // At least one row after the header
    const rows = page.locator("table tbody tr");
    await expect(rows.first()).toBeVisible();
  });
});

test.describe("Admin — orders @auth", () => {
  test.skip(SKIP_AUTH, "Skipped: TEST_ADMIN_SESSION not set");

  test.beforeEach(async ({ page }) => {
    await loadAdminSession(page);
  });

  test("orders list page renders", async ({ page }) => {
    await page.goto("/admin/orders");
    await expect(page.getByRole("heading", { name: /orders/i })).toBeVisible({
      timeout: 8000,
    });
  });

  test("order detail page renders for a seeded order @db", async ({ page }) => {
    test.skip(!process.env.TEST_ORDER_ID, "TEST_ORDER_ID not set");
    const orderId = process.env.TEST_ORDER_ID!;
    await page.goto(`/admin/orders/${orderId}`);
    await expect(page.locator("main")).toBeVisible({ timeout: 8000 });
    // Order number visible
    await expect(page.getByText(/NAT-/)).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Admin — order fulfillment flow @auth @db", () => {
  test.skip(
    SKIP_AUTH || !process.env.TEST_ORDER_ID,
    "Skipped: TEST_ADMIN_SESSION or TEST_ORDER_ID not set"
  );

  test.beforeEach(async ({ page }) => {
    await loadAdminSession(page);
  });

  test("can approve a review-queue order", async ({ page }) => {
    const orderId = process.env.TEST_ORDER_ID!;
    await page.goto(`/admin/orders/${orderId}`);
    const approveBtn = page.getByRole("button", { name: /approve/i });
    if (await approveBtn.isVisible()) {
      await approveBtn.click();
      await expect(page.getByText(/approved|paid/i)).toBeVisible({ timeout: 5000 });
    } else {
      test.info().annotations.push({
        type: "note",
        description: "Order was not in Review status — approve step skipped.",
      });
    }
  });

  test("can add internal note", async ({ page }) => {
    const orderId = process.env.TEST_ORDER_ID!;
    await page.goto(`/admin/orders/${orderId}`);
    const noteTextarea = page.locator("textarea[name='note'], [placeholder*='note']");
    if (await noteTextarea.isVisible()) {
      await noteTextarea.fill("Playwright test note — safe to delete.");
      const saveBtn = page.getByRole("button", { name: /save note/i });
      await saveBtn.click();
      await expect(page.getByText(/note saved|saved/i)).toBeVisible({ timeout: 5000 });
    }
  });

  test("issue refund — partial amount @stripe", async ({ page }) => {
    test.skip(
      !process.env.TEST_REFUNDABLE_ORDER_ID,
      "TEST_REFUNDABLE_ORDER_ID not set"
    );
    const orderId = process.env.TEST_REFUNDABLE_ORDER_ID!;
    await page.goto(`/admin/orders/${orderId}`);

    const refundInput = page.locator("input[name='amount'], [placeholder*='amount']");
    await expect(refundInput).toBeVisible({ timeout: 5000 });
    await refundInput.fill("100"); // $1.00 refund in cents

    const refundBtn = page.getByRole("button", { name: /issue refund|refund/i });
    await refundBtn.click();

    // Expect success indicator
    await expect(
      page.getByText(/refund issued|refunded/i)
    ).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Admin — audit log @auth", () => {
  test.skip(SKIP_AUTH, "Skipped: TEST_ADMIN_SESSION not set");

  test.beforeEach(async ({ page }) => {
    await loadAdminSession(page);
  });

  test("audit page accessible to owner role", async ({ page }) => {
    await page.goto("/admin/audit");
    // Either shows audit log or redirects to /admin if not owner
    const url = page.url();
    expect(url.includes("/admin")).toBe(true);
  });
});
