import { Hono } from 'hono';
import { CATEGORY_PLACE_TYPES, isValidCategory } from '../lib/category-map.js';
import { getDistrict } from '../lib/districts.js';
import { placesCache } from '../lib/places-cache.js';

const PLACES_API_URL = 'https://places.googleapis.com/v1/places:searchNearby';
const PLACES_DETAIL_BASE = 'https://places.googleapis.com/v1/places';

const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.location',
  'places.rating',
  'places.userRatingCount',
  'places.priceLevel',
  'places.primaryType',
  'places.photos',
  'places.regularOpeningHours',
  'places.internationalPhoneNumber',
  'places.websiteUri',
].join(',');

const DETAIL_FIELD_MASK = [
  'id',
  'displayName',
  'formattedAddress',
  'location',
  'rating',
  'userRatingCount',
  'priceLevel',
  'primaryType',
  'photos',
  'regularOpeningHours',
  'internationalPhoneNumber',
  'websiteUri',
].join(',');

const MAX_PHOTOS = 5;

interface RawPhoto {
  name: string;
  widthPx?: number;
  heightPx?: number;
}

interface RawPlaceDetail {
  id: string;
  displayName?: { text: string; languageCode?: string };
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
  photos?: RawPhoto[];
}

interface NearbySearchRequest {
  locationRestriction: {
    circle: {
      center: { latitude: number; longitude: number };
      radius: number;
    };
  };
  includedPrimaryTypes: string[];
  maxResultCount: number;
  languageCode: string;
}

export const placesRoute = new Hono();

placesRoute.get('/', async (c) => {
  const apiKey = process.env['GOOGLE_PLACES_API_KEY'];
  if (!apiKey) {
    return c.json({ error: 'Server misconfiguration: missing Places API key' }, 500);
  }

  const category = c.req.query('category');
  const district = c.req.query('district');

  if (!category) {
    return c.json({ error: 'Missing required query parameter: category' }, 400);
  }

  if (!isValidCategory(category)) {
    return c.json(
      { error: `Invalid category. Allowed values: restaurant, cafe, fast_food` },
      400,
    );
  }

  const cacheKey = `places:${category}:${district ?? 'all'}`;
  const cached = placesCache.get<unknown[]>(cacheKey);
  if (cached) {
    return c.json({ places: cached, cached: true });
  }

  const coords = getDistrict(district);
  const placeTypes = CATEGORY_PLACE_TYPES[category];

  const body: NearbySearchRequest = {
    locationRestriction: {
      circle: {
        center: { latitude: coords.latitude, longitude: coords.longitude },
        radius: coords.radius,
      },
    },
    includedPrimaryTypes: placeTypes,
    maxResultCount: 20,
    languageCode: 'ka',
  };

  const response = await fetch(PLACES_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': FIELD_MASK,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[places] Google API error ${response.status}: ${errorText}`);
    return c.json({ error: 'Upstream error from Google Places API' }, 502);
  }

  const data = (await response.json()) as { places?: unknown[] };
  const places = data.places ?? [];

  placesCache.set(cacheKey, places);

  return c.json({ places, cached: false });
});

placesRoute.get('/:placeId', async (c) => {
  const apiKey = process.env['GOOGLE_PLACES_API_KEY'];
  if (!apiKey) {
    return c.json({ error: 'Server misconfiguration: missing Places API key' }, 500);
  }

  const placeId = c.req.param('placeId');
  const cacheKey = `place-detail:${placeId}`;
  const cached = placesCache.get<unknown>(cacheKey);
  if (cached) {
    return c.json({ place: cached, cached: true });
  }

  const res = await fetch(`${PLACES_DETAIL_BASE}/${placeId}?languageCode=ka`, {
    headers: {
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': DETAIL_FIELD_MASK,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`[place-detail] Google API error ${res.status}: ${errorText}`);
    if (res.status === 404) {
      return c.json({ error: 'Place not found' }, 404);
    }
    return c.json({ error: 'Upstream error from Google Places API' }, 502);
  }

  const raw = (await res.json()) as RawPlaceDetail;

  const photoRefs = (raw.photos ?? []).slice(0, MAX_PHOTOS);
  const photos = (
    await Promise.all(
      photoRefs.map(async (photo) => {
        try {
          const mediaRes = await fetch(
            `https://places.googleapis.com/v1/${photo.name}/media?maxWidthPx=800&skipHttpRedirect=true`,
            { headers: { 'X-Goog-Api-Key': apiKey } },
          );
          if (!mediaRes.ok) return null;
          const mediaData = (await mediaRes.json()) as { photoUri?: string };
          return mediaData.photoUri ?? null;
        } catch {
          return null;
        }
      }),
    )
  ).filter((uri): uri is string => uri !== null);

  const place = {
    id: raw.id,
    displayName: raw.displayName,
    formattedAddress: raw.formattedAddress,
    rating: raw.rating,
    userRatingCount: raw.userRatingCount,
    priceLevel: raw.priceLevel,
    primaryType: raw.primaryType,
    regularOpeningHours: raw.regularOpeningHours,
    internationalPhoneNumber: raw.internationalPhoneNumber,
    websiteUri: raw.websiteUri,
    photos,
  };

  placesCache.set(cacheKey, place);

  return c.json({ place, cached: false });
});
