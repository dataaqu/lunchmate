import type { Metadata } from "next";
import { ArrowLeft, Heart } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { auth } from "@/auth";
import { listFavorites } from "@/lib/api";
import { Link, redirect } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { FavoritesList, type FavoritePlace } from "@/components/favorites-list";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Favorites" });
  return { title: t("pageTitle") };
}

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
  fallbackName: string,
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
      name: p.displayName?.text ?? fallbackName,
      address: p.formattedAddress,
      rating: p.rating,
      photo: p.photos?.[0],
    };
  } catch {
    return null;
  }
}

export default async function FavoritesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Favorites" });
  const tc = await getTranslations({ locale, namespace: "Common" });

  const session = await auth();
  if (!session?.user?.id) {
    redirect({ href: "/login", locale });
  }

  const favorites = await listFavorites();
  const places = (
    await Promise.all(
      favorites.map((f) => fetchPlaceSummary(f.placeId, t("fallbackName"))),
    )
  ).filter((p): p is FavoritePlace => p !== null);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b shrink-0">
        <div className="mx-auto flex w-full max-w-screen-md items-center gap-3 px-6 py-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/" aria-label={tc("backToMap")}>
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <span className="font-semibold tracking-tight">{t("heading")}</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-screen-md flex-1 px-6 py-6">
        {places.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <Heart className="size-10 text-muted-foreground" />
            <p className="text-muted-foreground">{t("empty")}</p>
            <Button asChild>
              <Link href="/">{t("backToMap")}</Link>
            </Button>
          </div>
        ) : (
          <FavoritesList places={places} />
        )}
      </main>
    </div>
  );
}
