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

export interface ReviewAuthor {
  id: string;
  name: string | null;
  image: string | null;
}

export interface Review {
  id: string;
  placeId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  author: ReviewAuthor;
}

export interface ReviewAggregate {
  count: number;
  average: number | null;
}

export interface ReviewsPage {
  reviews: Review[];
  aggregate: ReviewAggregate;
  pagination: { limit: number; offset: number };
}

/**
 * Fetch a page of reviews for a place (public GET — newest first). Returns the
 * page rows plus an aggregate (total count + mean rating) used to render the
 * average and gate the "show more" control. Throws on a non-OK response so
 * callers / the error boundary can react.
 */
export async function getReviews(
  placeId: string,
  { limit = 20, offset = 0 }: { limit?: number; offset?: number } = {},
): Promise<ReviewsPage> {
  const query = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  const res = await apiFetch(
    `/api/places/${encodeURIComponent(placeId)}/reviews?${query}`,
    { cache: "no-store" },
  );
  if (!res.ok) throw new Error(`Reviews API error ${res.status}`);
  return (await res.json()) as ReviewsPage;
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
