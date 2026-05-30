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

/**
 * Favorite a place for the signed-in user. Idempotent on the API side, so
 * favoriting an already-favorited place still resolves successfully.
 */
export function addFavorite(placeId: string): Promise<Response> {
  return apiFetch(`/api/favorites`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ placeId }),
  });
}

/** Remove a place from the signed-in user's favorites. Idempotent (204). */
export function removeFavorite(placeId: string): Promise<Response> {
  return apiFetch(`/api/favorites/${encodeURIComponent(placeId)}`, {
    method: "DELETE",
  });
}

export interface Favorite {
  placeId: string;
  createdAt: string;
}

/**
 * List the signed-in user's favorites, newest first. Returns an empty array
 * for anonymous callers (the API answers 401, surfaced here as "no favorites")
 * or on any transport error, so server components can render without throwing.
 */
export async function listFavorites(): Promise<Favorite[]> {
  const res = await apiFetch(`/api/me/favorites`);
  if (!res.ok) return [];
  const data = (await res.json()) as { favorites: Favorite[] };
  return data.favorites;
}

/** Whether the signed-in user has favorited a given place. */
export async function isFavorited(placeId: string): Promise<boolean> {
  const favorites = await listFavorites();
  return favorites.some((f) => f.placeId === placeId);
}
