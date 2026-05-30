import { TBILISI_DEFAULT } from './districts.js';

/** Minimum query length before we bother hitting the Autocomplete API. */
export const MIN_QUERY_LENGTH = 2;

/**
 * Food-related primary types the Autocomplete results are restricted to —
 * mirrors the app's three categories (restaurant / cafe / fast food) plus a
 * couple of close cousins. Google caps `includedPrimaryTypes` at 5 entries.
 */
export const AUTOCOMPLETE_PRIMARY_TYPES = [
  'restaurant',
  'cafe',
  'fast_food_restaurant',
  'meal_takeaway',
  'bakery',
];

export interface AutocompleteRequest {
  input: string;
  languageCode: string;
  includedRegionCodes: string[];
  includedPrimaryTypes: string[];
  locationBias: {
    circle: {
      center: { latitude: number; longitude: number };
      radius: number;
    };
  };
}

/**
 * Build the request body for the Places Autocomplete (New) API. Biases results
 * to Tbilisi and restricts them to Georgia + food-related types so the food
 * guide never surfaces unrelated places.
 */
export function buildAutocompleteRequest(input: string): AutocompleteRequest {
  return {
    input,
    languageCode: 'ka',
    includedRegionCodes: ['ge'],
    includedPrimaryTypes: AUTOCOMPLETE_PRIMARY_TYPES,
    locationBias: {
      circle: {
        center: {
          latitude: TBILISI_DEFAULT.latitude,
          longitude: TBILISI_DEFAULT.longitude,
        },
        radius: TBILISI_DEFAULT.radius,
      },
    },
  };
}

interface RawSuggestion {
  placePrediction?: {
    placeId?: string;
    text?: { text?: string };
    structuredFormat?: {
      mainText?: { text?: string };
      secondaryText?: { text?: string };
    };
  };
}

export interface RawAutocompleteResponse {
  suggestions?: RawSuggestion[];
}

export interface AutocompleteSuggestion {
  placeId: string;
  primaryText: string;
  secondaryText: string | null;
}

/**
 * Flatten Google's nested Autocomplete response into the slim shape the web
 * palette consumes. Drops query-only predictions (no `placeId`) and entries
 * without any display text.
 */
export function normalizeSuggestions(
  raw: RawAutocompleteResponse | null | undefined,
): AutocompleteSuggestion[] {
  const suggestions = raw?.suggestions ?? [];
  const out: AutocompleteSuggestion[] = [];

  for (const s of suggestions) {
    const prediction = s.placePrediction;
    if (!prediction?.placeId) continue; // skip query predictions / malformed entries

    const primaryText =
      prediction.structuredFormat?.mainText?.text ?? prediction.text?.text ?? '';
    if (!primaryText) continue;

    out.push({
      placeId: prediction.placeId,
      primaryText,
      secondaryText: prediction.structuredFormat?.secondaryText?.text ?? null,
    });
  }

  return out;
}
