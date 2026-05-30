import { describe, expect, it } from 'vitest';
import {
  AUTOCOMPLETE_PRIMARY_TYPES,
  buildAutocompleteRequest,
  normalizeSuggestions,
  type RawAutocompleteResponse,
} from './autocomplete.js';

describe('buildAutocompleteRequest', () => {
  it('passes the input through and biases to Tbilisi / Georgia', () => {
    const body = buildAutocompleteRequest('khachapuri');
    expect(body.input).toBe('khachapuri');
    expect(body.languageCode).toBe('ka');
    expect(body.includedRegionCodes).toEqual(['ge']);
    expect(body.locationBias.circle.radius).toBeGreaterThan(0);
    expect(body.includedPrimaryTypes).toEqual(AUTOCOMPLETE_PRIMARY_TYPES);
  });

  it('restricts to at most 5 primary types (Google API limit)', () => {
    expect(AUTOCOMPLETE_PRIMARY_TYPES.length).toBeLessThanOrEqual(5);
  });
});

describe('normalizeSuggestions', () => {
  it('flattens place predictions into the slim shape', () => {
    const raw: RawAutocompleteResponse = {
      suggestions: [
        {
          placePrediction: {
            placeId: 'abc123',
            text: { text: 'Cafe Littera, Tbilisi' },
            structuredFormat: {
              mainText: { text: 'Cafe Littera' },
              secondaryText: { text: 'Tbilisi, Georgia' },
            },
          },
        },
      ],
    };

    expect(normalizeSuggestions(raw)).toEqual([
      {
        placeId: 'abc123',
        primaryText: 'Cafe Littera',
        secondaryText: 'Tbilisi, Georgia',
      },
    ]);
  });

  it('falls back to full text when structuredFormat is missing', () => {
    const raw: RawAutocompleteResponse = {
      suggestions: [
        { placePrediction: { placeId: 'x', text: { text: 'Some Place' } } },
      ],
    };

    expect(normalizeSuggestions(raw)).toEqual([
      { placeId: 'x', primaryText: 'Some Place', secondaryText: null },
    ]);
  });

  it('drops query predictions (no placeId) and text-less entries', () => {
    const raw = {
      suggestions: [
        { queryPrediction: { text: { text: 'pizza near me' } } },
        { placePrediction: { text: { text: 'no id here' } } },
        { placePrediction: { placeId: 'noText' } },
        { placePrediction: { placeId: 'keep', text: { text: 'Keep Me' } } },
      ],
    } as RawAutocompleteResponse;

    expect(normalizeSuggestions(raw)).toEqual([
      { placeId: 'keep', primaryText: 'Keep Me', secondaryText: null },
    ]);
  });

  it('returns an empty array for null / empty input', () => {
    expect(normalizeSuggestions(null)).toEqual([]);
    expect(normalizeSuggestions(undefined)).toEqual([]);
    expect(normalizeSuggestions({})).toEqual([]);
  });
});
