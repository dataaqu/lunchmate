"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Category = "restaurant" | "cafe" | "fast_food";

const CATEGORIES: { value: Category; emoji: string; labelKey: string }[] = [
  { value: "restaurant", emoji: "🍽️", labelKey: "restaurant" },
  { value: "cafe", emoji: "☕", labelKey: "cafe" },
  { value: "fast_food", emoji: "🍔", labelKey: "fastFood" },
];

interface Props {
  /**
   * Drop the floating-overlay pill (white background + shadow) and let the
   * buttons wrap. Used inside the mobile filters drawer, where the chrome is
   * provided by the sheet itself.
   */
  bare?: boolean;
}

export function CategoryFilter({ bare = false }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("Categories");
  const active = searchParams.get("category") as Category | null;

  function toggle(value: Category) {
    const params = new URLSearchParams(searchParams.toString());
    if (active === value) {
      params.delete("category");
    } else {
      params.set("category", value);
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return (
    <div
      className={cn(
        "flex gap-2",
        bare
          ? "flex-wrap"
          : "rounded-xl bg-white/90 px-3 py-2 shadow-md backdrop-blur-sm",
      )}
    >
      {CATEGORIES.map(({ value, emoji, labelKey }) => (
        <Button
          key={value}
          variant={active === value ? "default" : "outline"}
          size="sm"
          onClick={() => toggle(value)}
          aria-pressed={active === value}
        >
          <span aria-hidden="true">{emoji}</span>
          {t(labelKey)}
        </Button>
      ))}
    </div>
  );
}
