import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site";

/**
 * `/robots.txt`. Allows all crawlers but keeps user-private and API routes out
 * of the index, and points crawlers at the sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/ka/favorites", "/en/favorites"],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
