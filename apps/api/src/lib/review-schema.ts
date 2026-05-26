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
