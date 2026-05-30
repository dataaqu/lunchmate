"use client";

import * as React from "react";
import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

const RATING_LABELS = ["", "ცუდი", "ასე-ისე", "კარგი", "ძალიან კარგი", "შესანიშნავი"];

/**
 * Interactive 1–5 star rating input (T3.6).
 *
 * Controlled via `value` / `onChange`. Supports mouse hover preview and full
 * keyboard control (arrow keys + 1–5) through a radiogroup. `value` of 0 means
 * "not yet rated".
 */
export function StarRatingInput({
  value,
  onChange,
  disabled,
  name,
}: {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  name?: string;
}) {
  const [hover, setHover] = React.useState(0);
  const active = hover || value;

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (disabled) return;
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      onChange(Math.min(5, (value || 0) + 1));
    } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      onChange(Math.max(1, (value || 1) - 1));
    } else if (event.key >= "1" && event.key <= "5") {
      event.preventDefault();
      onChange(Number(event.key));
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div
        role="radiogroup"
        aria-label="შეფასება (1-დან 5 ვარსკვლავამდე)"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
        onMouseLeave={() => setHover(0)}
        className="flex items-center gap-0.5 rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        {name && <input type="hidden" name={name} value={value} />}
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} ${RATING_LABELS[star]}`}
            disabled={disabled}
            tabIndex={-1}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            className="rounded-sm p-0.5 transition-transform disabled:cursor-not-allowed hover:scale-110 disabled:hover:scale-100"
          >
            <Star
              className={cn(
                "size-7 transition-colors",
                star <= active
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-transparent text-muted-foreground/40",
              )}
            />
          </button>
        ))}
      </div>
      <span className="min-w-24 text-sm text-muted-foreground" aria-live="polite">
        {active ? RATING_LABELS[active] : "შეაფასეთ"}
      </span>
    </div>
  );
}
