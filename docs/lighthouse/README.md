# Lighthouse Reports

Run Lighthouse against a production or staging build (never `next dev` — the dev
server is not optimised and scores are meaningless).

## Quick run (CLI)

```bash
# 1. Build and start the server
npm run build && npm run start

# 2. Run Lighthouse against each key route
npx lighthouse http://localhost:3000          --output=html --output-path=docs/lighthouse/home.html
npx lighthouse http://localhost:3000/iphone   --output=html --output-path=docs/lighthouse/shop.html
npx lighthouse http://localhost:3000/iphone/iphone-16-pro --output=html --output-path=docs/lighthouse/pdp.html
npx lighthouse http://localhost:3000/iphone-duo --output=html --output-path=docs/lighthouse/duo.html
```

## Targets (§10 Quality floor)

| Metric       | Target |
|--------------|--------|
| Performance  | ≥ 90   |
| Accessibility| ≥ 95   |
| Best Practices | ≥ 95 |
| SEO          | 100    |

## Vercel integration (recommended)

Enable **Vercel Speed Insights** in the project dashboard.
Vercel runs Lighthouse automatically on every deploy preview and surfaces the
results in the deployment detail page — no manual script needed in CI.

## CI (GitHub Actions)

Add the `treosh/lighthouse-ci-action` step to `.github/workflows/ci.yml` after
the build step. Store the budget file at `lighthouserc.json`:

```json
{
  "ci": {
    "collect": { "startServerCommand": "npm start", "url": ["http://localhost:3000/", "http://localhost:3000/iphone"] },
    "assert": {
      "assertions": {
        "categories:performance": ["warn", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:seo": ["error", { "minScore": 1 }]
      }
    }
  }
}
```
