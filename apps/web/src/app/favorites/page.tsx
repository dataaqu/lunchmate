import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Heart } from "lucide-react";

import { auth } from "@/auth";
import { listFavorites } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { FavoritesList, type FavoritePlace } from "@/components/favorites-list";

export const metadata = { title: "რჩეულები" };

interface PlaceSummary {
  displayName?: { text: string };
  formattedAddress?: string;
  rating?: number;
  photos?: string[];
}

/** Fetch the lightweight fields the favorites grid needs for one place.
 *  Returns null if the place no longer resolves (deleted / API error) so it's
 *  simply dropped from the list. */
async function fetchPlaceSummary(
  placeId: string,
): Promise<FavoritePlace | null> {
  const apiUrl =
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:3001";

  try {
    const res = await fetch(
      `${apiUrl}/api/places/${encodeURIComponent(placeId)}`,
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { place: PlaceSummary };
    const p = data.place;
    return {
      id: placeId,
      name: p.displayName?.text ?? "ობიექტი",
      address: p.formattedAddress,
      rating: p.rating,
      photo: p.photos?.[0],
    };
  } catch {
    return null;
  }
}

export default async function FavoritesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const favorites = await listFavorites();
  const places = (
    await Promise.all(favorites.map((f) => fetchPlaceSummary(f.placeId)))
  ).filter((p): p is FavoritePlace => p !== null);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b shrink-0">
        <div className="mx-auto flex w-full max-w-screen-md items-center gap-3 px-6 py-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/" aria-label="უკან რუკაზე">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <span className="font-semibold tracking-tight">რჩეულები</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-screen-md flex-1 px-6 py-6">
        {places.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <Heart className="size-10 text-muted-foreground" />
            <p className="text-muted-foreground">
              ჯერ არ გაქვთ რჩეული ობიექტი.
            </p>
            <Button asChild>
              <Link href="/">რუკაზე დაბრუნება</Link>
            </Button>
          </div>
        ) : (
          <FavoritesList places={places} />
        )}
      </main>
    </div>
  );
}
