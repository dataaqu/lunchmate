import "server-only";
import { auth } from "@/auth";
import { mintApiToken } from "./api-token";

/** Resolve the Hono API base URL the same way the place pages do. */
function apiBaseUrl(): string {
  return (
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:3001"
  );
}

/**
 * Server-side fetch to the Hono API — the Next.js half of the Auth.js ↔ Hono
 * bridge (T3.5).
 *
 * If the caller is signed in, a freshly minted bridge token (see
 * `./api-token`) is attached as a bearer token so the API's `requireAuth`
 * middleware accepts authenticated requests. Anonymous calls go through
 * without a token — public GETs stay open while the API rejects writes with
 * 401, which the UI surfaces as a sign-in prompt.
 */
export async function apiFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const session = await auth();
  const headers = new Headers(init.headers);

  if (session?.user?.id) {
    const token = await mintApiToken(session.user.id);
    headers.set("Authorization", `Bearer ${token}`);
  }

  const url = `${apiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  return fetch(url, { ...init, headers });
}

export interface CreateReviewInput {
  rating: number;
  comment?: string;
}

/**
 * Submit a review for a place. Authenticated — the bridge token is attached
 * automatically by `apiFetch`. Returns the API `Response` so callers can
 * branch on `res.status` (401 → prompt sign-in, 400 → validation, etc.).
 */
export function createReview(
  placeId: string,
  input: CreateReviewInput,
): Promise<Response> {
  return apiFetch(`/api/places/${encodeURIComponent(placeId)}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

/**
 * Delete a review by id. The API enforces that only the author may delete it
 * (403 otherwise); the bridge token carries the author identity.
 */
export function deleteReview(id: string): Promise<Response> {
  return apiFetch(`/api/reviews/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
