import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Phone, Globe, Clock, Star } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { auth } from "@/auth";
import { isFavorited } from "@/lib/api";
import { fetchPlace, PRICE_SYMBOLS, type PlaceDetail } from "@/lib/places";
import { localeAlternates } from "@/lib/seo";
import { siteUrl } from "@/lib/site";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { FavoriteButton } from "@/components/favorite-button";
import { PhotoCarousel } from "@/components/photo-carousel";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; placeId: string }>;
}): Promise<Metadata> {
  const { locale, placeId } = await params;
  const place = await fetchPlace(placeId);
  const t = await getTranslations({ locale, namespace: "Place" });

  if (!place) {
    return { title: t("fallbackName") };
  }

  const name = place.displayName?.text ?? t("fallbackName");
  const description = place.formattedAddress
    ? `${name} · ${place.formattedAddress}`
    : t("metaDescription", { name });
  const path = `/place/${placeId}`;
  const url = `/${locale}${path}`;

  return {
    title: name,
    description,
    alternates: {
      canonical: url,
      languages: localeAlternates(path),
    },
    // `images` is supplied automatically from the colocated `opengraph-image.tsx`.
    openGraph: { type: "website", title: name, description, url },
    twitter: { card: "summary_large_image", title: name, description },
  };
}

/**
 * schema.org `Restaurant` JSON-LD for rich results. Only fields the Places API
 * actually returned are included, so the markup never advertises empty data.
 */
function restaurantJsonLd(
  place: PlaceDetail,
  name: string,
  canonical: string,
  priceLabel: string | null,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name,
    url: canonical,
    ...(place.formattedAddress && {
      address: {
        "@type": "PostalAddress",
        streetAddress: place.formattedAddress,
        addressLocality: "Tbilisi",
        addressCountry: "GE",
      },
    }),
    ...(place.internationalPhoneNumber && {
      telephone: place.internationalPhoneNumber,
    }),
    ...(place.websiteUri && { sameAs: place.websiteUri }),
    ...(place.photos.length > 0 && { image: place.photos.slice(0, 3) }),
    ...(priceLabel && { priceRange: priceLabel }),
    ...(place.rating !== undefined && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: place.rating,
        ...(place.userRatingCount !== undefined && {
          reviewCount: place.userRatingCount,
        }),
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };
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

  const jsonLd = restaurantJsonLd(
    place,
    name,
    `${siteUrl()}/${locale}/place/${placeId}`,
    priceLabel,
  );

  return (
    <div className="flex flex-col min-h-screen">
      <script
        type="application/ld+json"
        // Structured data, but place names come from the Places API — escape `<`
        // so a malicious name can't break out of the <script> with `</script>`.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
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
