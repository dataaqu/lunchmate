import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Phone, Globe, Clock, Star } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { auth } from "@/auth";
import { isFavorited } from "@/lib/api";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { FavoriteButton } from "@/components/favorite-button";
import { PhotoCarousel } from "@/components/photo-carousel";

interface PlaceDetail {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  rating?: number;
  userRatingCount?: number;
  priceLevel?: string;
  primaryType?: string;
  regularOpeningHours?: {
    openNow?: boolean;
    weekdayDescriptions?: string[];
  };
  internationalPhoneNumber?: string;
  websiteUri?: string;
  photos: string[];
}

// The ₾ symbols are locale-independent; only the "free" label is translated
// (see `Place.priceFree`).
const PRICE_SYMBOLS: Record<string, string> = {
  PRICE_LEVEL_INEXPENSIVE: "₾",
  PRICE_LEVEL_MODERATE: "₾₾",
  PRICE_LEVEL_EXPENSIVE: "₾₾₾",
  PRICE_LEVEL_VERY_EXPENSIVE: "₾₾₾₾",
};

async function fetchPlace(placeId: string): Promise<PlaceDetail | null> {
  const apiUrl =
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:3001";
  const res = await fetch(
    `${apiUrl}/api/places/${encodeURIComponent(placeId)}`,
    { next: { revalidate: 300 } },
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Places API error ${res.status}`);
  const data = (await res.json()) as { place: PlaceDetail };
  return data.place;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; placeId: string }>;
}) {
  const { locale, placeId } = await params;
  const place = await fetchPlace(placeId);
  const t = await getTranslations({ locale, namespace: "Place" });
  const name = place?.displayName?.text ?? t("fallbackName");
  return { title: name };
}

export default async function PlacePage({
  params,
}: {
  params: Promise<{ locale: string; placeId: string }>;
}) {
  const { locale, placeId } = await params;
  const t = await getTranslations({ locale, namespace: "Place" });
  const tc = await getTranslations({ locale, namespace: "Common" });

  const place = await fetchPlace(placeId);
  if (!place) notFound();

  const session = await auth();
  const isAuthenticated = Boolean(session?.user?.id);
  const favorited = isAuthenticated ? await isFavorited(placeId) : false;

  const name = place.displayName?.text ?? t("fallbackName");
  const openNow = place.regularOpeningHours?.openNow;
  const priceLabel = place.priceLevel
    ? place.priceLevel === "PRICE_LEVEL_FREE"
      ? t("priceFree")
      : (PRICE_SYMBOLS[place.priceLevel] ?? null)
    : null;

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b shrink-0">
        <div className="mx-auto flex w-full max-w-screen-md items-center gap-3 px-6 py-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/" aria-label={tc("backToMap")}>
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <span className="font-semibold tracking-tight truncate">{name}</span>
          <FavoriteButton
            placeId={placeId}
            initialFavorited={favorited}
            isAuthenticated={isAuthenticated}
            className="ml-auto shrink-0"
          />
        </div>
      </header>

      <main className="mx-auto w-full max-w-screen-md flex-1 pb-12">
        <PhotoCarousel photos={place.photos} altPrefix={name} />

        <div className="px-6 pt-6 space-y-5">
          <div>
            <h1 className="text-2xl font-bold">{name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {place.rating !== undefined && (
                <span className="flex items-center gap-1">
                  <Star className="size-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium text-foreground">
                    {place.rating.toFixed(1)}
                  </span>
                  {place.userRatingCount !== undefined && (
                    <span>({place.userRatingCount.toLocaleString()})</span>
                  )}
                </span>
              )}
              {priceLabel && (
                <span className="font-medium text-foreground">{priceLabel}</span>
              )}
              {openNow !== undefined && (
                <span
                  className={
                    openNow
                      ? "font-medium text-green-600"
                      : "font-medium text-red-500"
                  }
                >
                  {openNow ? t("openNow") : t("closed")}
                </span>
              )}
            </div>
          </div>

          {place.formattedAddress && (
            <div className="flex gap-3">
              <MapPin className="size-5 shrink-0 mt-0.5 text-muted-foreground" />
              <span className="text-sm">{place.formattedAddress}</span>
            </div>
          )}

          {place.internationalPhoneNumber && (
            <div className="flex gap-3">
              <Phone className="size-5 shrink-0 text-muted-foreground" />
              <a
                href={`tel:${place.internationalPhoneNumber}`}
                className="text-sm hover:underline"
              >
                {place.internationalPhoneNumber}
              </a>
            </div>
          )}

          {place.websiteUri && (
            <div className="flex gap-3">
              <Globe className="size-5 shrink-0 text-muted-foreground" />
              <a
                href={place.websiteUri}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm hover:underline truncate"
              >
                {place.websiteUri
                  .replace(/^https?:\/\//, "")
                  .replace(/\/$/, "")}
              </a>
            </div>
          )}

          {place.regularOpeningHours?.weekdayDescriptions && (
            <div className="flex gap-3">
              <Clock className="size-5 shrink-0 mt-0.5 text-muted-foreground" />
              <div className="space-y-0.5">
                {place.regularOpeningHours.weekdayDescriptions.map(
                  (line, i) => (
                    <p key={i} className="text-sm">
                      {line}
                    </p>
                  ),
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
