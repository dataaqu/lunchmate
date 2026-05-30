import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  /* config options here */
};

// Wires the request config + Turbopack/webpack message-loading for next-intl.
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withSentryConfig(withNextIntl(nextConfig), {
  // Source-map upload runs only when SENTRY_AUTH_TOKEN is present (it isn't in
  // CI), so the build never fails for missing Sentry credentials.
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  // Upload a wider set of source maps for nicer stack traces.
  widenClientFileUpload: true,
});
