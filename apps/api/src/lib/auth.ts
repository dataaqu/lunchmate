import { createMiddleware } from 'hono/factory';
import { jwtVerify } from 'jose';

export interface AuthVariables {
  /** Authenticated user id, taken from the verified token's `sub`/`id` claim. */
  userId: string;
}

/**
 * Require a valid bearer JWT, signed with the shared `NEXTAUTH_SECRET`.
 *
 * This is the minimal validation T3.4 needs to gate writes. The full
 * Auth.js ↔ Hono bridge — reconciling the exact NextAuth token encoding and
 * how the Next.js app forwards it — is hardened in T3.5. On success the
 * resolved user id is stored on the context as `userId`.
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
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
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
