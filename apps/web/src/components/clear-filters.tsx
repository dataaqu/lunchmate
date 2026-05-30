"use client";

import { X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

/**
 * Clears every active filter (category + district) at once.
 * Renders nothing when no filter is set.
 */
export function ClearFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("Filters");

  const hasFilters =
    searchParams.has("category") || searchParams.has("district");

  if (!hasFilters) return null;

  return (
    <Button
      variant="secondary"
      size="sm"
      className="shadow-md"
      onClick={() => router.replace(pathname, { scroll: false })}
    >
      <X className="size-4" aria-hidden="true" />
      {t("clear")}
    </Button>
  );
}
