"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { useTranslations } from "next-intl";

interface Props {
  photos: string[];
  altPrefix: string;
}

export function PhotoCarousel({ photos, altPrefix }: Props) {
  const t = useTranslations("Place");
  const [current, setCurrent] = useState(0);

  if (photos.length === 0) {
    return (
      <div className="flex h-64 w-full items-center justify-center bg-muted text-muted-foreground">
        <ImageOff className="size-8" />
      </div>
    );
  }

  const prev = () => setCurrent((c) => (c - 1 + photos.length) % photos.length);
  const next = () => setCurrent((c) => (c + 1) % photos.length);

  return (
    <div className="relative h-72 w-full overflow-hidden bg-muted">
      {photos.map((uri, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={uri}
          src={uri}
          alt={t("photoAlt", { prefix: altPrefix, index: i + 1 })}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
            i === current ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        />
      ))}

      {photos.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label={t("prevPhoto")}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white hover:bg-black/60 transition-colors"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            onClick={next}
            aria-label={t("nextPhoto")}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white hover:bg-black/60 transition-colors"
          >
            <ChevronRight className="size-5" />
          </button>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={t("photoIndicator", { index: i + 1 })}
                className={`h-1.5 rounded-full transition-all ${
                  i === current ? "w-4 bg-white" : "w-1.5 bg-white/50 hover:bg-white/75"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
