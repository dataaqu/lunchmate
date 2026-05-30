// Sentry init for the Hono API (T4.6). Imported first in index.ts so the SDK's
// auto-instrumentation patches Node's http/undici before the server boots.
import * as Sentry from '@sentry/node';

const dsn = process.env.SENTRY_DSN;

Sentry.init({
  dsn,
  // No DSN configured → Sentry stays a no-op (safe for local/dev/CI).
  enabled: Boolean(dsn),
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV ?? 'development',
});
