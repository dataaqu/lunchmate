"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createReview } from "@/lib/api";

/**
 * Server action backing the review form (T3.6).
 *
 * Mirrors the API's `createReviewSchema` (rating 1–5, comment ≤ 500 chars) so
 * obviously-bad input fails fast without a round-trip, then delegates to the
 * `server-only` `createReview` client which attaches the Auth.js ↔ Hono bridge
 * token. Anonymous (or expired-session) callers surface as `unauthenticated`
 * so the form can open the sign-in dialog instead of showing a raw error.
 */

const submitReviewSchema = z.object({
  rating: z.number().int().min(1, "აირჩიეთ შეფასება").max(5),
  comment: z.string().trim().max(500, "კომენტარი არ უნდა აღემატებოდეს 500 სიმბოლოს").optional(),
});

export type SubmitReviewResult =
  | { ok: true }
  | { ok: false; reason: "unauthenticated" | "validation" | "error"; message: string };

export async function submitReview(
  placeId: string,
  input: { rating: number; comment?: string },
): Promise<SubmitReviewResult> {
  const parsed = submitReviewSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      reason: "validation",
      message: parsed.error.issues[0]?.message ?? "არასწორი მონაცემები",
    };
  }

  const comment = parsed.data.comment?.length ? parsed.data.comment : undefined;

  let res: Response;
  try {
    res = await createReview(placeId, { rating: parsed.data.rating, comment });
  } catch {
    return {
      ok: false,
      reason: "error",
      message: "შეფასების გაგზავნა ვერ მოხერხდა. სცადეთ თავიდან.",
    };
  }

  if (res.status === 401) {
    return {
      ok: false,
      reason: "unauthenticated",
      message: "შეფასების დასატოვებლად გაიარეთ ავტორიზაცია.",
    };
  }
  if (res.status === 400) {
    return { ok: false, reason: "validation", message: "არასწორი მონაცემები" };
  }
  if (!res.ok) {
    return {
      ok: false,
      reason: "error",
      message: "შეფასების გაგზავნა ვერ მოხერხდა. სცადეთ თავიდან.",
    };
  }

  // Refresh the place page so the new review appears in the list (T3.7).
  revalidatePath(`/place/${placeId}`);
  return { ok: true };
}
