import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

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

const port = Number.parseInt(process.env.PORT ?? '3001', 10);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`[@tfg/api] listening on http://localhost:${info.port}`);
});

export type AppType = typeof app;
