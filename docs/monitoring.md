# Monitoring & performance (T4.6)

How lunchmate observes performance, errors, and cost. Four layers:

## 1. Web Analytics + Speed Insights (Vercel)

`apps/web/src/app/[locale]/layout.tsx` renders `<Analytics />` (`@vercel/analytics`)
and `<SpeedInsights />` (`@vercel/speed-insights`). Both auto-activate on Vercel —
no env vars needed. Speed Insights collects **real-user Core Web Vitals** (LCP, CLS,
INP, …). View at: Vercel project → **Speed Insights** / **Analytics** tabs.

**Target: Core Web Vitals ≥ "Good".** Validate post-deploy in the Speed Insights
dashboard (field data) and via Lighthouse / PageSpeed Insights (lab data) against
the production URL. "Good" thresholds: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1.

## 2. Error tracking (Sentry)

Both apps use Sentry, and **stay a no-op until a DSN is set** (so local/dev/CI
runs send nothing).

- **Web** (`@sentry/nextjs`): `instrumentation-client.ts` (browser),
  `instrumentation.ts` → `sentry.server.config.ts` / `sentry.edge.config.ts`
  (server + edge), and `withSentryConfig` in `next.config.ts`. Set
  `NEXT_PUBLIC_SENTRY_DSN`. Source-map upload runs only when `SENTRY_AUTH_TOKEN`
  (+ `SENTRY_ORG`, `SENTRY_PROJECT`) is set — CI leaves it blank, so the build
  never fails for missing Sentry creds.
- **API** (`@sentry/node`): `apps/api/src/instrument.ts` (imported first in
  `index.ts`) + a Hono `app.onError` that calls `Sentry.captureException`. Set
  `SENTRY_DSN`.

Configure DSNs in the hosting platforms: **Vercel** (web) and **Railway** (API).

## 3. Quota monitoring alert (Google Cloud)

[`infra/quota-alert`](../infra/quota-alert/README.md) — a Cloud Monitoring alert
policy that emails an early warning when Maps/Places request volume is high or
quota-exceeded errors appear. Operator-provisioned via `setup.sh`.

## 4. Billing cap (Google Cloud)

[`infra/billing-cap`](../infra/billing-cap/README.md) — the hard backstop: a $200
budget that detaches billing (T1.5). The quota alert above is meant to fire long
before this ever triggers.
