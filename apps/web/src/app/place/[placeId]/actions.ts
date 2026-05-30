"use server";

import { revalidatePath } from "next/cache";

import { deleteReview, getReviews, type ReviewsPage } from "@/lib/api";

/**
 * Server actions backing the reviews list (T3.7).
 *
 * Both run on the server so the Auth.js ↔ Hono bridge token (minted inside
 * `apiFetch` from the current session) never reaches the browser.
 */

const PAGE_SIZE = 20;

/**
 * Load the next page of reviews for a place. Called by the "show more" button
 * with the number of reviews already shown as the offset.
 */
export async function loadMoreReviews(
  placeId: string,
  offset: number,
): Promise<ReviewsPage> {
  return getReviews(placeId, { limit: PAGE_SIZE, offset });
}

export type RemoveReviewResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Delete one of the current user's own reviews. The API enforces authorship
 * (403 for anyone else, 401 when signed out); we map those to friendly Georgian
 * messages and revalidate the place page so a server refresh reflects the
 * removal.
 */
export async function removeReview(
  placeId: string,
  reviewId: string,
): Promise<RemoveReviewResult> {
  const res = await deleteReview(reviewId);

  if (res.ok) {
    revalidatePath(`/place/${placeId}`);
    return { ok: true };
  }

  if (res.status === 401) {
    return { ok: false, error: "გაიარეთ ავტორიზაცია." };
  }
  if (res.status === 403) {
    return { ok: false, error: "მხოლოდ ავტორს შეუძლია შეფასების წაშლა." };
  }
  if (res.status === 404) {
    return { ok: false, error: "შეფასება ვერ მოიძებნა." };
  }
  return { ok: false, error: "წაშლა ვერ მოხერხდა. სცადეთ თავიდან." };
}
