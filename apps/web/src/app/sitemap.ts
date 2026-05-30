import type { MetadataRoute } from "next";

import { routing } from "@/i18n/routing";
import { localeAlternates } from "@/lib/seo";
import { siteUrl } from "@/lib/site";

/**
 * `/sitemap.xml`. Individual place pages are dynamic Google Place IDs with no
 * enumerable source, so the sitemap lists the crawlable static routes — the
 * localized home and sign-in pages — each with `hreflang` alternates. The
 * per-user `/favorites` route is intentionally excluded (see `robots.ts`).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const routes: { path: string; priority: number }[] = [
    { path: "/", priority: 1 },
    { path: "/login", priority: 0.5 },
  ];

  return routes.flatMap(({ path, priority }) => {
    // Sitemap alternates must be absolute URLs (metadata alternates may be
    // relative; here they may not).
    const relative = localeAlternates(path);
    const languages = Object.fromEntries(
      routing.locales.map((locale) => [locale, `${base}${relative[locale]}`]),
    );
    return routing.locales.map((locale) => ({
      url: languages[locale],
      changeFrequency: "weekly" as const,
      priority,
      alternates: { languages },
    }));
  });
}
