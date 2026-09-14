/* =========================================================
   Cloudinary responsive image helpers
   ---------------------------------------------------------
   All article/ad images are stored on Cloudinary at their ORIGINAL
   resolution. Cloudinary can deliver on-the-fly derivatives, so we
   never ask browsers to download an original 4000px+ photo for a
   small card. We append a minimal transformation chain:

       f_auto  -> deliver AVIF (preferred), WebP, or JPEG/JFIF based
                  on the browser's Accept header (native negotiation)
       q_auto  -> auto-quality tuned per format (no visible loss)
       w_<n>   -> scale down to the largest width actually needed
       c_limit -> never upscale; preserve aspect ratio

   Non-Cloudinary URLs (Unsplash, local /uploads, data:) pass through
   untouched so nothing breaks.
========================================================= */

const CLOUDINARY_UPLOAD_SEGMENT = "/image/upload/";

const CLOUDINARY_HOST_RE = /res\.cloudinary\.com/i;

export const isCloudinaryUrl = (url) =>
  typeof url === "string" &&
  CLOUDINARY_HOST_RE.test(url) &&
  url.includes(CLOUDINARY_UPLOAD_SEGMENT);

const tokenKey = (token) => token.split(/[:_-]/)[0];

const upsertToken = (tokens, token) => {
  const key = tokenKey(token);
  const existing = tokens.findIndex(
    (t) => tokenKey(t) === key
  );

  if (existing !== -1) {
    tokens[existing] = token;
    return;
  }

  tokens.push(token);
};

/* Build an optimized Cloudinary delivery URL for the given width.
   Safe to call on any URL - non-Cloudinary URLs are returned as-is. */
export const getCloudinaryUrl = (
  url,
  { width, format = "f_auto", quality = "q_auto" } = {}
) => {
  if (!url) return url;

  const value = typeof url === "string" ? url : String(url);

  if (!isCloudinaryUrl(value)) return value;

  const segStart = value.indexOf(CLOUDINARY_UPLOAD_SEGMENT);
  const head = value.slice(0, segStart + CLOUDINARY_UPLOAD_SEGMENT.length);
  const rest = value.slice(segStart + CLOUDINARY_UPLOAD_SEGMENT.length);

  /* A stored Cloudinary URL usually looks like:
       <...>/image/upload/[chain/]v<version>/folders/file.ext
     Recover any existing transformation chain so we never corrupt
     uploaded derivations (e.g. face-cropped profile pictures). */
  const versionMatch = rest.match(/^([^/]*\/)?(v\d+\/.*)$/);

  let chain = versionMatch ? (versionMatch[1] ? versionMatch[1].replace(/\/$/, "") : "") : "";
  const tail = versionMatch ? versionMatch[2] : rest;

  const tokens = chain ? chain.split(",").filter(Boolean) : [];

  upsertToken(tokens, format);

  upsertToken(tokens, quality);

  if (width) {
    /* Only force a new width when the stored chain did not already fix
       one (profile avatars ship with w_/h_ baked in at upload time). */
    if (!tokens.some((t) => tokenKey(t) === "w")) {
      upsertToken(tokens, `w_${width}`);
    }
  }

  /* Add limit-crop only when nothing in the chain already controls crop;
     this avoids turning a face-crop or cover crop into a plain limit. */
  if (!tokens.some((t) => tokenKey(t) === "c")) {
    upsertToken(tokens, "c_limit");
  }

  return `${head}${tokens.join(",")}/${tail}`;
};

/* Responsive width sets (px). The browser picks the smallest one that
   fits the current layout using the `sizes` media query + srcset. */
export const RESOLUTION_WIDTHS = {
  THUMB: [160, 240, 320, 480],
  CARD: [320, 480, 640, 800],
  GALLERY: [320, 480, 640, 768, 1024],
  HERO: [400, 640, 768, 1024, 1280],
};

export const DEFAULT_SIZES = "(max-width: 640px) 100vw, 50vw";

export const getResponsiveSrcSet = (
  url,
  widths = RESOLUTION_WIDTHS.CARD
) => {
  if (!isCloudinaryUrl(url)) return null;

  return widths
    .map(
      (width) =>
        `${getCloudinaryUrl(url, { width })} ${width}w`
    )
    .join(", ");
};

/* Convenience: the URL a plain `<img src=...>` fallback should use. */
export const getResponsiveFallbackUrl = (
  url,
  widths = RESOLUTION_WIDTHS.CARD
) => {
  if (!url) return url;
  if (!isCloudinaryUrl(url)) return url;

  return getCloudinaryUrl(url, {
    width: widths[widths.length - 1],
  });
};