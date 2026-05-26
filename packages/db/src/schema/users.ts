import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

/**
 * Application users. The Auth.js (NextAuth) Drizzle adapter and its companion
 * tables (accounts, sessions, verification_tokens) are layered on in T3.2 — this
 * file defines only what the reviews API (T3.4) needs to reference today.
 */
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  image: text('image'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
