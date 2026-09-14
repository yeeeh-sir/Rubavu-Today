import React from "react";
import {
  DEFAULT_SIZES,
  RESOLUTION_WIDTHS,
  getResponsiveFallbackUrl,
  getResponsiveSrcSet,
  isCloudinaryUrl,
} from "../../utils/images";

/* =========================================================
   OptimizedImage
   ---------------------------------------------------------
   Drop-in replacement for <img> that:
     - serves Cloudinary images responsively (srcSet + sizes) with
       automatic AVIF/WebP/JPEG format negotiation via f_auto
     - lazy-loads images below the fold by default
     - eagerly loads important images when `eager`/`priority` is set
     - preserves className, style, alt, onError and all other props
     - passes non-Cloudinary URLs through completely untouched
========================================================= */

const OptimizedImage = ({
  src,
  alt = "",
  widths = RESOLUTION_WIDTHS.CARD,
  sizes,
  loading,
  decoding = "async",
  eager = false,
  priority = false,
  className,
  style,
  onError,
  draggable,
  width,
  height,
  fetchPriority,
  ...rest
}) => {
  const cloudinary = isCloudinaryUrl(src);
  const loadMode =
    loading || (eager || priority ? "eager" : "lazy");

  const srcAttr = !cloudinary
    ? src
    : getResponsiveFallbackUrl(src, widths);

  const srcSetAttr = cloudinary
    ? getResponsiveSrcSet(src, widths)
    : undefined;

  const finalSizes = cloudinary
    ? sizes || DEFAULT_SIZES
    : undefined;

  return (
    <img
      src={srcAttr}
      srcSet={srcSetAttr}
      sizes={finalSizes}
      alt={alt}
      loading={loadMode}
      decoding={decoding}
      fetchPriority={priority ? "high" : fetchPriority}
      className={className}
      style={style}
      onError={onError}
      draggable={draggable}
      width={width}
      height={height}
      {...rest}
    />
  );
};

export default OptimizedImage;