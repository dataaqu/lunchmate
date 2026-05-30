import { describe, expect, it } from 'vitest';
import { createFavoriteSchema } from './favorite-schema.js';

describe('createFavoriteSchema', () => {
  it('accepts a non-empty place id', () => {
    const result = createFavoriteSchema.safeParse({ placeId: 'ChIJ12345' });
    expect(result.success).toBe(true);
  });

  it('trims surrounding whitespace', () => {
    const result = createFavoriteSchema.safeParse({ placeId: '  ChIJ12345  ' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.placeId).toBe('ChIJ12345');
    }
  });

  it.each(['', '   '])('rejects an empty / whitespace-only place id %p', (placeId) => {
    expect(createFavoriteSchema.safeParse({ placeId }).success).toBe(false);
  });

  it('rejects a place id longer than 255 characters', () => {
    expect(createFavoriteSchema.safeParse({ placeId: 'x'.repeat(256) }).success).toBe(false);
  });

  it('rejects a missing place id', () => {
    expect(createFavoriteSchema.safeParse({}).success).toBe(false);
  });

  it('rejects a non-string place id', () => {
    expect(createFavoriteSchema.safeParse({ placeId: 123 }).success).toBe(false);
  });
});
