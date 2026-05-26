import { Suspense } from "react";
import { MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CategoryFilter } from "@/components/category-filter";
import { ClearFilters } from "@/components/clear-filters";
import { GoogleMapComponent } from "@/components/map-loader";
import { DistrictPanel } from "@/components/district-panel";

export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      <header className="border-b shrink-0">
        <div className="mx-auto flex w-full max-w-screen-xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <MapPin className="size-5" />
            <span className="font-semibold tracking-tight">
              თბილისის კვების გიდი
            </span>
          </div>
          <Button variant="outline" size="sm" disabled>
            შესვლა
          </Button>
        </div>
      </header>

      <main className="relative flex-1 min-h-0">
        <GoogleMapComponent />
        <div className="absolute top-4 left-1/2 z-10 -translate-x-1/2 flex flex-col items-center gap-2">
          <Suspense>
            <CategoryFilter />
          </Suspense>
          <Suspense>
            <ClearFilters />
          </Suspense>
        </div>
        <div className="absolute top-4 left-4 z-10">
          <Suspense>
            <DistrictPanel />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
