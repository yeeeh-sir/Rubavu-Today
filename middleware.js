import { next, rewrite } from "@vercel/edge";

export const config = { matcher: ["/:path*"] };

const SITE_URL = "https://www.rubavutoday.com";
const BACKEND_BY_ID =
  "https://rubavu-today-backend.onrender.com/api/posts/";

const CRAWLER_RE =
  /(whatsapp|facebookexternalhit|facebot|messenger|twitterbot|x\/|linkedinbot|telegrambot|slackbot|discordbot|pinterest|redditbot|embedly|quora|viber|skypeuripreview|snapchat|duckduckbot|duckduckgo|googlebot|google-inspectiontool|bingbot|bingpreview|yandex|baiduspider|applebot|feedfetcher|outbrain|addthis|bitlybot|line|naver|daum|prerender|seznambot|ia_archiver|archive\.org|wordpress|iframely|crawler|bot|crawl|spider|curl|wget|python-requests|python-urllib|http-client|node-fetch)/i;

const RESERVED_PATH_RE =
  /^\/(admin|dashboard|employee|chief|chief-editor|profile|login|signin|signup)(\/|$)|\/api\/|\/sitemap\.xml$|\.(json|ico|png|jpe?g|svg|webp|gif|css|js|map|txt|xml|webmanifest|woff2?|ttf)$/i;

const PUBLIC_ROUTE_RE =
  /^\/(about|contact|privacy-policy|terms|media|radio)(\/|$)/i;
const RADIO_ROUTE_RE = /^\/radio\/?$/i;
const RADIO_TITLE = "RubavuToday Radio";
const RADIO_DESCRIPTION =
  "Amakuru, ibiganiro, imyidagaduro, umuziki n'izindi porogaramu zo muri Rubavu.";
const RADIO_IMAGE = `${SITE_URL}/Rubavu-Today-Radio.png`;

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function radioPreviewResponse() {
  const title = escapeHtml(RADIO_TITLE);
  const description = escapeHtml(RADIO_DESCRIPTION);
  const canonical = `${SITE_URL}/radio`;
  const image = escapeHtml(RADIO_IMAGE);
  const html = `<!doctype html>
<html lang="rw"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title><meta name="description" content="${description}"><link rel="canonical" href="${canonical}">
<meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:image" content="${image}"><meta property="og:image:url" content="${image}"><meta property="og:image:secure_url" content="${image}"><meta property="og:image:type" content="image/png"><meta property="og:image:alt" content="${title}"><meta property="og:url" content="${canonical}"><meta property="og:type" content="website"><meta property="og:site_name" content="Rubavu Today"><meta property="og:locale" content="rw_RW">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${title}"><meta name="twitter:description" content="${description}"><meta name="twitter:image" content="${image}"><meta name="twitter:image:src" content="${image}"><meta name="twitter:image:alt" content="${title}"><meta name="twitter:url" content="${canonical}">
</head><body><h1>${title}</h1><p>${description}</p><img src="${image}" alt="${title}"></body></html>`;
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=600",
      Vary: "User-Agent",
    },
  });
}

function cleanSlug(value) {
  return String(value || "")
    .replace(/\.html$/i, "")
    .trim()
    .replace(/\/+$/, "");
}

function getPostSlug(post) {
  if (!post) {
    return "";
  }
  if (post.slug && String(post.slug).trim()) {
    return cleanSlug(post.slug);
  }
  return "";
}

async function getSlugById(id) {
  try {
    const res = await fetch(BACKEND_BY_ID + encodeURIComponent(id), {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return getPostSlug(json) || null;
  } catch (error) {
    return null;
  }
}

export default async function middleware(request) {
  try {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const ua = request.headers.get("user-agent") || "";

    const isReserved = RESERVED_PATH_RE.test(pathname);

    if (!isReserved) {
      const legacyMatch = pathname.match(/^\/post\/(\d+)\/?$/);
      if (legacyMatch) {
        const id = legacyMatch[1];
        const slug = await getSlugById(id);
        if (slug) {
          const target = `${SITE_URL}/${encodeURIComponent(slug)}.html`;
          return new Response(null, {
            status: 308,
            headers: { Location: target },
          });
        }
        return next();
      }
    }

    if (RADIO_ROUTE_RE.test(pathname) && CRAWLER_RE.test(ua)) {
      if (request.method === "GET") return radioPreviewResponse();
    }

    if (!isReserved && !PUBLIC_ROUTE_RE.test(pathname) && CRAWLER_RE.test(ua)) {
      const segments = pathname.split("/").filter(Boolean);
      const isSingleSegment = segments.length === 1;
      const looksLikeSlug =
        isSingleSegment && /^[^\/\s]+$/.test(pathname.slice(1));

      if (looksLikeSlug) {
        const slug = cleanSlug(segments[0]);
        if (slug) {
          return rewrite(
            new URL(`/api/og?slug=${encodeURIComponent(slug)}`, request.url)
          );
        }
      }
    }

    return next();
  } catch (error) {
    return next();
  }
}
