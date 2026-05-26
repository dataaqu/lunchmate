import { and, desc, eq } from 'drizzle-orm';
import { db, reviews, users } from '@tfg/db';
import { Hono } from 'hono';
import { requireAuth, type AuthVariables } from '../lib/auth.js';
import { createReviewSchema, parsePagination } from '../lib/review-schema.js';

/**
 * Place-scoped review endpoints. Mounted at `/api/places`, so the full paths
 * are `GET|POST /api/places/:placeId/reviews`.
 */
export const placeReviewsRoute = new Hono<{ Variables: AuthVariables }>();

// GET /api/places/:placeId/reviews — public, paginated, newest first.
placeReviewsRoute.get('/:placeId/reviews', async (c) => {
  const placeId = c.req.param('placeId');
  const { limit, offset } = parsePagination(c.req.query('limit'), c.req.query('offset'));

  const rows = await db
    .select({
      id: reviews.id,
      placeId: reviews.placeId,
      rating: reviews.rating,
      comment: reviews.comment,
      createdAt: reviews.createdAt,
      author: { id: users.id, name: users.name, image: users.image },
    })
    .from(reviews)
    .innerJoin(users, eq(reviews.userId, users.id))
    .where(eq(reviews.placeId, placeId))
    .orderBy(desc(reviews.createdAt))
    .limit(limit)
    .offset(offset);

  return c.json({ reviews: rows, pagination: { limit, offset } });
});

// POST /api/places/:placeId/reviews — authenticated, rating 1-5.
placeReviewsRoute.post('/:placeId/reviews', requireAuth, async (c) => {
  const placeId = c.req.param('placeId');

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const parsed = createReviewSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', issues: parsed.error.issues }, 400);
  }

  const userId = c.get('userId');
  const [created] = await db
    .insert(reviews)
    .values({
      placeId,
      userId,
      rating: parsed.data.rating,
      comment: parsed.data.comment ?? null,
    })
    .returning();

  return c.json({ review: created }, 201);
});

/**
 * Review-by-id endpoints. Mounted at `/api/reviews`, so the full path is
 * `DELETE /api/reviews/:id`.
 */
export const reviewsRoute = new Hono<{ Variables: AuthVariables }>();

// DELETE /api/reviews/:id — only the review's author may delete it.
reviewsRoute.delete('/:id', requireAuth, async (c) => {
  const id = c.req.param('id');
  const userId = c.get('userId');

  const [existing] = await db
    .select({ userId: reviews.userId })
    .from(reviews)
    .where(eq(reviews.id, id))
    .limit(1);

  if (!existing) {
    return c.json({ error: 'Review not found' }, 404);
  }
  if (existing.userId !== userId) {
    return c.json({ error: 'Forbidden' }, 403);
  }

  await db.delete(reviews).where(and(eq(reviews.id, id), eq(reviews.userId, userId)));

  return c.body(null, 204);
});
