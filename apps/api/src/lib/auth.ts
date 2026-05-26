import { createMiddleware } from 'hono/factory';
import { jwtVerify } from 'jose';

export interface AuthVariables {
  /** Authenticated user id, taken from the verified token's `sub`/`id` claim. */
  userId: string;
}

/**
 * Claims the Next.js web app stamps on the bridge token (see
 * `apps/web/src/lib/api-token.ts`). Verifying them here pins the token to its
 * intended issuer/audience so a JWT minted for some other purpose — but signed
 * with the same shared secret — can't be replayed against this API.
 */
export const BRIDGE_ISSUER = 'lunchmate-web';
export const BRIDGE_AUDIENCE = 'lunchmate-api';

/**
 * Require a valid bearer JWT, signed with the shared `NEXTAUTH_SECRET`.
 *
 * This is the Auth.js ↔ Hono bridge (T3.5). NextAuth v5 session tokens are
 * encrypted JWEs, so the raw session cookie can't be verified here directly;
 * instead the web app mints a short-lived HS256 JWT (carrying the user id as
 * `sub`, plus the bridge issuer/audience) and forwards it as a bearer token.
 * On success the resolved user id is stored on the context as `userId`.
 */
export const requireAuth = createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
  const secret = process.env['NEXTAUTH_SECRET'];
  if (!secret) {
    return c.json({ error: 'Server misconfiguration: missing auth secret' }, 500);
  }

  const header = c.req.header('Authorization');
  if (!header?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = header.slice('Bearer '.length).trim();

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
      issuer: BRIDGE_ISSUER,
      audience: BRIDGE_AUDIENCE,
    });
    const userId = payload.sub ?? (typeof payload['id'] === 'string' ? payload['id'] : undefined);
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    c.set('userId', userId);
  } catch {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  await next();
  return;
});
