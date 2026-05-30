import { createNavigation } from "next-intl/navigation";

import { routing } from "./routing";

/**
 * Locale-aware navigation APIs. Use these `Link`, `redirect`, `useRouter`, etc.
 * instead of the ones from `next/link` / `next/navigation` so the active locale
 * prefix (`/ka`, `/en`) is preserved automatically.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
