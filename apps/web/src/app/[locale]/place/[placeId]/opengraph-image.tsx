import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";

import { fetchPlace } from "@/lib/places";
import { loadGoogleFont } from "@/lib/og-font";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Tbilisi Food Guide";

/**
 * Dynamic Open Graph image for a place detail page (1200×630). Renders the
 * place name, address and rating over the brand gradient. Falls back to a
 * placeholder name when the place can't be loaded so social unfurls never 500.
 */
export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; placeId: string }>;
}) {
  const { locale, placeId } = await params;
  const [place, t] = await Promise.all([
    fetchPlace(placeId).catch(() => null),
    getTranslations({ locale, namespace: "Place" }),
  ]);
  const tm = await getTranslations({ locale, namespace: "Metadata" });

  const siteName = tm("title");
  const name = place?.displayName?.text ?? t("fallbackName");
  const address = place?.formattedAddress ?? "";
  const rating =
    place?.rating !== undefined ? place.rating.toFixed(1) : null;

  const fontData = await loadGoogleFont(
    "Noto+Sans+Georgian:wght@700",
    `${siteName}${name}${address}★${rating ?? ""}`,
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
          color: "#ffffff",
          fontFamily: fontData ? "Noto Sans Georgian" : "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", fontSize: 36 }}>
          <span style={{ fontSize: 44, marginRight: 16 }}>📍</span>
          <span style={{ opacity: 0.85 }}>{siteName}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: name.length > 28 ? 72 : 92,
              fontWeight: 700,
              lineHeight: 1.05,
              display: "flex",
            }}
          >
            {name}
          </div>
          {address && (
            <div style={{ fontSize: 34, opacity: 0.8, display: "flex" }}>
              {address}
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", fontSize: 40 }}>
          {rating ? (
            <span style={{ display: "flex", alignItems: "center" }}>
              <span style={{ color: "#facc15", marginRight: 12 }}>★</span>
              {rating}
            </span>
          ) : (
            <span style={{ opacity: 0.6 }}>Tbilisi · თბილისი</span>
          )}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fontData
        ? [
            {
              name: "Noto Sans Georgian",
              data: fontData,
              style: "normal",
              weight: 700,
            },
          ]
        : [],
    },
  );
}
