"use client";

import { useEffect } from "react";
import { useMap } from "@vis.gl/react-google-maps";

import {
  DISTRICTS,
  TBILISI_CENTER,
  TBILISI_DEFAULT_ZOOM,
} from "@/data/districts";

interface Props {
  district: string | null;
}

const EARTH_RADIUS_M = 6_378_137;

/** Bounding box (lat/lng deltas) for a circle of `radius` metres at `center`. */
function boundsFor(center: { lat: number; lng: number }, radius: number) {
  const latDelta = (radius / EARTH_RADIUS_M) * (180 / Math.PI);
  const lngDelta =
    (radius / (EARTH_RADIUS_M * Math.cos((center.lat * Math.PI) / 180))) *
    (180 / Math.PI);
  return new google.maps.LatLngBounds(
    { lat: center.lat - latDelta, lng: center.lng - lngDelta },
    { lat: center.lat + latDelta, lng: center.lng + lngDelta },
  );
}

/**
 * Pans/zooms the map to the geographic boundary of the selected district.
 * Resets to the Tbilisi-wide view when the filter is cleared.
 */
export function DistrictFocus({ district }: Props) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const match = district
      ? DISTRICTS.find((d) => d.name === district)
      : null;

    if (match) {
      map.fitBounds(boundsFor(match.center, match.radius), 24);
    } else {
      map.moveCamera({ center: TBILISI_CENTER, zoom: TBILISI_DEFAULT_ZOOM });
    }
  }, [map, district]);

  return null;
}
