import { index, pgTable, primaryKey, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users.js';

/**
 * A user's favorited (bookmarked) place. Like `reviews`, `placeId` is the
 * Google Places resource id (text, not an FK — places live in Google's API,
 * not our DB). The composite primary key `(userId, placeId)` makes favoriting
 * naturally idempotent: a user can favorite a place at most once.
 */
export const favorites = pgTable(
  'favorites',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    placeId: text('place_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.placeId] }),
    index('favorites_user_id_idx').on(table.userId),
  ],
);

export type Favorite = typeof favorites.$inferSelect;
export type NewFavorite = typeof favorites.$inferInsert;
