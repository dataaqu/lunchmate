import { and, desc, eq } from 'drizzle-orm';
import { db, favorites } from '@tfg/db';
import { Hono } from 'hono';
import { requireAuth, type AuthVariables } from '../lib/auth.js';
import { createFavoriteSchema } from '../lib/favorite-schema.js';

/**
 * Favorites endpoints. Mounted at `/api/favorites`, so the full paths are
 * `POST /api/favorites` and `DELETE /api/favorites/:placeId`. Both require a
 * valid bridge token (see `../lib/auth.ts`).
 */
export const favoritesRoute = new Hono<{ Variables: AuthVariables }>();

// POST /api/favorites — authenticated. Idempotent: the composite PK means a
// repeat favorite is a no-op, and we always echo back the stored row.
favoritesRoute.post('/', requireAuth, async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const parsed = createFavoriteSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', issues: parsed.error.issues }, 400);
  }

  const userId = c.get('userId');
  const { placeId } = parsed.data;

  const [created] = await db
    .insert(favorites)
    .values({ userId, placeId })
    .onConflictDoNothing()
    .returning();

  if (created) {
    return c.json({ favorite: created }, 201);
  }

  // Already favorited — return the existing row with a 200 so the client can
  // treat the operation as successful either way.
  const [existing] = await db
    .select()
    .from(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.placeId, placeId)))
    .limit(1);

  return c.json({ favorite: existing }, 200);
});

// DELETE /api/favorites/:placeId — authenticated. Idempotent: deleting a
// favorite that isn't there still returns 204.
favoritesRoute.delete('/:placeId', requireAuth, async (c) => {
  const placeId = c.req.param('placeId');
  const userId = c.get('userId');

  await db
    .delete(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.placeId, placeId)));

  return c.body(null, 204);
});

/**
 * Current-user favorites. Mounted at `/api/me`, so the full path is
 * `GET /api/me/favorites`.
 */
export const meFavoritesRoute = new Hono<{ Variables: AuthVariables }>();

// GET /api/me/favorites — authenticated, newest first.
meFavoritesRoute.get('/favorites', requireAuth, async (c) => {
  const userId = c.get('userId');

  const rows = await db
    .select({ placeId: favorites.placeId, createdAt: favorites.createdAt })
    .from(favorites)
    .where(eq(favorites.userId, userId))
    .orderBy(desc(favorites.createdAt));

  return c.json({ favorites: rows });
});
