"use client";

import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";

import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/**
 * Header language switcher (T4.3). Segmented KA | EN control that swaps the
 * active locale while preserving the current pathname and query string (so
 * filters on the map survive a language switch).
 */
export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  function switchTo(next: string) {
    if (next === locale) return;
    const qs = searchParams.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { locale: next });
  }

  return (
    <div className="flex items-center rounded-md border p-0.5 text-xs font-medium">
      {routing.locales.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => switchTo(loc)}
          aria-current={loc === locale}
          className={cn(
            "rounded px-2 py-1 uppercase transition-colors",
            loc === locale
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {loc}
        </button>
      ))}
    </div>
  );
}
