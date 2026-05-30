import { z } from 'zod';

/** Body schema for creating a review. Rating is constrained to 1–5. */
export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(500).optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

export interface Pagination {
  limit: number;
  offset: number;
}

/**
 * Parse `limit` / `offset` query strings into a safe pagination window.
 * Invalid or missing values fall back to defaults; values are clamped so a
 * caller can never request an unbounded page or a negative offset.
 */
export function parsePagination(rawLimit?: string, rawOffset?: string): Pagination {
  return {
    limit: clampInt(rawLimit, DEFAULT_LIMIT, 1, MAX_LIMIT),
    offset: clampInt(rawOffset, 0, 0, Number.MAX_SAFE_INTEGER),
  };
}

function clampInt(raw: string | undefined, fallback: number, min: number, max: number): number {
  if (raw === undefined) return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

/** Aggregate rating stats for a place's reviews. */
export interface ReviewAggregate {
  /** Total number of reviews for the place (across all pages). */
  count: number;
  /** Mean rating rounded to one decimal, or `null` when there are no reviews. */
  average: number | null;
}

/**
 * Normalise the raw `count(*)` / `avg(rating)` result from Drizzle into a clean
 * aggregate. Postgres returns `avg` as a numeric string (and `count` may arrive
 * as a string depending on the driver), so coerce both. The average is rounded
 * to one decimal; an empty place yields `{ count: 0, average: null }`.
 */
export function normalizeAggregate(raw: {
  count: number | string | null;
  average: number | string | null;
}): ReviewAggregate {
  const count = typeof raw.count === 'string' ? Number.parseInt(raw.count, 10) : raw.count ?? 0;
  if (!count || count <= 0) return { count: 0, average: null };

  const avgNum = raw.average === null ? NaN : Number(raw.average);
  const average = Number.isNaN(avgNum) ? null : Math.round(avgNum * 10) / 10;
  return { count, average };
}
