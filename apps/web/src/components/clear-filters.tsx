"use client";

import { X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";

/**
 * Clears every active filter (category + district) at once.
 * Renders nothing when no filter is set.
 */
export function ClearFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const hasFilters =
    searchParams.has("category") || searchParams.has("district");

  if (!hasFilters) return null;

  return (
    <Button
      variant="secondary"
      size="sm"
      className="shadow-md"
      onClick={() => router.replace("/", { scroll: false })}
    >
      <X className="size-4" aria-hidden="true" />
      ფილტრის გასუფთავება
    </Button>
  );
}
