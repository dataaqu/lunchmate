import { defineRouting } from "next-intl/routing";

/**
 * Locale routing config (T4.3). Georgian is the default and unprefixed-fallback
 * locale; English is the secondary. `localePrefix: "always"` keeps every route
 * under `/ka/...` or `/en/...`, matching the PROJECT_PLAN routing spec.
 */
export const routing = defineRouting({
  locales: ["ka", "en"],
  defaultLocale: "ka",
});

export type Locale = (typeof routing.locales)[number];
