





import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import logo from "../../Rubavu.jpeg";

import {
  getAdvertisements,
  getPosts,
} from "../../services/api";

import SearchBar from "../SearchBar/SearchBar";
import { Loader2, Pause, Play, Radio as RadioIcon, Volume2, VolumeX } from "lucide-react";
import { useRadio } from "../../context/RadioContext";
import AdBanner from "../common/AdBanner";
import OptimizedImage from "../common/OptimizedImage";
import { getArticleUrl } from "../../utils/slug";
import { formatRelativeTime } from "../../utils/time";
import { useLanguage, translateCategory } from "../../context/LanguageContext";
import { RESOLUTION_WIDTHS, getCloudinaryUrl, isCloudinaryUrl } from "../../utils/images";





export const DEPARTMENTS = [
  {
    name: "Amakuru",
    label: "Amakuru",
    icon: "ðŸ“°",
  },
  {
    name: "Ubukungu",
    label: "Ubukungu",
    icon: "ðŸ’¼",
  },
  {
    name: "Imikino",
    label: "Imikino",
    icon: "âš½",
  },
  {
    name: "Imyidagaduro",
    label: "Imyidagaduro",
    icon: "ðŸŽ­",
  },
  {
    name: "Uburezi",
    label: "Uburezi",
    icon: "ðŸŽ“",
  },
];

const normalizeDepartment = (value) => {
  const category = String(value || "").trim().toLowerCase();
  const aliases = {
    news: "Amakuru",
    amakuru: "Amakuru",
    economy: "Ubukungu",
    business: "Ubukungu",
    ubukungu: "Ubukungu",
    sports: "Imikino",
    sport: "Imikino",
    imikino: "Imikino",
    entertainment: "Imyidagaduro",
    imyidagaduro: "Imyidagaduro",
    education: "Uburezi",
    uburezi: "Uburezi",
  };

  if (aliases[category]) return aliases[category];

  return DEPARTMENTS.find(
    (department) => department.name.toLowerCase() === category
  )?.name || String(value || "").trim();
};





const getPostId = (post, index = 0) =>
  post?._id ||
  post?.id ||
  `post-${index}`;

const getPostDate = (post) =>
  post?.createdDate ||
  post?.created_at ||
  post?.createdAt ||
  post?.date ||
  0;

const getTime = (post) => {
  const date = new Date(getPostDate(post));
  const time = date.getTime();

  return Number.isNaN(time) ? 0 : time;
};

export const MAX_MIXED_POSTS = 15;

export const buildMixedPosts = (posts = []) => {
  if (!posts.length) {
    return [];
  }

  const newest = [...posts].sort((a, b) => getTime(b) - getTime(a));
  const oldest = [...posts].sort((a, b) => getTime(a) - getTime(b));

  const result = [];
  const used = new Set();

  let newestIndex = 0;
  let oldestIndex = 0;

  while (
    result.length < MAX_MIXED_POSTS &&
    (newestIndex < newest.length || oldestIndex < oldest.length)
  ) {
    if (newestIndex < newest.length && result.length < MAX_MIXED_POSTS) {
      const post = newest[newestIndex];
      const id = getPostId(post, newestIndex);
      newestIndex += 1;

      if (!used.has(id)) {
        result.push(post);
        used.add(id);
      }
    }

    if (oldestIndex < oldest.length && result.length < MAX_MIXED_POSTS) {
      const post = oldest[oldestIndex];
      const id = getPostId(post, oldestIndex);
      oldestIndex += 1;

      if (!used.has(id)) {
        result.push(post);
        used.add(id);
      }
    }
  }

  return result.slice(0, MAX_MIXED_POSTS);
};

export const buildNaturalPostOrder = (posts = []) => {
  const newest = [...posts].sort((a, b) => getTime(b) - getTime(a));
  const oldest = [...posts].sort((a, b) => getTime(a) - getTime(b));
  const result = [];
  const used = new Set();
  let newestIndex = 0;
  let oldestIndex = 0;
  let recentCount = 0;
  const getStablePostKey = (post, index) =>
    post?._id ||
    post?.id ||
    `${post?.title || "post"}-${getPostDate(post) || index}`;

  const addNext = (source, index) => {
    const post = source[index];
    if (!post) return false;

    const id = getStablePostKey(post, index);
    if (used.has(id)) return false;

    used.add(id);
    result.push(post);
    return true;
  };

  while (newestIndex < newest.length || oldestIndex < oldest.length) {
    if (recentCount < 2 && newestIndex < newest.length) {
      if (addNext(newest, newestIndex)) recentCount += 1;
      newestIndex += 1;
      continue;
    }

    if (oldestIndex < oldest.length) {
      addNext(oldest, oldestIndex);
      oldestIndex += 1;
      recentCount = 0;
      continue;
    }

    if (newestIndex < newest.length) {
      addNext(newest, newestIndex);
      newestIndex += 1;
    }
  }

  return result;
};

const preloadAdImages = (ads = []) => {
  if (
    typeof window === "undefined" ||
    typeof Image === "undefined"
  ) {
    return;
  }

  ads.forEach((ad) => {
    if (
      ad &&
      typeof ad.image === "string" &&
      ad.image.trim() !== ""
    ) {
      const image = new Image();

      image.decoding = "async";

      /* Warm the cache with the optimized derivative that the rendered
         banner will actually use - never the full-size original. */
      image.src = isCloudinaryUrl(ad.image)
        ? getCloudinaryUrl(ad.image, { width: 1280 })
        : ad.image;
    }
  });
};

const normalizeAdTargetUrl = (ad) => {
  if (!ad) {
    return "";
  }

  const candidates = [
    ad.target_url,
    ad.link,
    ad.url,
    ad.href,
  ];

  for (const candidate of candidates) {
    const value = String(candidate || "").trim();

    if (!value || value.toLowerCase() === "null" || value === "#") {
      continue;
    }

    return value;
  }

  return "";
};

const prefersReducedMotion = () => {
  if (typeof window === "undefined" || !window.matchMedia) {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

const isAdCurrentlyActive = (ad) => {
  if (!ad) {
    return false;
  }

  const statusActive =
    !ad.status || String(ad.status).toLowerCase() === "active";

  if (!statusActive) {
    return false;
  }

  const today = new Date().toISOString().slice(0, 10);
  const startsInFuture = ad.start_date && String(ad.start_date).slice(0, 10) > today;
  const hasEnded = ad.end_date && String(ad.end_date).slice(0, 10) < today;

  return !startsInFuture && !hasEnded;
};





const AdCarousel = ({ ads = [] }) => {
  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [failedImages, setFailedImages] =
    useState(() => new Set());

  const validAds = useMemo(() => {
    return ads.filter((ad) => {
      return (
        isAdCurrentlyActive(ad) &&
        typeof ad.image === "string" &&
        ad.image.trim() !== ""
      );
    });
  }, [ads]);

  useEffect(() => {
    preloadAdImages(validAds);
  }, [validAds]);

  useEffect(() => {
    if (
      validAds.length === 0 ||
      currentIndex >= validAds.length
    ) {
      setCurrentIndex(0);
    }
  }, [validAds.length, currentIndex]);

  const visibleAds = useMemo(() => {
    return validAds.filter((ad) => {
      const key =
        ad.id ||
        ad._id ||
        ad.image;

      return !failedImages.has(key);
    });
  }, [validAds, failedImages]);

  useEffect(() => {
    if (
      visibleAds.length > 0 &&
      currentIndex >= visibleAds.length
    ) {
      setCurrentIndex(0);
    }
  }, [visibleAds.length, currentIndex]);

  if (!visibleAds.length) {
    return null;
  }

  const safeIndex =
    currentIndex >= visibleAds.length
      ? 0
      : currentIndex;

  const handleImageError = (ad) => {
    const key =
      ad.id ||
      ad._id ||
      ad.image;

    setFailedImages((previous) => {
      const next = new Set(previous);

      next.add(key);

      return next;
    });
  };

  const renderAd = (ad, index) => {
    if (!ad) {
      return null;
    }

    const key = ad.id || ad._id || `advertisement-${index}`;
    const targetUrl = normalizeAdTargetUrl(ad);
    const title = ad.title || ad.name || "Rubavu Today";
    const reducedMotion = prefersReducedMotion();

    const content = (
      <div className="relative w-full overflow-hidden rounded-none border border-slate-200 bg-slate-100 aspect-[728/60]">
        <OptimizedImage
          src={ad.image}
          alt={title}
          widths={RESOLUTION_WIDTHS.HERO}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1100px"
          loading="eager"
          priority={index === safeIndex}
          decoding="async"
          draggable="false"
          onError={() => handleImageError(ad)}
          className="absolute inset-0 h-full w-full select-none object-cover"
          style={{
            transform: reducedMotion ? "none" : "scale(1.04)",
            animation: reducedMotion ? "none" : "ad-pan 16s ease-in-out infinite alternate",
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/30 via-slate-900/10 to-slate-900/10" />
      </div>
    );

    return targetUrl ? (
      <a
        key={key}
        href={targetUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={title}
        className="block w-full transition-opacity duration-500"
      >
        {content}
      </a>
    ) : (
      <div key={key} className="w-full transition-opacity duration-500">
        {content}
      </div>
    );
  };

  return (
    <>
      <style>{`\n        @keyframes ad-pan {\n          0% { transform: scale(1.04) translateX(0); }\n          50% { transform: scale(1.08) translateX(-1.5%); }\n          100% { transform: scale(1.12) translateX(1.5%); }\n        }\n\n        @keyframes ad-slide-in {\n          0% { opacity: 0; transform: translateX(-16px); }\n          100% { opacity: 1; transform: translateX(0); }\n        }\n\n        @keyframes ad-fade-up {\n          0% { opacity: 0; transform: translateY(10px); }\n          100% { opacity: 1; transform: translateY(0); }\n        }\n\n        @keyframes ad-cta {\n          0% { opacity: 0; transform: scale(0.96); }\n          60% { opacity: 1; transform: scale(1.04); }\n          100% { opacity: 1; transform: scale(1); }\n        }\n      `}</style>

      <section
        aria-label="Advertisement"
        dir="ltr"
        className="relative w-full bg-white border-b-0 shadow-none mt-0 pt-0"
      >
        <div className="relative w-full overflow-hidden">
          {renderAd(visibleAds[0], 0)}
        </div>
      </section>
    </>
  );
};

const SocialLinks = ({ compact = false }) => {
  const socials = [
    {
      name: "Instagram",
      href: "https://www.instagram.com/rubavutoday/",
      color: "text-[#E1306C]",
      icon: (
        <svg
          className="h-4 w-4 fill-current"
          viewBox="0 0 24 24"
        >
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
    {
      name: "TikTok",
      href: "https://www.tiktok.com/@papainnocento",
      color: "text-white",
      icon: (
        <svg
          className="h-4 w-4 fill-current"
          viewBox="0 0 24 24"
        >
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
        </svg>
      ),
    },
    {
      name: "WhatsApp",
      href: "https://wa.me/250788945200",
      color: "text-[#25D366]",
      icon: (
        <svg
          className="h-4 w-4 fill-current"
          viewBox="0 0 24 24"
        >
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
      ),
    },
    {
      name: "YouTube",
      href: "https://www.youtube.com/@ABAMUSIC-c3l",
      color: "text-[#FF0000]",
      icon: (
        <svg
          className="h-4 w-4 fill-current"
          viewBox="0 0 24 24"
        >
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
  ];

  return (
    <div
      className={`flex items-center [&_svg]:h-5 [&_svg]:w-5 ${compact
        ? "gap-2"
        : "gap-2 sm:gap-3"
        }`}
    >
      {socials.map((social) => (
        <a
          key={social.name}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={social.name}
          className={`
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            border
            border-slate-700
            bg-slate-800
            ${social.color}
            transition
            hover:scale-110
            hover:bg-slate-700
          `}
        >
          {social.icon}
        </a>
      ))}
    </div>
  );
};





const SearchIcon = () => (
  <svg
    className="h-5 w-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-4-4" />
  </svg>
);





const PORTAL_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=900&q=80";

const NewsSectionHeading = ({ title }) => (
  <div className="mb-4">
    <h2 className="font-post-title text-lg font-black uppercase tracking-tight text-slate-950 sm:text-xl">
      {title}
    </h2>
  </div>
);

const TimeText = ({ date, className = "" }) => {
  const { language, t } = useLanguage();

  const text = formatRelativeTime(date, language, t);

  if (!text) return null;

  return (
    <time className={className} dateTime={String(date || "").trim() || undefined}>
      {text}
    </time>
  );
};

const FeaturedStory = ({ post, matchedPostId, postRefs }) => {
  if (!post) return null;

  const postId = getPostId(post);

  const animation =
    prefersReducedMotion() ? "none" : "portal-rise 0.5s ease-out both";

  return (
    <article
      ref={(element) => {
        if (postRefs && postId) {
          postRefs.current[postId] = element;
        }
      }}
      className={`group overflow-hidden rounded-xl bg-slate-950 shadow-lg ring-1 ring-slate-200 transition-shadow duration-300 hover:shadow-2xl ${matchedPostId === postId
        ? "ring-4 ring-yellow-300"
        : "ring-1 ring-slate-200"
        }`}
      style={{ animation }}
    >
      <div className="h-1.5 w-full bg-red-600" />

      <Link to={getArticleUrl(post)} className="block">
        <div className="relative aspect-[16/11] overflow-hidden bg-slate-100 sm:aspect-[16/9]">
          {post.image ? (
            <OptimizedImage
              src={post.image}
              alt={post.title || "Inkuru"}
              widths={RESOLUTION_WIDTHS.HERO}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1280px"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              loading="eager"
              priority
              decoding="async"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = PORTAL_FALLBACK_IMAGE;
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-200 via-slate-100 to-slate-300">
              <span className="text-3xl opacity-40">📰</span>
            </div>
          )}

        </div>
      </Link>

      <div className="bg-slate-950 px-5 py-4 sm:px-7 sm:py-5">
        <Link to={getArticleUrl(post)}>
          <h2 className="break-words font-post-title text-2xl font-bold leading-tight tracking-tight text-white transition-colors group-hover:text-red-300 sm:text-3xl">
            {post.title}
          </h2>
        </Link>
      </div>
    </article>
  );
};

const ImportantStory = ({ post, matchedPostId, postRefs }) => {
  if (!post) return null;

  const postId = getPostId(post);

  return (
    <article
      ref={(element) => {
        if (postRefs && postId) {
          postRefs.current[postId] = element;
        }
      }}
      className={`group flex h-fit self-start flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition-colors hover:bg-slate-50 hover:shadow-md ${matchedPostId === postId
        ? "border-yellow-300 bg-yellow-50 ring-2 ring-yellow-300"
        : "border-slate-200"
        }`}
    >
      <Link
        to={getArticleUrl(post)}
        className="order-1 relative block aspect-[16/10] w-full shrink-0 overflow-hidden bg-slate-100 sm:h-[150px] sm:aspect-auto"
      >
        <div className="h-full overflow-hidden">
          {post.image ? (
            <OptimizedImage
              src={post.image}
              alt={post.title || "Inkuru"}
              widths={RESOLUTION_WIDTHS.CARD}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 300px"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = PORTAL_FALLBACK_IMAGE;
              }}
            />
          ) : (
            <img src="/Rubavu.jpeg" alt="" className="h-full w-full object-cover" loading="lazy" width="320" height="180" />
          )}
        </div>
      </Link>

      <div className="order-2 min-h-0 flex-1 px-2.5 py-2.5 sm:px-3 sm:py-3">
        {post.category && (
          <span className="mb-1 block truncate font-body text-[8px] font-bold uppercase tracking-[0.14em] text-red-600">
            {post.category}
          </span>
        )}

        <Link to={getArticleUrl(post)}>
          <h3 className="break-words font-post-title text-sm font-bold leading-snug tracking-tight text-balance text-slate-950 transition-colors group-hover:text-red-600 sm:text-base">
            {post.title}
          </h3>
        </Link>

        <TimeText date={getPostDate(post)} className="mt-2 font-body text-[8px] font-medium text-slate-400" />
      </div>

    </article>
  );
};

const CompactCard = ({ post, matchedPostId, postRefs, variant = "default" }) => {
  if (!post) return null;

  const postId = getPostId(post);

  return (
    <article
      ref={(element) => {
        if (postRefs && postId) {
          postRefs.current[postId] = element;
        }
      }}
      className={`group flex self-start flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition-colors hover:bg-slate-50 hover:shadow-md ${variant === "large" ? "min-h-[280px] sm:min-h-[320px]" : "min-h-[250px] sm:min-h-[280px]"} ${matchedPostId === postId
        ? "border-yellow-300 bg-yellow-50 ring-2 ring-yellow-300"
        : "border-slate-200"
        }`}
    >
      <Link
        to={getArticleUrl(post)}
        className={`order-1 relative block w-full shrink-0 overflow-hidden bg-slate-100 ${variant === "large" ? "aspect-[16/10] sm:h-[190px] sm:aspect-auto" : "aspect-[16/10] sm:h-[150px] sm:aspect-auto"}`}
      >
        {post.image ? (
          <OptimizedImage
            src={post.image}
            alt={post.title || "Inkuru"}
            widths={RESOLUTION_WIDTHS.THUMB}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = PORTAL_FALLBACK_IMAGE;
            }}
          />
        ) : (
          <img src="/Rubavu.jpeg" alt="" className="h-full w-full object-cover" loading="lazy" width="320" height="180" />
        )}
      </Link>

      <div className="order-2 min-h-0 flex-1 px-2.5 py-2.5 sm:px-3 sm:py-3">
        <TimeText date={getPostDate(post)} className="font-body text-[8px] font-medium uppercase tracking-wider text-slate-400" />

        <Link to={getArticleUrl(post)}>
          <h3 className={`mt-1 break-words font-post-title leading-tight tracking-tight text-balance text-slate-950 transition-colors group-hover:text-red-600 ${variant === "large" ? "text-base font-bold sm:text-base" : "text-sm font-bold sm:text-sm"}`}>
            {post.title}
          </h3>
        </Link>
      </div>
    </article>
  );
};


const LatestWidget = ({ posts = [], postRefs }) => {
  const { t } = useLanguage();
  const latest = useMemo(
    () => [...posts].sort((a, b) => getTime(b) - getTime(a)),
    [posts]
  );

  if (!latest.length) return null;

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b-2 border-slate-900 px-4 py-3">
        <span className="h-4 w-1.5 rounded-sm bg-red-600" />
        <h3 className="font-post-title text-sm font-black uppercase tracking-tight text-slate-950">
          {t("latestNews")}
        </h3>
      </div>
      <style>{`
        @keyframes latestNewsScroll {
          from { transform: translate3d(0, 0, 0); }
          to { transform: translate3d(0, -100%, 0); }
        }
        .latest-news-scroll {
          animation: latestNewsScroll 42s linear infinite;
          will-change: transform;
          backface-visibility: hidden;
        }
      `}</style>
      <div className="h-[280px] w-full overflow-hidden sm:h-[360px]">
        <div
          className="latest-news-scroll divide-y divide-slate-100"
          style={{ animationDuration: `${Math.max(42, latest.length * 8)}s` }}
        >
          {latest.map((post) => {
            const postId = getPostId(post);

            return (
              <Link
                key={postId}
                to={getArticleUrl(post)}
                ref={(element) => {
                  if (postRefs && postId) postRefs.current[postId] = element;
                }}
                className="group flex items-center gap-3 p-3 transition hover:bg-slate-50"
              >
                <div className="h-14 w-20 shrink-0 overflow-hidden rounded-md bg-slate-100">
                  {post.image ? (
                    <OptimizedImage
                      src={post.image}
                      alt={post.title || "Inkuru"}
                      widths={RESOLUTION_WIDTHS.THUMB}
                      sizes="80px"
                      className="h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = PORTAL_FALLBACK_IMAGE;
                      }}
                    />
                  ) : (
                    <div className="h-full w-full bg-slate-100" />
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="break-words text-[12px] font-bold leading-snug text-slate-950 transition-colors group-hover:text-red-600">
                    {post.title}
                  </h4>
                  <p className="mt-1">
                    <TimeText date={getPostDate(post)} className="font-body text-[9px] font-medium text-slate-400" />
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const CategorySection = ({
  title,
  categoryName,
  posts,
  matchedPostId,
  postRefs,
}) => {
  const { language } = useLanguage();

  if (!posts.length) return null;

  const isEntertainment = categoryName === "Imyidagaduro";
  const isBusiness = categoryName === "Ubukungu";

  const heading = <NewsSectionHeading title={title} categoryName={categoryName} />;

  // Business: structured editorial list (numbered rows, no heavy cards).
  if (isBusiness) {
    return (
      <section>
        {heading}

        <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {posts.slice(0, 5).map((post, index) => (
            <Link
              key={getPostId(post)}
              to={getArticleUrl(post)}
              className="group flex items-center gap-4 px-4 py-3.5 transition hover:bg-slate-50"
            >
              <span
                className={`shrink-0 font-post-title text-lg font-black ${index < 3 ? "text-red-600" : "text-slate-300"
                  }`}
              >
                {String(index + 1).padStart(2, "0")}
              </span>

              <div className="min-w-0 flex-1">
                <h4 className="break-words text-sm font-bold leading-snug text-slate-950 transition-colors group-hover:text-red-600">
                  {post.title}
                </h4>
                <p className="mt-1 font-body text-[9px] font-medium text-slate-400">
                  {translateCategory(post.category, language)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    );
  }

  // Entertainment: image-driven, first story gets a large feature card.
  if (isEntertainment) {
    return (
      <section>
        {heading}

        <div className={`grid grid-cols-1 gap-4 ${posts.length > 2 ? "sm:grid-cols-3 sm:gap-3" : "sm:grid-cols-2 sm:gap-3"}`}>
          {posts.slice(0, 4).map((post, index) => (
            <div
              key={getPostId(post)}
              className={index === 0 && posts.length > 2 ? "sm:col-span-2" : ""}
            >
              <CompactCard
                post={post}
                variant={index === 0 ? "large" : "default"}
                matchedPostId={matchedPostId}
                postRefs={postRefs}
              />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section>
      {heading}

      <div className={`grid grid-cols-1 gap-4 ${posts.length > 2 ? "sm:grid-cols-3 sm:gap-3" : "sm:grid-cols-2 sm:gap-3"}`}>
        {posts.slice(0, 3).map((post) => (
          <CompactCard
            key={getPostId(post)}
            post={post}
            matchedPostId={matchedPostId}
            postRefs={postRefs}
          />
        ))}
      </div>
    </section>
  );
};

const AdSlot = ({ ad, size = "728x90", className = "" }) => {
  if (!ad || !ad.image) return null;

  return (
    <div className={`print:hidden ${className}`}>
      <AdBanner ad={ad} size={size} />
    </div>
  );
};

/* =========================================================
   NEWS POSTS LAYOUT
========================================================= */

const NewsPostsLayout = ({
  posts = [],
  matchedPostId,
  postRefs,
  advertisements = [],
  activeCategory = "All",
}) => {
  const { language, t } = useLanguage();

  const sortedNewest = useMemo(
    () => [...posts].sort((a, b) => getTime(b) - getTime(a)),
    [posts]
  );

  if (!sortedNewest.length) return null;

  const featured = sortedNewest[0];
  const isFilteredView = activeCategory !== "All";

  const categorySections = isFilteredView
    ? []
    : DEPARTMENTS.map(({ name }) => ({
      name,
      title: translateCategory(name, language),
      posts: sortedNewest.filter(
        (p) => normalizeDepartment(p.category) === name
      ),
    })).filter((section) => section.posts.length > 0);

  const renderSidebar = () => (
    <aside className="min-w-0 lg:col-span-4">
      <div className="space-y-4 lg:sticky lg:top-36">
        <AdSlot ad={advertisements[3]} size="rectangle" />
        <LatestWidget
          posts={sortedNewest}
          postRefs={postRefs}
        />
        <AdSlot ad={advertisements[4]} size="rectangle" />
      </div>
    </aside>
  );

  /* Filtered category view (a nav link was clicked) — compact grid + sidebar. */
  if (isFilteredView) {
    return (
      <div className="grid grid-cols-1 gap-7 lg:grid-cols-12">
        <main className="min-w-0 lg:col-span-8">
          <div className="mb-5 flex items-end justify-between border-b-2 border-slate-900 pb-3">
            <div>
              <p className="mb-1 font-body text-[9px] font-bold uppercase tracking-[0.2em] text-red-600">
                {language === "rw" ? "Icyiciro cy'amakuru" : "News department"}
              </p>
              <h1 className="font-post-title text-2xl font-black uppercase tracking-tight text-slate-950 sm:text-3xl">
                {translateCategory(activeCategory, language)}
              </h1>
            </div>
            <span className="font-body text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {sortedNewest.length} {language === "rw" ? "inkuru" : "posts"}
            </span>
          </div>

          <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sortedNewest.map((post) => (
              <React.Fragment key={getPostId(post)}>
                <CompactCard
                  post={post}
                  matchedPostId={matchedPostId}
                  postRefs={postRefs}
                />
              </React.Fragment>
            ))}
          </div>

          <AdSlot ad={advertisements[0]} size="728x90" className="mt-7" />
        </main>

        {renderSidebar()}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-7 lg:grid-cols-12">
      <main className="min-w-0 space-y-3 lg:col-span-8">
        {/* FEATURED NEWS */}
        <section>
          <NewsSectionHeading title={t("featuredNews")} />

          <FeaturedStory
            post={featured}
            matchedPostId={matchedPostId}
            postRefs={postRefs}
          />
        </section>

        {/* OTHER RECENT STORIES */}
        <section>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3 lg:grid-cols-4">
            {sortedNewest.slice(1, 5).map((post) => (
              <ImportantStory
                key={getPostId(post)}
                post={post}
                matchedPostId={matchedPostId}
                postRefs={postRefs}
              />
            ))}
          </div>
        </section>

        {/* IN-CONTENT AD */}
        <AdSlot ad={advertisements[0]} size="728x90" />

        {/* IN-CONTENT AD */}
        <AdSlot ad={advertisements[1]} size="728x90" />

        {/* CATEGORY SECTIONS */}
        <div className="space-y-0">
          {categorySections.map((section) => (
            <CategorySection
              key={section.name}
              title={section.title}
              categoryName={section.name}
              posts={section.posts}
              matchedPostId={matchedPostId}
              postRefs={postRefs}
            />
          ))}
        </div>

        {/* PRE-FOOTER AD */}
        <AdSlot ad={advertisements[2]} size="728x90" />
      </main>

      {renderSidebar()}
    </div>
  );
};

/* =========================================================
   NAVBAR
========================================================= */

const Navbar = ({ showHomeContent = true }) => {
  const { language, t } = useLanguage();
  const {
    queue: radioQueue,
    currentItem: radioItem,
    isPlaying: radioIsPlaying,
    isLoading: radioIsLoading,
    volume: radioVolume,
    isMuted: radioIsMuted,
    togglePlay: toggleRadio,
    playItem: playRadioItem,
    setVolume: setRadioVolume,
    toggleMute: toggleRadioMute,
  } = useRadio();

  const radioIsLive = Boolean(radioItem || radioQueue.length);
  const radioPlayableItem = radioItem || radioQueue[0];

  const handleRadioPlay = () => {
    if (radioItem) {
      toggleRadio();
    } else if (radioPlayableItem) {
      playRadioItem(radioPlayableItem);
    }
  };

  const [
    isMenuOpen,
    setIsMenuOpen,
  ] = useState(false);

  const [
    isMobileSearchOpen,
    setIsMobileSearchOpen,
  ] = useState(false);

  const [
    isRadioMenuOpen,
    setIsRadioMenuOpen,
  ] = useState(false);

  const [
    activeCategory,
    setActiveCategory,
  ] = useState("All");

  const [
    posts,
    setPosts,
  ] = useState([]);

  const [
    translatedPosts,
    setTranslatedPosts,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    advertisements,
    setAdvertisements,
  ] = useState([]);

  const [
    currentTime,
    setCurrentTime,
  ] = useState(new Date());

  const [
    isPageInitializing,
    setIsPageInitializing,
  ] = useState(false);

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const params = useMemo(
    () =>
      new URLSearchParams(
        location.search
      ),
    [location.search]
  );

  /* Apply active news category coming from the URL (e.g. footer category links). */
  useEffect(() => {
    const category = params.get(
      "category"
    );

    if (
      category &&
      DEPARTMENTS.some(
        (department) =>
          department.name ===
          category
      )
    ) {
      setActiveCategory(
        category
      );
    } else {
      setActiveCategory(
        "All"
      );
    }
  }, [params]);

  const [
    searchValue,
    setSearchValue,
  ] = useState("");

  const [
    searchHistory,
    setSearchHistory,
  ] = useState([]);

  const [
    isLoadingSearch,
    setIsLoadingSearch,
  ] = useState(false);

  const postRefs =
    useRef({});

  /* =====================================================
     CLOCK
  ===================================================== */

  useEffect(() => {
    const interval = setInterval(
      () => {
        setCurrentTime(
          new Date()
        );
      },
      1000
    );

    return () =>
      clearInterval(interval);
  }, []);

  /* =====================================================
     INITIAL LOADER
  ===================================================== */

  useEffect(() => {
    const timer = setTimeout(
      () => {
        setIsPageInitializing(
          false
        );
      },
      800
    );

    return () =>
      clearTimeout(timer);
  }, []);

  /* =====================================================
     SEARCH URL
  ===================================================== */

  useEffect(() => {
    setSearchValue(
      params.get("q") || ""
    );
  }, [params]);

  /* =====================================================
     SEARCH HISTORY
  ===================================================== */

  useEffect(() => {
    try {
      const saved =
        window.localStorage.getItem(
          "rt.searchHistory"
        );

      if (saved) {
        const parsed =
          JSON.parse(saved);

        setSearchHistory(
          Array.isArray(parsed)
            ? parsed
            : []
        );
      } else {
        setSearchHistory([]);
      }
    } catch {
      setSearchHistory([]);
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        "rt.searchHistory",
        JSON.stringify(
          searchHistory.slice(
            0,
            10
          )
        )
      );
    } catch {
      // Ignore localStorage errors.
    }
  }, [searchHistory]);

  /* =====================================================
     LOAD POSTS
  ===================================================== */

  useEffect(() => {
    let mounted = true;

    const loadPosts =
      async () => {
        setLoading(true);

        try {
          const data =
            await getPosts();

          if (mounted) {
            setPosts(
              Array.isArray(data)
                ? data
                : []
            );
          }
        } catch (error) {
          console.error(
            "Ntibyashobotse kubona amakuru:",
            error
          );

          if (mounted) {
            setPosts([]);
          }
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      };

    loadPosts();

    return () => {
      mounted = false;
    };
  }, []);

  /* =====================================================
     LOAD ADS
  ===================================================== */

  useEffect(() => {
    let mounted = true;

    const loadAds =
      async () => {
        try {
          const data =
            await getAdvertisements();

          if (!mounted) {
            return;
          }

          const activeAds =
            Array.isArray(data)
              ? data.filter((ad) => {
                return (
                  isAdCurrentlyActive(ad) &&
                  typeof ad.image ===
                  "string" &&
                  ad.image.trim() !==
                  ""
                );
              })
              : [];

          setAdvertisements(
            activeAds
          );

          preloadAdImages(
            activeAds
          );
        } catch (error) {
          console.error(
            "Kwamamaza ntikwashoboye kuboneka:",
            error
          );
        }
      };

    loadAds();

    return () => {
      mounted = false;
    };
  }, []);

  /* =====================================================
     POSTS (single-language: originals shown as-is)
  ===================================================== */

  useEffect(() => {
    let mounted = true;

    if (mounted && posts.length > 0) {
      setTranslatedPosts(posts);
    }

    return () => {
      mounted = false;
    };
  }, [posts, setTranslatedPosts]);

  /* =====================================================
     NAV LINKS
  ===================================================== */

  const links = useMemo(
    () => [
      {
        label: t("home"),
        category: "All",
      },
      ...DEPARTMENTS.map(
        (department) => ({
          label: translateCategory(department.name, language),
          category: department.name,
        })
      ),
    ],
    [language, t]
  );

  /* =====================================================
     FILTER
  ===================================================== */

  const filteredPosts =
    useMemo(() => {
      if (
        activeCategory ===
        "All"
      ) {
        return posts;
      }

      return posts.filter(
        (post) =>
          normalizeDepartment(post.category) ===
          activeCategory
      );
    }, [
      posts,
      activeCategory,
    ]);

  /* =====================================================
     SORT
  ===================================================== */

  const sortedPosts =
    useMemo(() => {
      return buildNaturalPostOrder(filteredPosts);
    }, [filteredPosts]);

  /* translated display posts (matched by id) */
  const displayPosts =
    useMemo(() => {
      const translatedMap = new Map(
        translatedPosts.map((p) => [getPostId(p), p])
      );

      return sortedPosts.map((post) => {
        const translated = translatedMap.get(getPostId(post));
        return translated || post;
      });
    }, [sortedPosts, translatedPosts]);

  /* =====================================================
     SEARCH MATCH
  ===================================================== */

  const matchedPostId =
    useMemo(() => {
      const query =
        (searchValue || "")
          .trim()
          .toLowerCase();

      if (!query) {
        return null;
      }

      const found =
        sortedPosts.find(
          (post) =>
            [
              post.title,
              post.category,
            ]
              .filter(Boolean)
              .some((value) =>
                String(value)
                  .toLowerCase()
                  .includes(query)
              )
        );

      return found
        ? getPostId(found)
        : null;
    }, [
      sortedPosts,
      searchValue,
    ]);

  /* =====================================================
     SCROLL TO SEARCH RESULT
  ===================================================== */

  useEffect(() => {
    if (!matchedPostId) {
      return undefined;
    }

    const found =
      sortedPosts.find(
        (post) =>
          getPostId(post) ===
          matchedPostId
      );

    if (found) {
      setActiveCategory(
        found.category ||
        "All"
      );
    }

    const timer =
      setTimeout(() => {
        const element =
          postRefs.current[
          matchedPostId
          ];

        if (
          element &&
          typeof element.scrollIntoView ===
          "function"
        ) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 150);

    return () =>
      clearTimeout(timer);
  }, [
    matchedPostId,
    sortedPosts,
  ]);

  /* =====================================================
     SEARCH DEBOUNCE
  ===================================================== */

  useEffect(() => {
    const value =
      (searchValue || "").trim();

    setIsLoadingSearch(
      Boolean(value)
    );

    const timeout =
      setTimeout(() => {
        setIsLoadingSearch(
          false
        );

        const next =
          new URLSearchParams(
            location.search
          );

        if (value) {
          next.set("q", value);
        } else {
          next.delete("q");
        }

        const nextSearch =
          next.toString();

        const currentSearch =
          location.search.replace(
            /^\?/,
            ""
          );

        if (
          nextSearch !==
          currentSearch
        ) {
          navigate(
            {
              search:
                nextSearch,
            },
            {
              replace: true,
            }
          );
        }

        if (value.length > 2) {
          setSearchHistory(
            (previous) => {
              const updated = [
                value,
                ...previous.filter(
                  (item) =>
                    item !== value
                ),
              ];

              return updated.slice(
                0,
                10
              );
            }
          );
        }
      }, 300);

    return () =>
      clearTimeout(timeout);
  }, [
    searchValue,
    location.search,
    navigate,
  ]);

  /* =====================================================
     DATE
  ===================================================== */

  const todayLabel =
    currentTime.toLocaleDateString(
      language === "fr" ? "fr-FR" : language === "sw" ? "sw-KE" : language === "en" ? "en-US" : "rw-RW",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );

  const timeLabel =
    currentTime.toLocaleTimeString(
      language === "fr" ? "fr-FR" : language === "sw" ? "sw-KE" : language === "en" ? "en-US" : "rw-RW",
      {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }
    );

  /* =====================================================
     TICKER
  ===================================================== */

  const tickerHeadlines =
    useMemo(
      () =>
        displayPosts
          .map(
            (post) =>
              post.title
          )
          .filter(Boolean),
      [displayPosts]
    );

  /* =====================================================
     NAVIGATION
  ===================================================== */

  const handleNavClick =
    (category) => {
      setActiveCategory(
        category
      );

      setIsMenuOpen(false);

      setIsMobileSearchOpen(
        false
      );

      const nextSearch =
        category === "All"
          ? ""
          : `?category=${encodeURIComponent(category)}`;

      navigate(
        {
          pathname: "/",
          search: nextSearch,
        },
        {
          replace: true,
        }
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };

  const radioDropdown = isRadioMenuOpen && (
    <div className="absolute right-0 top-full z-50 mt-1 w-[min(86vw,160px)] rounded-lg border border-slate-700 bg-slate-950 p-2 text-white shadow-xl">
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={handleRadioPlay}
          disabled={!radioPlayableItem || radioIsLoading}
          className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-red-600 text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={radioIsPlaying ? "Pause radio" : "Play radio"}
        >
          {radioIsLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : radioIsPlaying ? <Pause className="h-3 w-3 fill-current" /> : <Play className="ml-0.5 h-3 w-3 fill-current" />}
        </button>
        <button type="button" onClick={toggleRadioMute} className="text-slate-300 hover:text-white" aria-label={radioIsMuted ? "Unmute radio" : "Mute radio"}>
          {radioIsMuted || radioVolume === 0 ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={radioIsMuted ? 0 : radioVolume}
          onChange={(event) => setRadioVolume(event.target.value)}
          className="radio-range min-w-0 flex-1 accent-red-600"
          aria-label="Radio volume"
        />
      </div>
    </div>
  );

  const radioControl = (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsRadioMenuOpen((previous) => !previous)}
        aria-expanded={isRadioMenuOpen}
        aria-label="RubavuToday Radio"
        title="RubavuToday Radio"
        className={`flex h-9 w-9 items-center justify-center gap-1.5 px-0 py-0 font-body text-[11px] font-black uppercase tracking-[0.1em] transition sm:h-auto sm:w-auto sm:px-4 sm:py-3 ${radioIsLive ? "bg-red-600 text-white hover:bg-red-700" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}
      >
        <RadioIcon className={`h-3.5 w-3.5 ${radioIsLive ? "text-red-200" : "text-slate-400"}`} />
        <span className="hidden sm:inline">RubavuToday Radio</span>
      </button>
      {radioDropdown}
    </div>
  );

  /* =====================================================
     INITIAL PAGE LOADER
  ===================================================== */

  if (isPageInitializing && showHomeContent) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950">
        <style>{`
          @keyframes spinCircle {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          .animate-spin-logo {
            animation: spinCircle 1s linear infinite;
          }
        `}</style>

        <div className="animate-spin-logo flex h-24 w-24 items-center justify-center rounded-full border-4 border-red-600 border-t-transparent bg-slate-800 p-2 shadow-2xl sm:h-32 sm:w-32">
          <img
            src={logo}
            alt="Rubavu Today"
            className="h-full w-full rounded-full object-cover"
          />
        </div>

        <p className="mt-6 font-body text-sm font-bold uppercase tracking-[0.2em] text-slate-300">
          {t("loading")}
        </p>
      </div>
    );
  }

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className={`${showHomeContent ? "min-h-screen" : ""} bg-slate-50 text-slate-900`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700;900&family=Source+Sans+3:wght@300;400;500;600;700;800;900&display=swap');

        .font-post-title {
          font-family: 'Source Sans 3', Inter, system-ui, sans-serif;
        }

        .font-body {
          font-family: 'Source Sans 3', system-ui, sans-serif;
        }

        @keyframes portal-rise {
          from {
            opacity: 0;
            transform: translateY(10px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        









        .navbar-search-input,
        .navbar-search-input input,
        input.navbar-search-input,
        textarea.navbar-search-input {
          color: #000000 !important;
          -webkit-text-fill-color: #000000 !important;
          caret-color: #000000 !important;
        }

        .navbar-search-input::placeholder,
        .navbar-search-input input::placeholder,
        input.navbar-search-input::placeholder {
          color: #64748b !important;
          -webkit-text-fill-color: #64748b !important;
          opacity: 1 !important;
        }

      `}</style>



      <div className="relative z-30 border-b border-slate-800 bg-slate-950 font-body text-slate-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2 text-[9px] uppercase tracking-[0.1em] sm:px-6 sm:text-[11px]">
          <span className="truncate">
            Rubavu Today — {todayLabel}
          </span>

          <div className="ml-2 flex shrink-0 items-center gap-2">
            <span className="rounded border border-slate-700 bg-slate-900 px-2 py-0.5 font-mono text-yellow-400">
              {timeLabel}
            </span>

            <span className="hidden font-semibold text-white md:inline">
              {language === "rw" ? "Amakuru yizewe, igihe cyose" : t("trustedNews")}
            </span>
          </div>
        </div>
      </div>



      {showHomeContent && tickerHeadlines.length > 0 && (
        <div className="relative z-30 flex overflow-hidden border-b border-red-700 bg-red-600 font-body text-xs font-semibold text-white">
          <div className="z-10 flex shrink-0 items-center gap-2 bg-black px-3 py-2 font-bold uppercase tracking-wider">
            <span className="h-2 w-2 animate-ping rounded-full bg-red-500" />

            <span className="hidden sm:inline">
              {language === "rw" ? "Amakuru agezweho:" : t("breakingNews")}
            </span>

            <span className="sm:hidden">
              {language === "rw" ? "LIVE" : "LIVE"}
            </span>
          </div>

          <div className="relative flex w-full overflow-hidden whitespace-nowrap py-2">
            <div
              className="rubavu-ticker-scroll"
              style={{
                animation: "rubavuTicker 350s linear infinite",
                willChange: "transform",
              }}
            >
              {tickerHeadlines.map(
                (
                  title,
                  index
                ) => (
                  <span
                    key={`ticker1-${index}`}
                    className="mx-8 inline-flex items-center"
                  >
                    {title}
                  </span>
                )
              )}

              {tickerHeadlines.map(
                (
                  title,
                  index
                ) => (
                  <span
                    key={`ticker2-${index}`}
                    className="mx-8 inline-flex items-center"
                  >
                    {title}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      )}



      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950 text-white shadow-xl">
        <div className="relative mx-auto flex h-[76px] max-w-7xl items-center justify-center px-2 sm:h-[92px] sm:px-6 lg:h-[100px] lg:px-10">



          <div className="absolute left-2 flex items-center sm:left-6 lg:left-10">
            <button
              type="button"
              aria-label="Shakisha"
              onClick={() =>
                setIsMobileSearchOpen(
                  (previous) =>
                    !previous
                )
              }
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-200 transition hover:bg-slate-800 sm:hidden"
            >
              <SearchIcon />
            </button>

            <div className="hidden sm:block sm:w-[240px] md:w-[290px] lg:w-[350px] navbar-search-input">
              <SearchBar
                value={
                  searchValue
                }
                onChange={
                  setSearchValue
                }
                searchHistory={
                  searchHistory
                }
                onSelectHistory={(
                  value
                ) =>
                  setSearchValue(
                    value
                  )
                }
                isLoading={
                  isLoadingSearch
                }
              />
            </div>
          </div>



          <button
            type="button"
            onClick={() =>
              handleNavClick(
                "All"
              )
            }
            aria-label="Rubavu Today Ahabanza"
            className="group flex max-w-[58%] items-center justify-center gap-2 outline-none sm:max-w-none sm:gap-3"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-red-600 bg-white shadow-xl transition duration-300 group-hover:scale-105 sm:h-[62px] sm:w-[62px] md:h-[68px] md:w-[68px]">
              <img
                src={logo}
                alt="Rubavu Today"
                className="h-full w-full object-cover"
              />
            </div>

            <span className="font-post-title whitespace-nowrap text-[18px] font-black leading-none tracking-tight text-white sm:text-2xl md:text-3xl lg:text-4xl">
              Rubavu Today
            </span>
          </button>



          <div className="absolute right-3 hidden flex-col items-end gap-3 sm:flex sm:right-6 lg:right-10">
            <SocialLinks />
          </div>



          <div className="absolute right-12 flex sm:hidden">
            {radioControl}
          </div>

          <button
            type="button"
            onClick={() =>
              setIsMenuOpen(
                (previous) =>
                  !previous
              )
            }
            aria-label="Ibice"
            aria-expanded={
              isMenuOpen
            }
            className="absolute right-2 flex h-9 items-center justify-center rounded-full border border-slate-700 bg-slate-900 px-2.5 font-body text-[10px] font-bold uppercase tracking-wider text-slate-200 transition hover:bg-slate-800 sm:hidden"
          >
            <span className="mr-1.5 text-sm" aria-hidden="true">
              ☰
            </span>
          </button>
        </div>



        {isMobileSearchOpen && (
          <div className="border-t border-slate-800 bg-slate-900 px-3 py-3 sm:hidden navbar-search-input">
            <SearchBar
              value={
                searchValue
              }
              onChange={
                setSearchValue
              }
              searchHistory={
                searchHistory
              }
              onSelectHistory={(
                value
              ) => {
                setSearchValue(
                  value
                );

                setIsMobileSearchOpen(
                  false
                );
              }}
              isLoading={
                isLoadingSearch
              }
            />
          </div>
        )}



        <div className="border-t border-slate-800 bg-slate-950">



          <div className="mx-auto hidden max-w-7xl items-center justify-center lg:flex">
            <div className="flex items-center gap-1 rounded-none border-x border-slate-800 bg-slate-950">
              <Link
                to="/media"
                className="flex items-center gap-1.5 bg-slate-950 px-4 py-3 font-body text-[11px] font-black uppercase tracking-[0.1em] text-white transition hover:bg-red-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
                  <path d="M4.5 4.5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h8.25a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3H4.5ZM19.94 18.75l-2.44-2.44V7.69l2.44-2.44a1.5 1.5 0 0 1 2.56 1.06v11.38a1.5 1.5 0 0 1-2.56 1.06Z" />
                </svg>
                PHOTOS & VIDEOS
              </Link>
              {links.map(
                (link) => {
                  const active =
                    activeCategory ===
                    link.category;

                  return (
                    <button
                      key={
                        link.label
                      }
                      type="button"
                      onClick={() =>
                        handleNavClick(
                          link.category
                        )
                      }
                      className={`
                        px-5
                        py-3
                        font-body
                        text-[12px]
                        font-bold
                        uppercase
                        tracking-[0.1em]
                        transition
                        ${active
                          ? "bg-white text-slate-950"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        }
                      `}
                    >
                      {
                        link.label
                      }
                    </button>
                  );
                }
              )}
              {radioControl}
            </div>
          </div>



          <div className="hidden justify-center md:flex lg:hidden">
            <div className="flex max-w-full items-center gap-1 overflow-x-auto px-2">
              <Link
                to="/media"
                className="flex shrink-0 items-center gap-1 bg-slate-950 px-4 py-3 font-body text-[10px] font-black uppercase tracking-[0.1em] text-white transition hover:bg-red-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
                  <path d="M4.5 4.5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h8.25a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3H4.5ZM19.94 18.75l-2.44-2.44V7.69l2.44-2.44a1.5 1.5 0 0 1 2.56 1.06v11.38a1.5 1.5 0 0 1-2.56 1.06Z" />
                </svg>
                PHOTOS & VIDEOS
              </Link>
              {links.map(
                (link) => {
                  const active =
                    activeCategory ===
                    link.category;

                  return (
                    <button
                      key={
                        link.label
                      }
                      type="button"
                      onClick={() =>
                        handleNavClick(
                          link.category
                        )
                      }
                      className={`
                        shrink-0
                        px-4
                        py-3
                        font-body
                        text-[11px]
                        font-bold
                        uppercase
                        ${active
                          ? "bg-white text-slate-950"
                          : "text-slate-300"
                        }
                      `}
                    >
                      {
                        link.label
                      }
                    </button>
                  );
                }
              )}
              {radioControl}
            </div>
          </div>



          {isMenuOpen && (
            <div className="border-t border-slate-800 bg-slate-900 px-4 py-4 shadow-2xl sm:hidden">
              <div className="mb-4">
                <p className="mb-2 font-body text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  {language === "rw" ? "Ibice by'amakuru" : t("categories")}
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/media"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center gap-1 rounded-lg border border-red-600 bg-red-600 px-3 py-3 text-left font-body text-xs font-black uppercase tracking-wide text-white transition hover:bg-red-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                      <path d="M4.5 4.5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h8.25a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3H4.5ZM19.94 18.75l-2.44-2.44V7.69l2.44-2.44a1.5 1.5 0 0 1 2.56 1.06v11.38a1.5 1.5 0 0 1-2.56 1.06Z" />
                    </svg>
                    PHOTOS & VIDEOS
                  </Link>
                  {links.map(
                    (link) => {
                      const active =
                        activeCategory ===
                        link.category;

                      return (
                        <button
                          key={
                            link.label
                          }
                          type="button"
                          onClick={() =>
                            handleNavClick(
                              link.category
                            )
                          }
                          className={`
                            rounded-lg
                            border
                            px-3
                            py-3
                            text-left
                            font-body
                            text-xs
                            font-bold
                            uppercase
                            transition
                            ${active
                              ? "border-red-600 bg-red-600 text-white"
                              : "border-slate-700 bg-slate-800 text-slate-300"
                            }
                          `}
                        >
                          {
                            link.label
                          }
                        </button>
                      );
                    }
                  )}
                  <div className="col-span-2">{radioControl}</div>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-4">
                <p className="mb-3 font-body text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  {language === "rw" ? "Dukurikire kuri" : t("followUs")}
                </p>

                <SocialLinks compact />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Full-width Advertisement Section - spans the full viewport */}
      {showHomeContent && advertisements.length > 0 && (
        <div className="relative left-1/2 z-10 w-[100vw] -ml-[50vw] border-b border-slate-100 bg-white">
          <div className="mx-auto w-full max-w-[1800px]">
            <AdCarousel ads={advertisements} />
          </div>
        </div>
      )}

      {showHomeContent && (
        <>
          <main className="relative z-20 mx-auto w-full max-w-7xl px-0 pb-5 pt-6 sm:pb-6">
            <div className="px-3 pt-5 sm:px-6 sm:pt-6 lg:px-10">
              {loading ? null : sortedPosts.length ===
                0 ? (
                <div className="py-20 text-center font-body text-slate-500">
                  {language === "rw" ? "Nta makuru aboneka muri iki cyiciro." : t("noPostsInCategory")}
                </div>
              ) : (
                <NewsPostsLayout
                  posts={
                    displayPosts
                  }
                  matchedPostId={
                    matchedPostId
                  }
                  postRefs={
                    postRefs
                  }
                  advertisements={
                    advertisements
                  }
                  activeCategory={
                    activeCategory
                  }
                />
              )}
            </div>
          </main>
        </>
      )}


    </div>
  );
};

export default Navbar;
