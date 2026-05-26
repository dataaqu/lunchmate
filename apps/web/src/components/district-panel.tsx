"use client";

import { useState } from "react";
import { DISTRICTS } from "@/data/districts";
import { DistrictMap } from "./district-map";

export function DistrictPanel() {
  const [active, setActive] = useState<string | null>(null);

  const activeLabel =
    active != null
      ? (DISTRICTS.find((d) => d.name === active)?.label ?? null)
      : null;

  return (
    <div className="w-60 rounded-xl bg-white/90 shadow-md backdrop-blur-sm overflow-hidden">
      <div className="px-3 pt-3 pb-1 flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          უბანი
        </span>
        {active && (
          <button
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setActive(null)}
            aria-label="ფილტრის გასუფთავება"
          >
            ✕
          </button>
        )}
      </div>

      <DistrictMap activeDistrict={active} onSelect={setActive} />

      <div className="px-3 py-2 min-h-[28px] text-center">
        {activeLabel ? (
          <span className="text-xs font-medium text-foreground">
            {activeLabel}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">
            უბანი არ არის არჩეული
          </span>
        )}
      </div>
    </div>
  );
}
