/**
 * Canonical public origin of the web app, used for SEO metadata: `metadataBase`,
 * Open Graph URLs, sitemap entries and JSON-LD. Resolved from the environment so
 * preview/production deployments advertise the right host.
 *
 * Resolution order:
 *   1. `NEXT_PUBLIC_SITE_URL` — explicit, set per environment (see `.env.example`).
 *   2. `VERCEL_PROJECT_PRODUCTION_URL` — injected by Vercel (host only, no scheme).
 *   3. `NEXTAUTH_URL` — already configured for Auth.js; a sensible local default.
 *   4. `http://localhost:3000` — dev fallback.
 */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return stripTrailingSlash(explicit);

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${stripTrailingSlash(vercel)}`;

  const nextAuth = process.env.NEXTAUTH_URL;
  if (nextAuth) return stripTrailingSlash(nextAuth);

  return "http://localhost:3000";
}

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}
