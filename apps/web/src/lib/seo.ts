import { routing } from "@/i18n/routing";

/**
 * Build the `alternates.languages` map for a locale-agnostic path so each page
 * advertises its `hreflang` siblings. Paths are returned relative to the site
 * origin (resolved against `metadataBase`).
 *
 * @param path Locale-less path beginning with `/`, or `"/"` for the home page.
 */
export function localeAlternates(path: string): Record<string, string> {
  const suffix = path === "/" ? "" : path;
  return Object.fromEntries(
    routing.locales.map((locale) => [locale, `/${locale}${suffix}`]),
  );
}
