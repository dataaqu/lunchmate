import { z } from 'zod';

/**
 * Body schema for favoriting a place. `placeId` is the Google Places resource
 * id — a non-empty string, bounded to keep junk out of the table.
 */
export const createFavoriteSchema = z.object({
  placeId: z.string().trim().min(1).max(255),
});

export type CreateFavoriteInput = z.infer<typeof createFavoriteSchema>;
