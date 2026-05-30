// Sentry init for the Node.js server runtime (T4.6).
// Loaded from instrumentation.ts when NEXT_RUNTIME === "nodejs".
import * as Sentry from "@sentry/nextjs";

// Prefer a server-only DSN, fall back to the public one so a single value works.
const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  // No DSN configured → Sentry stays a no-op (safe for local/dev and CI).
  enabled: Boolean(dsn),
  tracesSampleRate: 0.1,
  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
});
