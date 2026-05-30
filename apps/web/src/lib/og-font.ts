/**
 * Fetch a TrueType font from Google Fonts for use in `next/og` `ImageResponse`.
 *
 * The app's UI font (Geist) covers Latin only, so Open Graph images that contain
 * Georgian place names need a Georgian-capable face. We pull just the glyphs for
 * the supplied `text` (via the `&text=` subset param) to keep the payload tiny,
 * and send an ancient User-Agent so Google serves TTF instead of WOFF2 (which
 * `ImageResponse` cannot parse).
 *
 * Returns `null` on any failure so callers can render the image without a custom
 * font rather than erroring the whole route (or the build prerender).
 *
 * @param familyQuery Raw `family` query value, e.g. `"Noto+Sans+Georgian:wght@700"`.
 * @param text        Characters that must be present in the subset.
 */
export async function loadGoogleFont(
  familyQuery: string,
  text: string,
): Promise<ArrayBuffer | null> {
  try {
    const url = `https://fonts.googleapis.com/css2?family=${familyQuery}&text=${encodeURIComponent(
      text,
    )}`;
    const css = await (
      await fetch(url, { headers: { "User-Agent": "Mozilla/4.0" } })
    ).text();
    const match = css.match(/src:\s*url\((.+?)\)/);
    if (!match) return null;
    const res = await fetch(match[1]);
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}
