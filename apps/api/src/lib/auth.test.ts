import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Hono } from 'hono';
import { SignJWT } from 'jose';
import { BRIDGE_AUDIENCE, BRIDGE_ISSUER, requireAuth, type AuthVariables } from './auth.js';

const SECRET = 'test-secret-do-not-use-in-production';

/** Mint a token the way the web app's bridge does, with per-test overrides. */
function mintToken(
  opts: {
    secret?: string;
    sub?: string;
    issuer?: string;
    audience?: string;
    expiresIn?: string;
  } = {},
): Promise<string> {
  const builder = new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(opts.sub ?? 'user-123')
    .setIssuer(opts.issuer ?? BRIDGE_ISSUER)
    .setAudience(opts.audience ?? BRIDGE_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(opts.expiresIn ?? '5m');
  return builder.sign(new TextEncoder().encode(opts.secret ?? SECRET));
}

/** Minimal app exposing a protected route that echoes the resolved userId. */
function makeApp() {
  const app = new Hono<{ Variables: AuthVariables }>();
  app.get('/protected', requireAuth, (c) => c.json({ userId: c.get('userId') }));
  return app;
}

describe('requireAuth', () => {
  beforeEach(() => {
    process.env['NEXTAUTH_SECRET'] = SECRET;
  });

  afterEach(() => {
    delete process.env['NEXTAUTH_SECRET'];
  });

  it('accepts a valid bearer token and exposes the userId', async () => {
    const token = await mintToken({ sub: 'user-abc' });
    const res = await makeApp().request('/protected', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ userId: 'user-abc' });
  });

  it('returns 401 when the Authorization header is missing', async () => {
    const res = await makeApp().request('/protected');
    expect(res.status).toBe(401);
  });

  it('returns 401 when the header is not a Bearer token', async () => {
    const res = await makeApp().request('/protected', {
      headers: { Authorization: 'Basic abc123' },
    });
    expect(res.status).toBe(401);
  });

  it('returns 401 for a token signed with a different secret', async () => {
    const token = await mintToken({ secret: 'wrong-secret-wrong-secret-wrong!' });
    const res = await makeApp().request('/protected', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(401);
  });

  it('returns 401 for an expired token', async () => {
    const token = await mintToken({ expiresIn: '-1m' });
    const res = await makeApp().request('/protected', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(401);
  });

  it('returns 401 when the issuer does not match', async () => {
    const token = await mintToken({ issuer: 'someone-else' });
    const res = await makeApp().request('/protected', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(401);
  });

  it('returns 401 when the audience does not match', async () => {
    const token = await mintToken({ audience: 'some-other-api' });
    const res = await makeApp().request('/protected', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(401);
  });

  it('returns 401 for a malformed token', async () => {
    const res = await makeApp().request('/protected', {
      headers: { Authorization: 'Bearer not-a-jwt' },
    });
    expect(res.status).toBe(401);
  });

  it('returns 500 when the server secret is not configured', async () => {
    delete process.env['NEXTAUTH_SECRET'];
    const token = await mintToken();
    const res = await makeApp().request('/protected', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(500);
  });
});
