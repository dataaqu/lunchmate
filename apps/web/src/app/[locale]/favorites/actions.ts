"use server";

import { auth } from "@/auth";
import { addFavorite, removeFavorite } from "@/lib/api";

/**
 * Server action backing the ♥ button (T4.2).
 *
 * The ♥ button is a client component, but the Auth.js ↔ Hono bridge token can
 * only be minted server-side (see `@/lib/api-token`). So toggling a favorite
 * round-trips through this action, which resolves the session and forwards an
 * authenticated request to the Hono API.
 */
export type ToggleFavoriteResult =
  | { ok: true; favorited: boolean }
  | { ok: false; error: "unauthenticated" | "failed" };

export async function toggleFavorite(
  placeId: string,
  favorited: boolean,
): Promise<ToggleFavoriteResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "unauthenticated" };
  }

  const res = favorited
    ? await addFavorite(placeId)
    : await removeFavorite(placeId);

  if (!res.ok) {
    return { ok: false, error: "failed" };
  }

  return { ok: true, favorited };
}
