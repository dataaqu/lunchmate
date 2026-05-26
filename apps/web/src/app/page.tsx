import { MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GoogleMapComponent } from "@/components/map-loader";

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

      <main className="flex-1 min-h-0">
        <GoogleMapComponent />
      </main>
    </div>
  );
}
