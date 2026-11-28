// Responsive photos. Every upload exists in three widths (see backend ImageVariants):
//   /uploads/<name>-480.webp, /uploads/<name>-960.webp and the main /uploads/<name>.webp (long edge ≤ 2000 px).
// Browsers pick the smallest file that is sharp enough for the slot, so a phone grid never downloads 2000 px photos.

const VARIANT_WIDTHS = [480, 960] as const;
const MAIN_WIDTH = 2000;

export interface ResponsiveImage {
  src: string;
  srcSet?: string;
}

export function responsiveImage(src: string): ResponsiveImage {
  // Only uploaded photos have generated sizes; bundled placeholders (/demo/*.svg) are served as-is.
  if (!src.startsWith("/uploads/") || src.endsWith(".svg")) return { src };
  const base = src.replace(/\.[a-z0-9]+$/i, "");
  return {
    src,
    srcSet: [...VARIANT_WIDTHS.map((w) => `${base}-${w}.webp ${w}w`), `${src} ${MAIN_WIDTH}w`].join(", "),
  };
}

/** Smallest generated size, for tiny thumbnails (gallery strip, search suggestions). */
export function thumbnailSrc(src: string): string {
  if (!src.startsWith("/uploads/") || src.endsWith(".svg")) return src;
  return src.replace(/\.[a-z0-9]+$/i, "") + "-480.webp";
}

/**
 * If a size is missing (e.g. a photo uploaded before sizes existed and not yet backfilled), fall back to the main
 * photo, then to the placeholder.
 */
export function handleImageError(e: React.SyntheticEvent<HTMLImageElement>, fallbackSrc: string, placeholder: string) {
  const img = e.currentTarget;
  if (img.srcset) {
    img.removeAttribute("srcset");
    img.src = fallbackSrc;
  } else if (!img.src.endsWith(placeholder)) {
    img.src = placeholder;
  }
}
