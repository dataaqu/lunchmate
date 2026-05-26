"use client";

import { useEffect, useRef } from "react";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { useRouter } from "next/navigation";

type Category = "restaurant" | "cafe" | "fast_food";

interface Place {
  id: string;
  displayName: { text: string };
  location: { latitude: number; longitude: number };
}

const CATEGORY_EMOJI: Record<Category, string> = {
  restaurant: "🍽️",
  cafe: "☕",
  fast_food: "🍔",
};

interface Props {
  category: Category;
}

export function PlaceMarkers({ category }: Props) {
  const map = useMap();
  const markerLib = useMapsLibrary("marker");
  const router = useRouter();
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);

  useEffect(() => {
    if (!map || !markerLib) return;

    let cancelled = false;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

    fetch(`${apiUrl}/api/places?category=${category}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<{ places?: Place[] }>;
      })
      .then((data) => {
        if (cancelled) return;

        const places = data.places ?? [];
        const emoji = CATEGORY_EMOJI[category];

        const markers = places.map((place) => {
          const content = document.createElement("div");
          content.textContent = emoji;
          content.style.cssText =
            "font-size:24px;cursor:pointer;user-select:none;line-height:1;" +
            "filter:drop-shadow(0 1px 3px rgba(0,0,0,.35));";

          const marker = new markerLib.AdvancedMarkerElement({
            position: {
              lat: place.location.latitude,
              lng: place.location.longitude,
            },
            content,
            title: place.displayName.text,
          });

          marker.addListener("click", () => {
            router.push(`/place/${encodeURIComponent(place.id)}`);
          });

          return marker;
        });

        markersRef.current = markers;
        clustererRef.current = new MarkerClusterer({ map, markers });
      })
      .catch((err) => {
        if (!cancelled) console.error("[PlaceMarkers]", err);
      });

    return () => {
      cancelled = true;
      clustererRef.current?.clearMarkers();
      clustererRef.current = null;
      markersRef.current = [];
    };
  }, [map, markerLib, category, router]);

  return null;
}
