"use client";

import * as React from "react";
import Link from "next/link";
import { ImageOff, Star } from "lucide-react";

import { FavoriteButton } from "@/components/favorite-button";

export interface FavoritePlace {
  id: string;
  name: string;
  address?: string;
  rating?: number;
  photo?: string;
}

/**
 * The `/favorites` grid (T4.2). Each card links to the place detail, with a ♥
 * overlay (rendered as a sibling of the link, so tapping it never navigates).
 * Un-favoriting removes the card from the list optimistically.
 */
export function FavoritesList({ places }: { places: FavoritePlace[] }) {
  const [items, setItems] = React.useState(places);

  function handleToggle(id: string, favorited: boolean) {
    if (!favorited) {
      setItems((prev) => prev.filter((p) => p.id !== id));
    }
  }

  if (items.length === 0) {
    return (
      <p className="py-16 text-center text-muted-foreground">
        ყველა რჩეული წაიშალა.
      </p>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {items.map((place) => (
        <li key={place.id} className="relative">
          <div className="overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md">
            <Link
              href={`/place/${encodeURIComponent(place.id)}`}
              className="block"
            >
              <div className="relative h-40 w-full bg-muted">
                {place.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={place.photo}
                    alt={place.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <ImageOff className="size-8" />
                  </div>
                )}
              </div>
              <div className="space-y-1 p-4">
                <h2 className="truncate font-semibold leading-tight">
                  {place.name}
                </h2>
                {place.rating !== undefined && (
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium text-foreground">
                      {place.rating.toFixed(1)}
                    </span>
                  </span>
                )}
                {place.address && (
                  <p className="truncate text-sm text-muted-foreground">
                    {place.address}
                  </p>
                )}
              </div>
            </Link>
          </div>
          <FavoriteButton
            placeId={place.id}
            initialFavorited
            isAuthenticated
            onToggle={(favorited) => handleToggle(place.id, favorited)}
            className="absolute right-2 top-2 bg-background/80 backdrop-blur hover:bg-background"
          />
        </li>
      ))}
    </ul>
  );
}
