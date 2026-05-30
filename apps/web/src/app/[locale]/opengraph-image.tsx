import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";

import { loadGoogleFont } from "@/lib/og-font";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Tbilisi Food Guide";

/**
 * Default Open Graph image (1200×630) for the localized home and any route under
 * `[locale]` without its own image. Place pages override this with their own
 * `opengraph-image.tsx`.
 */
export default async function Image({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const title = t("title");
  const description = t("description");

  const fontData = await loadGoogleFont(
    "Noto+Sans+Georgian:wght@700",
    `${title}${description}`,
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 32,
          padding: "80px",
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
          color: "#ffffff",
          fontFamily: fontData ? "Noto Sans Georgian" : "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", fontSize: 100 }}>
          📍
        </div>
        <div
          style={{
            fontSize: 84,
            fontWeight: 700,
            lineHeight: 1.05,
            display: "flex",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 36,
            opacity: 0.8,
            lineHeight: 1.3,
            display: "flex",
            maxWidth: 900,
          }}
        >
          {description}
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
