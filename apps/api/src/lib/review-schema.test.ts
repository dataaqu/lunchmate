import { describe, expect, it } from 'vitest';
import { createReviewSchema, normalizeAggregate, parsePagination } from './review-schema.js';

describe('createReviewSchema', () => {
  it('accepts a valid rating with an optional comment', () => {
    const result = createReviewSchema.safeParse({ rating: 4, comment: 'Great spot' });
    expect(result.success).toBe(true);
  });

  it('accepts a rating without a comment', () => {
    const result = createReviewSchema.safeParse({ rating: 5 });
    expect(result.success).toBe(true);
  });

  it.each([0, 6, 2.5, -1])('rejects out-of-range / non-integer rating %p', (rating) => {
    expect(createReviewSchema.safeParse({ rating }).success).toBe(false);
  });

  it('rejects a comment longer than 500 characters', () => {
    const result = createReviewSchema.safeParse({ rating: 3, comment: 'x'.repeat(501) });
    expect(result.success).toBe(false);
  });
});

describe('parsePagination', () => {
  it('defaults to limit 20, offset 0 when unset', () => {
    expect(parsePagination(undefined, undefined)).toEqual({ limit: 20, offset: 0 });
  });

  it('clamps limit to the 1..50 range', () => {
    expect(parsePagination('999', '0').limit).toBe(50);
    expect(parsePagination('0', '0').limit).toBe(1);
  });

  it('floors a negative offset to 0', () => {
    expect(parsePagination('10', '-5').offset).toBe(0);
  });

  it('falls back to defaults on non-numeric input', () => {
    expect(parsePagination('abc', 'xyz')).toEqual({ limit: 20, offset: 0 });
  });
});

describe('normalizeAggregate', () => {
  it('returns count 0 and null average when there are no reviews', () => {
    expect(normalizeAggregate({ count: 0, average: null })).toEqual({ count: 0, average: null });
  });

  it('coerces string count/average from the SQL driver', () => {
    expect(normalizeAggregate({ count: '3', average: '4.5' })).toEqual({ count: 3, average: 4.5 });
  });

  it('rounds the average to one decimal', () => {
    expect(normalizeAggregate({ count: 3, average: 4.33333 })).toEqual({ count: 3, average: 4.3 });
    expect(normalizeAggregate({ count: 2, average: 3.55 })).toEqual({ count: 2, average: 3.6 });
  });

  it('treats a null/NaN average with a positive count as null', () => {
    expect(normalizeAggregate({ count: 1, average: null })).toEqual({ count: 1, average: null });
    expect(normalizeAggregate({ count: 1, average: 'not-a-number' })).toEqual({
      count: 1,
      average: null,
    });
  });
});
