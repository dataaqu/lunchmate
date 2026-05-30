"use client";

import * as React from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StarRatingInput } from "@/components/star-rating-input";
import { LoginDialog } from "@/components/login-dialog";
import { submitReview } from "@/app/place/[placeId]/actions";

const COMMENT_MAX = 500;

const reviewSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, { message: "აირჩიეთ შეფასება" })
    .max(5),
  comment: z
    .string()
    .max(COMMENT_MAX, { message: `მაქსიმუმ ${COMMENT_MAX} სიმბოლო` })
    .optional(),
});

type ReviewValues = z.infer<typeof reviewSchema>;

/**
 * Review submission form (T3.6).
 *
 * Anonymous visitors see the same inputs but the submit button opens the
 * sign-in dialog ("გაიარეთ ავტორიზაცია") instead of posting. Signed-in users
 * post through the `submitReview` server action, which revalidates the place
 * page so the new review shows up in the list (T3.7). If the session expired
 * server-side the action returns `unauthenticated` and we pop the same dialog.
 */
export function ReviewForm({
  placeId,
  isAuthenticated,
}: {
  placeId: string;
  isAuthenticated: boolean;
}) {
  const [loginOpen, setLoginOpen] = React.useState(false);

  const form = useForm<ReviewValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, comment: "" },
  });

  const comment = useWatch({ control: form.control, name: "comment" }) ?? "";
  const ratingError = form.formState.errors.rating?.message;
  const commentError = form.formState.errors.comment?.message;

  async function onSubmit(values: ReviewValues) {
    const result = await submitReview(placeId, {
      rating: values.rating,
      comment: values.comment?.trim() || undefined,
    });

    if (result.ok) {
      toast.success("მადლობა! თქვენი შეფასება დაემატა.");
      form.reset({ rating: 0, comment: "" });
      return;
    }

    if (result.reason === "unauthenticated") {
      toast.error(result.message);
      setLoginOpen(true);
      return;
    }

    toast.error(result.message);
  }

  return (
    <section aria-labelledby="review-form-heading" className="space-y-4">
      <h2 id="review-form-heading" className="text-lg font-semibold">
        დატოვეთ შეფასება
      </h2>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Controller
            control={form.control}
            name="rating"
            render={({ field }) => (
              <StarRatingInput
                value={field.value}
                onChange={field.onChange}
                disabled={form.formState.isSubmitting}
              />
            )}
          />
          {ratingError && (
            <p className="text-sm text-destructive">{ratingError}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="review-comment">კომენტარი (არასავალდებულო)</Label>
          <Textarea
            id="review-comment"
            placeholder="გაუზიარეთ სხვებს თქვენი გამოცდილება…"
            maxLength={COMMENT_MAX}
            rows={4}
            aria-invalid={commentError ? true : undefined}
            disabled={form.formState.isSubmitting}
            {...form.register("comment")}
          />
          <div className="flex items-center justify-between">
            <span className="text-sm text-destructive">{commentError ?? ""}</span>
            <span className="text-xs text-muted-foreground tabular-nums">
              {comment.length}/{COMMENT_MAX}
            </span>
          </div>
        </div>

        {isAuthenticated ? (
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && (
              <Loader2 className="animate-spin" />
            )}
            გაგზავნა
          </Button>
        ) : (
          <LoginDialog>
            <Button type="button">გაიარეთ ავტორიზაცია შესაფასებლად</Button>
          </LoginDialog>
        )}
      </form>

      {/* Controlled dialog for the expired-session path (action returns 401). */}
      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
    </section>
  );
}
