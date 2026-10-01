/**
 * 01 — Browse: home page, shop all, navigation.
 *
 * Uses the mock commerce provider (no DB required).
 * Set NEXT_PUBLIC_COMMERCE_PROVIDER=mock (dev default).
 */

import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("loads with correct title and hero", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/NorthArdenTech/i);
    // Trust strip
    await expect(page.getByText(/unlocked/i).first()).toBeVisible();
  });

  test("has working header navigation", async ({ page }) => {
    await page.goto("/");
    const shopLink = page.getByRole("link", { name: /shop/i }).first();
    await expect(shopLink).toBeVisible();
    await shopLink.click();
    await expect(page).toHaveURL(/\/iphone/);
  });
});

test.describe("Shop all (/iphone)", () => {
  test("renders family grid", async ({ page }) => {
    await page.goto("/iphone");
    await expect(page.getByRole("heading", { name: /shop iphone/i })).toBeVisible();
    // At least one product card
    const cards = page.locator("a[href^='/iphone/']");
    await expect(cards.first()).toBeVisible();
  });

  test("product cards link to PDPs", async ({ page }) => {
    await page.goto("/iphone");
    const firstCard = page.locator("a[href^='/iphone/']").first();
    const href = await firstCard.getAttribute("href");
    expect(href).toMatch(/^\/iphone\/.+/);
    await firstCard.click();
    await expect(page).toHaveURL(/\/iphone\/.+/);
  });
});

test.describe("Compare page", () => {
  test("renders model picker", async ({ page }) => {
    await page.goto("/compare");
    await expect(page.getByRole("heading", { name: /compare/i })).toBeVisible();
  });
});

test.describe("Pre-owned guide", () => {
  test("renders grade sections", async ({ page }) => {
    await page.goto("/pre-owned");
    await expect(page.getByRole("heading", { name: /how we grade/i })).toBeVisible();
    await expect(page.getByText("Premium")).toBeVisible();
    await expect(page.getByText("Excellent")).toBeVisible();
  });
});

test.describe("Support page", () => {
  test("renders help tiles", async ({ page }) => {
    await page.goto("/support");
    await expect(page.getByRole("heading", { name: /how can we help/i })).toBeVisible();
    await expect(page.getByText("Shipping")).toBeVisible();
    await expect(page.getByText("Returns")).toBeVisible();
  });
});

test.describe("iPhone Duo page", () => {
  test("renders hero with Duo headline", async ({ page }) => {
    await page.goto("/iphone-duo");
    await expect(page.getByRole("heading", { name: /iPhone Duo/i })).toBeVisible();
  });
});

test.describe("SEO", () => {
  test("sitemap.xml returns 200", async ({ page }) => {
    const res = await page.goto("/sitemap.xml");
    expect(res?.status()).toBe(200);
    const body = await page.content();
    expect(body).toContain("northardentech.com");
  });

  test("robots.txt returns 200 and disallows /admin", async ({ page }) => {
    const res = await page.goto("/robots.txt");
    expect(res?.status()).toBe(200);
    const body = await page.content();
    expect(body).toContain("Disallow: /admin/");
  });
});

test.describe("Accessibility — no critical violations", () => {
  test("home page has a level-1 heading", async ({ page }) => {
    await page.goto("/");
    const h1s = page.locator("h1");
    await expect(h1s.first()).toBeVisible();
  });

  test("shop page main landmark exists", async ({ page }) => {
    await page.goto("/iphone");
    await expect(page.locator("main")).toBeVisible();
  });

  test("images have alt text or are aria-hidden", async ({ page }) => {
    await page.goto("/iphone");
    // Any <img> without alt="" that isn't aria-hidden is a violation
    const badImages = await page
      .locator("img:not([alt]):not([aria-hidden='true'])")
      .count();
    expect(badImages).toBe(0);
  });
});
