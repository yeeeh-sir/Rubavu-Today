import { next, rewrite } from "@vercel/edge";

export const config = { matcher: ["/:path*"] };

const SITE_URL = "https://www.rubavutoday.com";
const BACKEND_BY_ID =
  "https://rubavu-today-backend.onrender.com/api/posts/";

const CRAWLER_RE =
  /(whatsapp|facebookexternalhit|facebot|messenger|twitterbot|x\/|linkedinbot|telegrambot|slackbot|discordbot|pinterest|redditbot|embedly|quora|viber|skypeuripreview|snapchat|duckduckbot|duckduckgo|googlebot|google-inspectiontool|bingbot|bingpreview|yandex|baiduspider|applebot|feedfetcher|outbrain|addthis|bitlybot|line|naver|daum|prerender|seznambot|ia_archiver|archive\.org|wordpress|iframely|crawler|bot|crawl|spider|curl|wget|python-requests|python-urllib|http-client|node-fetch)/i;

const RESERVED_PATH_RE =
  /^\/(admin|dashboard|employee|chief|chief-editor|profile|login|signin|signup)(\/|$)|\/api\/|\/sitemap\.xml$|\.(json|ico|png|jpe?g|svg|webp|gif|css|js|map|txt|xml|webmanifest|woff2?|ttf)$/i;

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

    if (!isReserved && CRAWLER_RE.test(ua)) {
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
