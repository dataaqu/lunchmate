"use client";

import dynamic from "next/dynamic";

export const GoogleMapComponent = dynamic(
  () =>
    import("@/components/google-map").then((mod) => mod.GoogleMapComponent),
  {
    ssr: false,
    loading: () => (
      <div
        className="w-full h-full bg-muted animate-pulse"
        aria-label="რუკა იტვირთება"
      />
    ),
  }
);
