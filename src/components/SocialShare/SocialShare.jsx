import React from "react";

const SITE_URL = "https://rubavutoday.com";
const SITE_NAME = "Rubavu Today";

function getShareUrl(post) {
  if (!post) return window.location.href;
  return post.slug
    ? `${SITE_URL}/${post.slug}.html`
    : `${SITE_URL}/post/${post.id || post._id || ""}`;
}

function stripHtml(html) {
  if (!html) return "";
  return String(html)
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getPostText(post) {
  return (
    stripHtml(post?.description) ||
    stripHtml(post?.content) ||
    stripHtml(post?.summary) ||
    ""
  );
}

function buildShareText(post, url) {
  const title = post?.title || SITE_NAME;
  const text = getPostText(post) || `Soma inkuru yose kuri ${SITE_NAME}.`;
  return `${SITE_NAME} | ${title}\n\n${text}\n\n🌍 ${SITE_URL}\n🔗 ${url}`;
}

export default function SocialShare({ post, compact = false }) {
  const url = getShareUrl(post);
  const title = post?.title || SITE_NAME;
  const imageUrl = post?.image || post?.image_url || post?.imageUrl || "";
  const shareText = buildShareText(post, url);

  const sharePost = async () => {
    const shareData = {
      title,
      text: shareText,
      url,
    };

    if (imageUrl && navigator.canShare && navigator.share) {
      try {
        const response = await fetch(imageUrl);
        const imageBlob = await response.blob();
        const imageFile = new File([imageBlob], "rubavu-today.jpg", {
          type: imageBlob.type || "image/jpeg",
        });

        if (navigator.canShare({ files: [imageFile] })) {
          shareData.files = [imageFile];
        }
      } catch (error) {
        // Share the article link when Cloudinary is unavailable.
      }
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // The visitor may close the share dialog.
      }
      return;
    }

    await navigator.clipboard?.writeText(url);
  };

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title + " — " + SITE_NAME)}`,
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={sharePost}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white transition hover:opacity-80"
          aria-label="Sangiza inkuru n'ifoto"
          title="Sangiza inkuru n'ifoto"
        >
          <span aria-hidden="true">↗</span>
        </button>
        <a
          href={shareLinks.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#1877F2] text-white hover:opacity-80 transition text-xs"
          aria-label="Share on Facebook"
          title="Facebook"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </a>

        <a
          href={shareLinks.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#25D366] text-white hover:opacity-80 transition text-xs"
          aria-label="Share on WhatsApp"
          title="WhatsApp"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>

        <a
          href={shareLinks.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-black text-white hover:opacity-80 transition text-xs"
          aria-label="Share on X"
          title="X (Twitter)"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </a>

      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm font-semibold text-gray-700">Sangiza:</span>

      <button
        type="button"
        onClick={sharePost}
        className="inline-flex items-center gap-1.5 rounded bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700"
        aria-label="Sangiza inkuru n'ifoto"
      >
        <span aria-hidden="true">↗</span>
        Sangiza n'ifoto
      </button>

      <a
        href={shareLinks.facebook}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 bg-[#1877F2] hover:opacity-90 text-white text-xs font-semibold px-3 py-1.5 rounded transition"
      >
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
        Facebook
      </a>

      <a
        href={shareLinks.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 bg-[#25D366] hover:opacity-90 text-white text-xs font-semibold px-3 py-1.5 rounded transition"
      >
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571.227 1.36.195 1.871.118.571-.118 1.073-.173 1.573-.173.399 0 .773.064 1.137.173z" />
        </svg>
        WhatsApp
      </a>

      <a
        href={shareLinks.twitter}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 bg-black hover:bg-gray-800 text-white text-xs font-semibold px-3 py-1.5 rounded transition"
      >
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        X
      </a>

    </div>
  );
}
