// Sentry init for the browser (T4.6). Next.js loads this automatically on the client.
import * as Sentry from "@sentry/nextjs";

// The DSN is safe to expose to the browser, hence NEXT_PUBLIC_.
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  // No DSN configured → Sentry stays a no-op.
  enabled: Boolean(dsn),
  tracesSampleRate: 0.1,
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
});

// Instruments App Router client-side navigations for tracing.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
