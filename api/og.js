export const config = { runtime: "edge" };

const SITE_NAME = "Rubavu Today";
const SITE_URL = "https://www.rubavutoday.com";
const LOGO_URL = "https://www.rubavutoday.com/Rubavu.jpeg";
const BACKEND_SEARCH =
  "https://rubavu-today-backend.onrender.com/api/posts/slug/";
const BACKEND_BY_ID =
  "https://rubavu-today-backend.onrender.com/api/posts/";

function escapeHtml(value) {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function cleanDescription(value) {
  if (!value) {
    return "";
  }
  return String(value)
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);
}

function getArticleImageUrl(post) {
  const rawImage =
    post.image ||
    post.image_url ||
    post.imageUrl ||
    post.featured_image ||
    post.featuredImage ||
    "";
  const value = String(rawImage || "").trim();
  if (!value) {
    return "";
  }

  let absolute = value;
  if (/^http:\/\//i.test(absolute)) {
    absolute = "https://" + absolute.slice("http://".length);
  } else if (/^https?:\/\//i.test(absolute)) {
    absolute = value;
  } else if (absolute.startsWith("/")) {
    absolute = SITE_URL + absolute;
  } else if (absolute.startsWith("uploads/")) {
    absolute =
      "https://rubavu-today-backend.onrender.com/" + absolute;
  } else if (absolute.startsWith("http")) {
    absolute = absolute.replace(/^http:/i, "https:");
  } else {
    absolute =
      "https://rubavu-today-backend.onrender.com/uploads/" +
      absolute.replace(/^\/+/, "");
  }

  absolute = absolute.replace(/\.html$/i, "");

  if (/^https:\/\/res\.cloudinary\.com\//i.test(absolute)) {
    absolute = absolute.replace(
      /\/image\/upload\/(?!v\d+\/)/i,
      "/image/upload/"
    );
  }

  return absolute;
}

function getImageType(url) {
  if (!url) {
    return "image/jpeg";
  }
  const ext = url.split("?")[0].split(".").pop()?.toLowerCase();
  switch (ext) {
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    case "avif":
      return "image/avif";
    case "jpeg":
    case "jpg":
    default:
      return "image/jpeg";
  }
}

function getPostSlug(post) {
  if (!post) {
    return "";
  }
  if (post.slug && String(post.slug).trim()) {
    return String(post.slug)
      .replace(/\.html$/i, "")
      .trim()
      .replace(/\/+$/, "");
  }
  return slugifyTitle(post.title);
}

function slugifyTitle(value) {
  if (value === undefined || value === null) {
    return "";
  }
  const normalized = String(value)
    .replace(/&/g, " and ")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’'`]/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/[\s_]+/g, " ")
    .trim();

  if (!normalized) {
    return "";
  }

  const slug = normalized
    .split(" ")
    .filter(Boolean)
    .map((word) => word.replace(/^-+|-+$/g, ""))
    .filter(Boolean)
    .join("-");

  return slug.replace(/-+/g, "-").replace(/^-+|-+$/g, "");
}

function getAuthorName(post) {
  if (!post) {
    return "Rubavu Today";
  }
  const author =
    post.Author ||
    post.author ||
    post.author_name ||
    post.user_name ||
    post.username;
  if (author && typeof author === "object") {
    return (
      author.name ||
      author.username ||
      author.full_name ||
      "Rubavu Today"
    );
  }
  return typeof author === "string" && author.trim()
    ? author.trim()
    : "Rubavu Today";
}

function getDate(post, keys) {
  for (const key of keys) {
    const value = post[key];
    if (value) {
      const time = new Date(value).getTime();
      if (!Number.isNaN(time)) {
        return new Date(value).toISOString();
      }
    }
  }
  return "";
}

function buildNotFoundHtml() {
  return `<!DOCTYPE html>
<html lang="rw">
<head>
<meta charset="utf-8" />
<meta name="robots" content="noindex, nofollow" />
<title>Inkuru ntiyabonetse | ${escapeHtml(SITE_NAME)}</title>
<link rel="canonical" href="${SITE_URL}/" />
<meta property="og:type" content="website" />
<meta property="og:title" content="${escapeHtml(SITE_NAME)}" />
<meta property="og:url" content="${SITE_URL}/" />
<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />
</head>
<body>
<p>Inkuru ntiyabonetse.</p>
</body>
</html>`;
}

function buildArticleHtml(post, slug) {
  const title = post.title || SITE_NAME;
  const description =
    cleanDescription(post.description || post.summary || "") ||
    `${title} - ${SITE_NAME}`;
  const image = getArticleImageUrl(post) || LOGO_URL;
  const imageType = getImageType(image);
  const authorName = getAuthorName(post);
  const articleSlug = getPostSlug(post) || slug;
  const canonical = `${SITE_URL}/${articleSlug}.html`;
  const publishedTime = getDate(post, [
    "createdDate",
    "created_at",
    "createdAt",
    "date",
  ]);
  const modifiedTime = getDate(post, [
    "updatedDate",
    "updated_at",
    "updatedAt",
  ]) || publishedTime;

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: title,
    description,
    image: [image],
    url: canonical,
    datePublished: publishedTime,
    dateModified: modifiedTime,
    author: {
      "@type": "Person",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: LOGO_URL,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonical,
    },
  };

  const category = post.category || post.section || "";
  const ogImageType =
    image === LOGO_URL ? "image/jpeg" : imageType;

  return `<!DOCTYPE html>
<html lang="rw">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)} | ${escapeHtml(SITE_NAME)}</title>
<meta name="description" content="${escapeHtml(description)}" />
<meta name="robots" content="index, follow" />
<link rel="canonical" href="${canonical}" />
<link rel="icon" type="image/jpeg" href="${SITE_URL}/favicon.ico" />

<meta property="og:type" content="article" />
<meta property="og:title" content="${escapeHtml(title)}" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:url" content="${canonical}" />
<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />
<meta property="og:image" content="${escapeHtml(image)}" />
<meta property="og:image:secure_url" content="${escapeHtml(image)}" />
<meta property="og:image:type" content="${escapeHtml(ogImageType)}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="${escapeHtml(title)}" />
<meta property="og:locale" content="rw_RW" />
${publishedTime ? `<meta property="article:published_time" content="${publishedTime}" />` : ""}
${modifiedTime ? `<meta property="article:modified_time" content="${modifiedTime}" />` : ""}
<meta property="article:author" content="${escapeHtml(authorName)}" />
${category ? `<meta property="article:section" content="${escapeHtml(category)}" />` : ""}

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(title)}" />
<meta name="twitter:description" content="${escapeHtml(description)}" />
<meta name="twitter:image" content="${escapeHtml(image)}" />
<meta name="twitter:image:alt" content="${escapeHtml(title)}" />
<meta name="twitter:url" content="${canonical}" />

<script type="application/ld+json">${JSON.stringify(articleLd)}</script>
</head>
<body>
<p>Rubavu Today</p>
</body>
</html>`;
}

export default async function handler(request) {
  try {
    const url = new URL(request.url);
    const slug = String(url.searchParams.get("slug") || "")
      .replace(/\.html$/i, "")
      .trim()
      .replace(/\/+$/, "");

    if (!slug) {
      return new Response(buildNotFoundHtml(), {
        status: 404,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    const response = await fetch(
      BACKEND_SEARCH + encodeURIComponent(slug),
      {
        headers: { Accept: "application/json" },
      }
    );

    let post = null;
    if (response.ok) {
      try {
        post = await response.json();
      } catch (error) {
        post = null;
      }
    }

    if (!post || post.error) {
      return new Response(buildNotFoundHtml(), {
        status: 404,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    const html = buildArticleHtml(post, slug);
    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    return new Response(buildNotFoundHtml(), {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
}
