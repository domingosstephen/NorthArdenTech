import { defineConfig, devices } from "@playwright/test";

/**
 * Run `npx playwright install` once before the first run to download browsers.
 *
 * Stripe test mode is required for checkout tests.
 * Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY and STRIPE_SECRET_KEY to test values.
 * Run the Stripe CLI in a second terminal to forward webhooks:
 *   stripe listen --forward-to localhost:3000/api/webhooks/stripe
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false, // sequential to avoid stock-reservation conflicts
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [["html", { outputFolder: "docs/playwright-report" }], ["list"]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-safari",
      use: { ...devices["iPhone 15"] },
    },
  ],
  webServer: process.env.CI
    ? {
        command: "npm run start",
        url: "http://localhost:3000",
        reuseExistingServer: false,
      }
    : undefined, // rely on dev server already running locally
});
