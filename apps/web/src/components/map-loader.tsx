"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";

function MapLoading() {
  const t = useTranslations("Map");
  return (
    <div
      className="w-full h-full bg-muted animate-pulse"
      aria-label={t("loading")}
    />
  );
}

export const GoogleMapComponent = dynamic(
  () =>
    import("@/components/google-map").then((mod) => mod.GoogleMapComponent),
  {
    ssr: false,
    loading: () => <MapLoading />,
  }
);
