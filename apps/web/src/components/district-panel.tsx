"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { DISTRICTS } from "@/data/districts";
import { DistrictMap } from "./district-map";

export function DistrictPanel() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("Districts");
  const active = searchParams.get("district");

  function select(name: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (!name) {
      params.delete("district");
    } else {
      params.set("district", name);
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const activeLabel =
    active != null
      ? (DISTRICTS.find((d) => d.name === active)?.label ?? null)
      : null;

  return (
    <div className="w-60 rounded-xl bg-white/90 shadow-md backdrop-blur-sm overflow-hidden">
      <div className="px-3 pt-3 pb-1 flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {t("title")}
        </span>
        {active && (
          <button
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => select(null)}
            aria-label={t("clearAria")}
          >
            ✕
          </button>
        )}
      </div>

      <DistrictMap activeDistrict={active} onSelect={select} />

      <div className="px-3 py-2 min-h-[28px] text-center">
        {activeLabel ? (
          <span className="text-xs font-medium text-foreground">
            {activeLabel}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">{t("none")}</span>
        )}
      </div>
    </div>
  );
}
