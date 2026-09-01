import React from "react";

const normalizeImageUrl = (url) => {
  if (!url) return null;

  const value = String(url).trim();

  if (/^https?:\/\//i.test(value)) {
    const https = value.replace(/^http:\/\//i, "https://");

    if (/res\.cloudinary\.com/i.test(https) && https.includes("/upload/")) {
      return https.replace(
        "/upload/",
        "/upload/f_auto,q_auto:best,w_1600,c_limit/"
      );
    }

    return https;
  }

  return value;
};

const getVideoEmbed = (url) => {
  if (!url) return null;

  let videoId = "";

  if (url.includes("youtu.be/")) {
    videoId = url.split("youtu.be/")[1]?.split("?")[0];
  } else if (url.includes("watch?v=")) {
    videoId = url.split("watch?v=")[1]?.split("&")[0];
  } else if (url.includes("/embed/")) {
    videoId = url.split("/embed/")[1]?.split("?")[0];
  }

  return videoId
    ? `https://www.youtube.com/embed/${videoId}`
    : null;
};

const positionClasses = {
  full: "mt-10 mb-2 w-full",
  center: "mt-10 mb-2 mx-auto max-w-[720px]",
  inline: "mt-10 mb-2 mx-auto w-[88%] max-w-[560px]",
  left: "mt-6 mb-6 md:float-left md:mr-6 md:w-[42%]",
  right: "mt-6 mb-6 md:float-right md:ml-6 md:w-[42%]",
  gallery: "mt-8 mb-2",
};

const clearClassAfterFloat = (prevFloated) =>
  prevFloated ? "clear-both md:clear-both" : "";

const GalleryFigure = ({ block, onImageDownload }) => {
  const src = normalizeImageUrl(block.url);

  if (!src) return null;

  return (
    <figure className="min-w-0 flex-1 basis-[45%] md:basis-[30%]">
      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <img
          src={src}
          alt={block.alt || "Rubavu Today article photo"}
          loading="lazy"
          decoding="async"
          className="block aspect-[4/3] h-auto w-full object-cover"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "";
          }}
        />
      </div>
      {block.caption && (
        <figcaption className="mt-1.5 text-center font-body text-[11px] leading-snug text-slate-500">
          {block.caption}
        </figcaption>
      )}
      {onImageDownload && (
        <button
          type="button"
          onClick={() => onImageDownload(block.url)}
          className="mt-1 font-body text-[10px] font-semibold text-slate-400 transition hover:text-red-600"
        >
          Download
        </button>
      )}
    </figure>
  );
};

const ImageFigure = ({ block, onImageDownload }) => {
  if (block.position === "gallery") return null;

  const src = normalizeImageUrl(block.url);

  if (!src) return null;

  return (
    <figure
      className={`${positionClasses[block.position] || positionClasses.center} max-w-full`}
    >
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <img
          src={src}
          alt={block.alt || "Rubavu Today article photo"}
          loading="lazy"
          decoding="async"
          width="1200"
          height="675"
          className="block h-auto w-full select-none object-contain"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "";
          }}
        />
        <div className="absolute bottom-3 left-3 rounded bg-black/75 px-2 py-1 font-body text-[10px] font-semibold text-white">
          © Rubavu Today
        </div>
      </div>
      {block.caption && (
        <figcaption className="mt-2 text-center font-body text-xs leading-snug text-slate-500">
          {block.caption}
        </figcaption>
      )}
      {onImageDownload && (
        <button
          type="button"
          onClick={() => onImageDownload(block.url)}
          className="mt-1.5 font-body text-[10px] font-semibold text-slate-400 transition hover:text-red-600"
        >
          Download
        </button>
      )}
    </figure>
  );
};

const ArticleRenderer = ({
  blocks = [],
  post = null,
  hero = null,
  heroUrl = null,
  onImageDownload = null,
  showHero = true,
}) => {
  const heroSource = normalizeImageUrl(hero || post?.image || post?.featured_image || null);
  const heroUrlSource = normalizeImageUrl(heroUrl || heroSource);

  const elements = [];
  let prevFloated = false;

  blocks.forEach((block, index) => {
    if (!block || typeof block !== "object") {
      return;
    }

    const type = block.type;

    if (type === "image" && block.position === "header") {
      const blockSource = normalizeImageUrl(block.url);

      if (heroUrlSource && blockSource === heroUrlSource) {
        return;
      }

      prevFloated = false;

      return elements.push(
        <ImageFigure
          key={`image-${index}`}
          block={{ ...block, position: "full" }}
          onImageDownload={onImageDownload}
        />
      );
    }

    if (type === "image" && block.position === "gallery") {
      const run = [];
      let i = index;

      while (
        i < blocks.length &&
        blocks[i] &&
        blocks[i].type === "image" &&
        blocks[i].position === "gallery"
      ) {
        run.push(blocks[i]);
        i += 1;
      }

      elements.push(
        <div
          key={`gallery-${index}`}
          className="my-10 clear-both md:clear-both"
        >
          <div className="flex flex-wrap items-start justify-center gap-4">
            {run.map((gImage, gIndex) => (
              <GalleryFigure
                key={`g-${gIndex}-${gImage.alt || ""}`}
                block={gImage}
                onImageDownload={onImageDownload}
              />
            ))}
          </div>
        </div>
      );
      return;
    }

    if (type === "image") {
      const isFloat = block.position === "left" || block.position === "right";
      prevFloated = isFloat;

      return elements.push(
        <ImageFigure
          key={`image-${index}`}
          block={block}
          onImageDownload={onImageDownload}
        />
      );
    }

    const clearClass = clearClassAfterFloat(prevFloated);
    prevFloated = false;

    if (type === "paragraph") {
      return elements.push(
        <p key={`p-${index}`} className={`${clearClass} mb-5`}>
          {block.text}
        </p>
      );
    }

    if (type === "heading") {
      return elements.push(
        <h2
          key={`h-${index}`}
          className={`font-post-title text-xl font-black leading-snug text-slate-950 sm:text-2xl ${clearClass} mt-9 mb-3`}
        >
          {block.text}
        </h2>
      );
    }

    if (type === "quote") {
      return elements.push(
        <blockquote
          key={`q-${index}`}
          className={`my-8 border-l-4 border-red-600 pl-5 text-lg font-medium italic leading-relaxed text-slate-700 ${clearClass}`}
        >
          {block.text}
        </blockquote>
      );
    }

    if (type === "divider") {
      return elements.push(
        <div
          key={`d-${index}`}
          className="my-10 clear-both md:clear-both"
        >
          <div className="mx-auto h-px max-w-[420px] bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
        </div>
      );
    }

    if (type === "video") {
      const embed = getVideoEmbed(block.url);

      if (!embed) {
        return null;
      }

      return elements.push(
        <div
          key={`v-${index}`}
          className="my-10 clear-both md:clear-both"
        >
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-sm">
            <iframe
              src={embed}
              title={post?.title || "Embedded video"}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      );
    }

    return null;
  });

  return (
    <div className="rt-article-content text-base leading-[1.8] text-slate-800 sm:text-[17px]">
      {showHero && heroSource && (
        <figure className="mt-7">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <img
              src={heroSource}
              alt={post?.title || "Rubavu Today article image"}
              decoding="async"
              width="1200"
              height="675"
              className="block h-auto w-full select-none object-contain"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "";
              }}
            />
            <div className="absolute bottom-3 left-3 rounded bg-black/75 px-2 py-1 font-body text-[10px] font-semibold text-white">
              © Rubavu Today
            </div>
          </div>
          {onImageDownload && (
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={() => onImageDownload(heroSource)}
                className="print:hidden font-body text-[10px] font-semibold text-slate-400 transition hover:text-red-600"
              >
                Download
              </button>
            </div>
          )}
        </figure>
      )}

      <div className="mt-8">{elements}</div>
    </div>
  );
};

export default ArticleRenderer;