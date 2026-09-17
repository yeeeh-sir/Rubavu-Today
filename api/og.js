export const config = { runtime: "edge" };

const SITE_NAME = "Rubavu Today";
const SITE_URL = "https://www.rubavutoday.com";
const LOGO_URL = "https://www.rubavutoday.com/Rubavu.jpeg";
const BACKEND_SEARCH =
  "https://rubavu-today-backend.onrender.com/api/posts/slug/";
const BACKEND_BY_ID =
  "https://rubavu-today-backend.onrender.com/api/posts/";
const BACKEND_FEED =
  "https://rubavu-today-backend.onrender.com/api/posts";

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

function formatDisplayDate(value) {
  if (!value) {
    return "";
  }
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) {
    return "";
  }
  return new Date(value).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function parseContentBlocks(post) {
  let blocks = [];
  const value = post?.content_blocks;
  if (Array.isArray(value)) {
    blocks = value;
  } else if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      blocks = Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      blocks = [];
    }
  }
  return blocks;
}

function getContentSections(post) {
  const sections = [];

  for (const block of parseContentBlocks(post)) {
    if (!block) continue;
    const type = String(block.type || "").toLowerCase();

    if (type === "paragraph" || type === "text") {
      const text = String(block.text || "").trim();
      if (text) {
        sections.push({ type: "p", text });
      }
    } else if (type === "heading" || type === "subtitle") {
      const text = String(block.text || "").trim();
      if (text) {
        sections.push({ type: "h2", text });
      }
    } else if (type === "image") {
      const raw = String(block.url || "").trim();
      if (raw) {
        sections.push({
          type: "img",
          url: getArticleImageUrl({ image: raw }),
          alt: String(block.alt || block.caption || "").trim(),
        });
      }
    } else if (type === "video") {
      const raw = String(block.url || "").trim();
      if (raw) {
        sections.push({ type: "video", url: raw });
      }
    }
  }

  const hasParagraphs = sections.some((s) => s.type === "p");

  if (!hasParagraphs) {
    const fallback = String(post?.description || "")
      .split(/\n{2,}/)
      .map((part) => part.replace(/\s+/g, " ").trim())
      .filter(Boolean)
      .map((text) => ({ type: "p", text }));

    sections.unshift(...fallback);
  }

  return sections;
}

function getPostId(post) {
  return String(post?.id ?? post?._id ?? "");
}

function buildNavigationContext(post, feed) {
  const currentId = getPostId(post);

  const posts = (Array.isArray(feed) ? feed : [])
    .map((p) => ({ ...p, _slug: getPostSlug(p) }))
    .filter((p) => p._slug)
    .sort(
      (a, b) =>
        new Date(b.createdDate || b.created_at || b.createdAt || 0) -
        new Date(a.createdDate || a.created_at || a.createdAt || 0)
    );

  let currentIndex = -1;
  for (let i = 0; i < posts.length; i += 1) {
    if (getPostId(posts[i]) === currentId) {
      currentIndex = i;
      break;
    }
  }

  const olderPost =
    currentIndex >= 0 && currentIndex + 1 < posts.length
      ? posts[currentIndex + 1]
      : null;
  const newerPost = currentIndex > 0 ? posts[currentIndex - 1] : null;

  const currentCategory = String(post?.category || "").toLowerCase();
  const sameCategory = posts.filter(
    (p) => String(p.category || "").toLowerCase() === currentCategory
  );
  const relatedPool = sameCategory.length >= 2 ? sameCategory : posts;

  const usedIds = new Set([currentId]);
  if (olderPost) usedIds.add(getPostId(olderPost));
  if (newerPost) usedIds.add(getPostId(newerPost));

  const related = relatedPool
    .filter((p) => !usedIds.has(getPostId(p)))
    .slice(0, 3);

  return { olderPost, newerPost, related };
}

function articleHref(post) {
  const slug = getPostSlug(post);
  return slug ? `${SITE_URL}/${encodeURIComponent(slug)}.html` : SITE_URL;
}

function buildNavigationHtml(ctx) {
  const items = [];

  if (ctx?.newerPost) {
    items.push({
      href: articleHref(ctx.newerPost),
      label: "Ikurikira: " + (ctx.newerPost.title || "Next story"),
    });
  }

  if (ctx?.olderPost) {
    items.push({
      href: articleHref(ctx.olderPost),
      label: "Ibanje: " + (ctx.olderPost.title || "Previous story"),
    });
  }

  for (const p of ctx?.related || []) {
    items.push({ href: articleHref(p), label: p.title || "Related story" });
  }

  if (!items.length) {
    return `<p class="site-home"><a href="${SITE_URL}/">${escapeHtml(
      SITE_NAME
    )} – Home</a></p>`;
  }

  return `<nav class="related" aria-label="Related stories">
<h2>Izindi nkuru</h2>
<ul>
  ${items
    .map(
      (item) =>
        `<li><a href="${item.href}">${escapeHtml(item.label)}</a></li>`
    )
    .join("\n  ")}
</ul>
<p class="site-home"><a href="${SITE_URL}/">${escapeHtml(
    SITE_NAME
  )} – Home</a></p>
</nav>`;
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

function buildArticleHtml(post, slug, feed) {
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
  const category = post.category || post.section || "";
  const displayDate = formatDisplayDate(publishedTime);

  const metaParts = [authorName];
  if (category) metaParts.push(category);
  if (displayDate) metaParts.push(displayDate);
  const metaLine = metaParts.join(" · ");

  const sections = getContentSections(post);
  const nav = buildNavigationContext(post, feed);
  const navHtml = buildNavigationHtml(nav);

  const contentHtml = sections
    .map((section) => {
      if (section.type === "p") {
        return `<p>${escapeHtml(section.text)}</p>`;
      }
      if (section.type === "h2") {
        return `<h2>${escapeHtml(section.text)}</h2>`;
      }
      if (section.type === "img") {
        const alt = escapeHtml(section.alt || `${title} photo`);
        return `<figure class="article-image"><img src="${escapeHtml(
          section.url
        )}" alt="${alt}" loading="lazy" width="1200" height="675" /></figure>`;
      }
      if (section.type === "video") {
        return `<p class="article-link">Video: <a href="${escapeHtml(
          section.url
        )}" rel="noopener">${escapeHtml(title)}</a></p>`;
      }
      return "";
    })
    .join("\n");

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

  const ogImageType = image === LOGO_URL ? "image/jpeg" : imageType;

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

<style>
  body { font-family: Georgia, 'Times New Roman', serif; color: #1e293b; margin: 0; padding: 24px; line-height: 1.7; }
  article { max-width: 720px; margin: 0 auto; }
  h1 { font-size: 1.7rem; line-height: 1.25; color: #0f172a; }
  .meta { color: #64748b; font-size: 0.9rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; }
  .content p { margin: 0 0 1.25rem; }
  .article-image { margin: 1.5rem 0; }
  .article-image img { max-width: 100%; height: auto; border-radius: 8px; }
  .related { margin-top: 2.5rem; border-top: 2px solid #0f172a; padding-top: 1rem; }
</style>
</head>
<body>
<article>
  <h1>${escapeHtml(title)}</h1>
  <p class="meta">${escapeHtml(metaLine)}</p>
  <figure class="article-image">
    <img src="${escapeHtml(image)}" alt="${escapeHtml(title)}" width="1200" height="675" />
  </figure>
  <div class="content">
${contentHtml}
  </div>
  ${navHtml}
</article>
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

    const feedFetch = Promise.race([
      fetch(BACKEND_FEED, {
        headers: { Accept: "application/json" },
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("feed timeout")), 2500)
      ),
    ]);

    const results = await Promise.allSettled([
      fetch(BACKEND_SEARCH + encodeURIComponent(slug), {
        headers: { Accept: "application/json" },
      }),
      feedFetch,
    ]);

    let post = null;
    let feed = [];

    if (results[0].status === "fulfilled" && results[0].value.ok) {
      try {
        post = await results[0].value.json();
      } catch (error) {
        post = null;
      }
    }

    if (results[1].status === "fulfilled" && results[1].value.ok) {
      try {
        const data = await results[1].value.json();
        feed = Array.isArray(data) ? data : [];
      } catch (error) {
        feed = [];
      }
    }

    if (!post || post.error) {
      return new Response(buildNotFoundHtml(), {
        status: 404,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    const html = buildArticleHtml(post, slug, feed);
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