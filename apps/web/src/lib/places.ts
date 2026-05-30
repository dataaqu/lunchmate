export interface PlaceDetail {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  rating?: number;
  userRatingCount?: number;
  priceLevel?: string;
  primaryType?: string;
  regularOpeningHours?: {
    openNow?: boolean;
    weekdayDescriptions?: string[];
  };
  internationalPhoneNumber?: string;
  websiteUri?: string;
  photos: string[];
}

/**
 * Price-level → ₾ symbol map. The symbols are locale-independent; only the
 * "free" label is translated (see the `Place.priceFree` message).
 */
export const PRICE_SYMBOLS: Record<string, string> = {
  PRICE_LEVEL_INEXPENSIVE: "₾",
  PRICE_LEVEL_MODERATE: "₾₾",
  PRICE_LEVEL_EXPENSIVE: "₾₾₾",
  PRICE_LEVEL_VERY_EXPENSIVE: "₾₾₾₾",
};

/** Resolve the Hono API base URL (mirrors `lib/api.ts`). */
function apiBaseUrl(): string {
  return (
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:3001"
  );
}

/**
 * Fetch a single place by id from the Hono API. Returns `null` on 404 so callers
 * can `notFound()`. Cached for 5 minutes — shared by the place page, its
 * `generateMetadata`, and the Open Graph image route.
 */
export async function fetchPlace(placeId: string): Promise<PlaceDetail | null> {
  const res = await fetch(
    `${apiBaseUrl()}/api/places/${encodeURIComponent(placeId)}`,
    { next: { revalidate: 300 } },
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Places API error ${res.status}`);
  const data = (await res.json()) as { place: PlaceDetail };
  return data.place;
}
