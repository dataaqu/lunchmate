// Must be imported before anything else so Sentry can instrument the runtime.
import './instrument.js';
import * as Sentry from '@sentry/node';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { favoritesRoute, meFavoritesRoute } from './routes/favorites.js';
import { placesRoute } from './routes/places.js';
import { placeReviewsRoute, reviewsRoute } from './routes/reviews.js';

const app = new Hono();

const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:3000';
const allowedOrigins = corsOrigin.split(',').map((o) => o.trim()).filter(Boolean);

app.use('*', logger());
app.use(
  '*',
  cors({
    origin: allowedOrigins,
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);

app.get('/health', (c) =>
  c.json({
    status: 'ok',
    service: '@tfg/api',
    timestamp: new Date().toISOString(),
  }),
);

app.route('/api/places', placesRoute);
app.route('/api/places', placeReviewsRoute);
app.route('/api/reviews', reviewsRoute);
app.route('/api/favorites', favoritesRoute);
app.route('/api/me', meFavoritesRoute);

// Report unhandled errors to Sentry (no-op when SENTRY_DSN is unset).
app.onError((err, c) => {
  Sentry.captureException(err);
  console.error(err);
  return c.json({ error: 'Internal Server Error' }, 500);
});

const port = Number.parseInt(process.env.PORT ?? '3001', 10);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`[@tfg/api] listening on http://localhost:${info.port}`);
});

export type AppType = typeof app;
