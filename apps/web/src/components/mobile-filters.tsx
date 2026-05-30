"use client";

import { SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { CategoryFilter } from "./category-filter";
import { ClearFilters } from "./clear-filters";
import { DistrictPanel } from "./district-panel";

/**
 * Mobile filters bottom sheet (T4.4). On small / touch screens the desktop
 * floating overlays (category pill + district panel) crowd the map, so they
 * are hidden there and surfaced instead behind a single floating button that
 * opens this drag-to-dismiss sheet.
 */
export function MobileFilters() {
  const t = useTranslations("Filters");
  const td = useTranslations("Districts");
  const searchParams = useSearchParams();

  const activeCount =
    (searchParams.has("category") ? 1 : 0) +
    (searchParams.has("district") ? 1 : 0);

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button size="lg" className="rounded-full shadow-lg">
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          {t("title")}
          {activeCount > 0 && (
            <span className="ml-1 inline-flex size-5 items-center justify-center rounded-full bg-primary-foreground text-xs font-semibold text-primary">
              {activeCount}
            </span>
          )}
        </Button>
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{t("title")}</DrawerTitle>
          <DrawerDescription>{t("description")}</DrawerDescription>
        </DrawerHeader>

        <div className="flex flex-col gap-6 overflow-y-auto px-4 pb-4">
          <section className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("category")}
            </h3>
            <CategoryFilter bare />
          </section>

          <section className="flex flex-col items-center gap-2">
            <h3 className="self-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {td("title")}
            </h3>
            <DistrictPanel />
          </section>
        </div>

        <div className="flex items-center justify-between gap-2 border-t p-4">
          <ClearFilters />
          <DrawerClose asChild>
            <Button variant="secondary" size="sm" className="ml-auto">
              {t("done")}
            </Button>
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
