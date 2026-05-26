import { Hono } from 'hono';
import { CATEGORY_PLACE_TYPES, isValidCategory } from '../lib/category-map.js';
import { getDistrict } from '../lib/districts.js';
import { placesCache } from '../lib/places-cache.js';

const PLACES_API_URL = 'https://places.googleapis.com/v1/places:searchNearby';

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
