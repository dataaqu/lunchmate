import "server-only";
import { SignJWT } from "jose";

/**
 * Auth.js ↔ Hono JWT bridge — web side (T3.5).
 *
 * NextAuth v5 stores its session as an encrypted JWE, which the Hono API
 * cannot verify with `jose.jwtVerify`. So instead of forwarding the session
 * cookie, we mint a dedicated short-lived HS256 JWT signed with the shared
 * `NEXTAUTH_SECRET` and forward it as `Authorization: Bearer <token>`. The API
 * middleware (`apps/api/src/lib/auth.ts`) verifies the signature, issuer, and
 * audience and reads the user id from `sub`.
 *
 * These constants are duplicated on the API side (`BRIDGE_ISSUER` /
 * `BRIDGE_AUDIENCE`) — the two apps are deployed separately and share only the
 * secret, so the contract lives in both repos by design.
 */
export const BRIDGE_ISSUER = "lunchmate-web";
export const BRIDGE_AUDIENCE = "lunchmate-api";

/** How long a minted bridge token stays valid. Short by design — it's minted
 * fresh for each batch of server-side API calls, never persisted. */
const TOKEN_TTL = "5m";

/**
 * Mint a short-lived bearer token the Hono API will accept, carrying the
 * given user id as the `sub` claim. Server-only — the secret must never reach
 * the browser.
 */
export async function mintApiToken(userId: string): Promise<string> {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET is not set — cannot mint API bridge token");
  }

  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuer(BRIDGE_ISSUER)
    .setAudience(BRIDGE_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(TOKEN_TTL)
    .sign(new TextEncoder().encode(secret));
}
