"use client";

import { useState, useTransition } from "react";
import { Loader2, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { Review, ReviewsPage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { loadMoreReviews, removeReview } from "@/app/place/[placeId]/actions";

interface ReviewsListProps {
  placeId: string;
  initial: ReviewsPage;
  /** The signed-in user's id, or `null` for anonymous visitors. */
  currentUserId: string | null;
}

const dateFormatter = new Intl.DateTimeFormat("ka-GE", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** Five stars with the first `rating` filled. */
function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center", className)} aria-hidden>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(
            "size-4",
            n <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-muted text-muted-foreground/40",
          )}
        />
      ))}
    </span>
  );
}

function AuthorAvatar({ name, image }: { name: string | null; image: string | null }) {
  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- external OAuth avatars, matches photo-carousel
      <img
        src={image}
        alt=""
        width={36}
        height={36}
        className="size-9 rounded-full object-cover"
      />
    );
  }
  const initial = (name?.trim()?.[0] ?? "?").toUpperCase();
  return (
    <span className="flex size-9 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
      {initial}
    </span>
  );
}

function ReviewCard({
  review,
  canDelete,
  onDelete,
  deleting,
}: {
  review: Review;
  canDelete: boolean;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <li className="flex gap-3 py-4">
      <AuthorAvatar name={review.author.name} image={review.author.image} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate font-medium">
            {review.author.name ?? "ანონიმური"}
          </span>
          {canDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
              onClick={onDelete}
              disabled={deleting}
              aria-label="შეფასების წაშლა"
            >
              {deleting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
            </Button>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-2">
          <Stars rating={review.rating} />
          <span className="text-xs text-muted-foreground">
            {dateFormatter.format(new Date(review.createdAt))}
          </span>
        </div>
        {review.comment && (
          <p className="mt-2 text-sm leading-relaxed whitespace-pre-line">
            {review.comment}
          </p>
        )}
      </div>
    </li>
  );
}

export function ReviewsList({ placeId, initial, currentUserId }: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>(initial.reviews);
  const [total, setTotal] = useState(initial.aggregate.count);
  const [average, setAverage] = useState(initial.aggregate.average);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loadingMore, startLoadMore] = useTransition();

  const hasMore = reviews.length < total;

  function handleLoadMore() {
    startLoadMore(async () => {
      try {
        const next = await loadMoreReviews(placeId, reviews.length);
        setReviews((prev) => {
          const seen = new Set(prev.map((r) => r.id));
          return [...prev, ...next.reviews.filter((r) => !seen.has(r.id))];
        });
        // Keep the totals in sync in case reviews were added/removed meanwhile.
        setTotal(next.aggregate.count);
        setAverage(next.aggregate.average);
      } catch {
        toast.error("შეფასებების ჩატვირთვა ვერ მოხერხდა.");
      }
    });
  }

  function handleDelete(id: string) {
    setDeletingId(id);
    const previous = reviews;
    // Optimistic removal.
    setReviews((prev) => prev.filter((r) => r.id !== id));
    setTotal((t) => Math.max(0, t - 1));

    void (async () => {
      const result = await removeReview(placeId, id);
      setDeletingId(null);
      if (result.ok) {
        toast.success("შეფასება წაიშალა.");
      } else {
        // Roll back on failure.
        setReviews(previous);
        setTotal((t) => t + 1);
        toast.error(result.error);
      }
    })();
  }

  return (
    <section className="mt-8 px-6">
      <div className="flex items-center justify-between border-b pb-3">
        <h2 className="text-lg font-semibold">შეფასებები</h2>
        {average !== null && total > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <Stars rating={Math.round(average)} />
            <span className="font-medium">{average.toFixed(1)}</span>
            <span className="text-muted-foreground">
              ({total.toLocaleString("ka-GE")})
            </span>
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          ჯერ არავის დაუტოვებია შეფასება. იყავი პირველი!
        </p>
      ) : (
        <ul className="divide-y">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              canDelete={currentUserId !== null && review.author.id === currentUserId}
              onDelete={() => handleDelete(review.id)}
              deleting={deletingId === review.id}
            />
          ))}
        </ul>
      )}

      {hasMore && (
        <div className="pt-4 text-center">
          <Button variant="outline" onClick={handleLoadMore} disabled={loadingMore}>
            {loadingMore && <Loader2 className="size-4 animate-spin" />}
            მეტის ჩვენება
          </Button>
        </div>
      )}
    </section>
  );
}
