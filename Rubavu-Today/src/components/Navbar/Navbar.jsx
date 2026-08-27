





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





export const DEPARTMENTS = [
  {
    name: "Amakuru",
    label: "Amakuru",
    icon: "📰",
  },
  {
    name: "Ubukungu",
    label: "Ubukungu",
    icon: "💼",
  },
  {
    name: "Imikino",
    label: "Imikino",
    icon: "⚽",
  },
  {
    name: "Imyidagaduro",
    label: "Imyidagaduro",
    icon: "🎭",
  },
  {
    name: "Uburezi",
    label: "Uburezi",
    icon: "🎓",
  },
];





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

const formatDate = (date, short = false) => {
  if (!date) return "";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toLocaleDateString(
    "rw-RW",
    short
      ? {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
      : {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
  );
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
      image.src = ad.image;
    }
  });
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

  useEffect(() => {
    if (visibleAds.length <= 1) {
      return undefined;
    }

    const interval = setInterval(() => {
      setCurrentIndex((previous) =>
        previous >= visibleAds.length - 1
          ? 0
          : previous + 1
      );
    }, 6000);

    return () => clearInterval(interval);
  }, [visibleAds.length]);

  if (!visibleAds.length) {
    return null;
  }

  const safeIndex =
    currentIndex >= visibleAds.length
      ? 0
      : currentIndex;

  const goPrevious = () => {
    setCurrentIndex((previous) =>
      previous === 0
        ? visibleAds.length - 1
        : previous - 1
    );
  };

  const goNext = () => {
    setCurrentIndex(
      (previous) =>
        (previous + 1) %
        visibleAds.length
    );
  };

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

  return (
    <section
      aria-label="Kwamamaza"
      className="mx-auto w-full max-w-7xl bg-white px-2 py-1 sm:px-4 sm:py-2"
    >
      <div className="relative m-0 w-full overflow-hidden rounded-sm bg-white p-0">
        <div
          className="
            flex
            w-full
            transition-transform
            duration-700
            ease-in-out
            will-change-transform
          "
          style={{
            transform: `translateX(-${safeIndex * 100
              }%)`,
          }}
        >
          {visibleAds.map((ad, index) => {
            const key =
              ad.id ||
              ad._id ||
              `advertisement-${index}`;

            const content = (
              <div
                className="
                  relative
                  m-0
                  flex
                  w-full
                  shrink-0
                  items-center
                  justify-center
                  overflow-hidden
                  bg-white
                  p-0
                "
              >
                <img
                  src={ad.image}
                  alt={
                    ad.title ||
                    "Kwamamaza - Rubavu Today"
                  }
                  className="
                    m-0
                    block
                    h-auto
                    max-h-[80px]
                    w-full
                    max-w-full
                    select-none
                    object-contain
                    object-center
                    p-0
                    sm:max-h-[100px]
                    md:max-h-[120px]
                    lg:max-h-[140px]
                  "
                  loading="eager"
                  fetchPriority={
                    index === safeIndex
                      ? "high"
                      : "auto"
                  }
                  decoding="async"
                  draggable="false"
                  onError={() =>
                    handleImageError(ad)
                  }
                />
              </div>
            );

            if (
              ad.target_url &&
              String(ad.target_url).trim()
            ) {
              return (
                <a
                  key={key}
                  href={ad.target_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={
                    ad.title ||
                    "Kwamamaza"
                  }
                  className="
                    m-0
                    block
                    w-full
                    shrink-0
                    bg-white
                    p-0
                  "
                >
                  {content}
                </a>
              );
            }

            return (
              <div
                key={key}
                className="
                  m-0
                  w-full
                  shrink-0
                  bg-white
                  p-0
                "
              >
                {content}
              </div>
            );
          })}
        </div>

        {visibleAds.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrevious}
              aria-label="Kwamamaza kwabanje"
              className="
                absolute
                left-2
                top-1/2
                z-30
                flex
                h-8
                w-8
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                bg-black/50
                text-xl
                leading-none
                text-white
                shadow-md
                transition
                hover:bg-black/80
              "
            >
              ‹
            </button>

            <button
              type="button"
              onClick={goNext}
              aria-label="Kwamamaza gukurikira"
              className="
                absolute
                right-2
                top-1/2
                z-30
                flex
                h-8
                w-8
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                bg-black/50
                text-xl
                leading-none
                text-white
                shadow-md
                transition
                hover:bg-black/80
              "
            >
              ›
            </button>

            <div
              className="
                absolute
                bottom-2
                left-1/2
                z-30
                flex
                -translate-x-1/2
                gap-1.5
                rounded-full
                bg-black/30
                px-2
                py-1
              "
            >
              {visibleAds.map((ad, index) => (
                <button
                  key={`dot-${ad.id ||
                    ad._id ||
                    index
                    }`}
                  type="button"
                  onClick={() =>
                    setCurrentIndex(index)
                  }
                  aria-label={`Kwamamaza ${index + 1
                    }`}
                  className={`
                    rounded-full
                    transition-all
                    ${safeIndex === index
                      ? "h-1.5 w-5 bg-white"
                      : "h-1.5 w-1.5 bg-white/60"
                    }
                  `}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
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
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
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
      className={`flex items-center ${compact
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
            h-9
            w-9
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





const SmallPostCard = ({
  post,
  index,
  matchedPostId,
  postRefs,
}) => {
  const postId = getPostId(post, index);
  const articleHref = post?.slug ? `/${post.slug}.html` : `/post/${postId}`;

  return (
    <article
      ref={(element) => {
        if (postRefs && postId) {
          postRefs.current[postId] =
            element;
        }
      }}
      className={`
        group
        w-full
        overflow-hidden
        rounded-lg
        border
        border-slate-200
        bg-white
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:shadow-md
        ${matchedPostId === postId
          ? "bg-yellow-50 ring-2 ring-yellow-300"
          : ""
        }
      `}
    >
      <Link
        to={articleHref}
        className="block"
      >
        <div className="relative h-[85px] w-full overflow-hidden bg-slate-100 sm:h-[95px]">
          {post.image ? (
            <img
              src={post.image}
              alt={
                post.title || "Inkuru"
              }
              className="
                h-full
                w-full
                object-cover
                transition-transform
                duration-500
                group-hover:scale-105
              "
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-2xl opacity-30">
              📰
            </div>
          )}
        </div>

        <div className="p-2">
          <h3 className="line-clamp-3 font-post-title text-[10px] font-bold leading-[1.3] text-slate-900 transition-colors group-hover:text-red-600 sm:text-[11px]">
            {post.title}
          </h3>

          <p className="mt-1.5 font-body text-[7px] font-medium text-slate-400 sm:text-[8px]">
            {formatDate(
              getPostDate(post),
              true
            )}
          </p>
        </div>
      </Link>
    </article>
  );
};





const MixedPosts = ({
  posts = [],
  matchedPostId,
  postRefs,
}) => {
  const mixedPosts = useMemo(() => {
    if (!posts.length) {
      return [];
    }

    const newest = [...posts].sort(
      (a, b) =>
        getTime(b) - getTime(a)
    );

    const oldest = [...posts].sort(
      (a, b) =>
        getTime(a) - getTime(b)
    );

    const result = [];
    const used = new Set();

    let newestIndex = 0;
    let oldestIndex = 0;

    while (
      result.length < 24 &&
      (
        newestIndex < newest.length ||
        oldestIndex < oldest.length
      )
    ) {
      if (
        newestIndex < newest.length &&
        result.length < 24
      ) {
        const post =
          newest[newestIndex];

        const id =
          getPostId(
            post,
            newestIndex
          );

        newestIndex++;

        if (!used.has(id)) {
          result.push(post);
          used.add(id);
        }
      }

      if (
        oldestIndex < oldest.length &&
        result.length < 24
      ) {
        const post =
          oldest[oldestIndex];

        const id =
          getPostId(
            post,
            oldestIndex
          );

        oldestIndex++;

        if (!used.has(id)) {
          result.push(post);
          used.add(id);
        }
      }
    }

    return result.slice(0, 24);
  }, [posts]);

  if (!mixedPosts.length) {
    return null;
  }

  return (
    <section className="w-full">
      <div className="mb-3 flex items-end justify-between border-b border-slate-200 pb-2.5">
        <div>
          <div className="mb-1 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-900" />

            <span className="font-body text-[7px] font-bold uppercase tracking-[0.18em] text-slate-500">
              Andi makuru
            </span>
          </div>

          <h2 className="font-post-title text-lg font-black text-slate-950 sm:text-xl">
            Izindi nkuru
          </h2>
        </div>

        <span className="font-body text-[7px] font-bold uppercase tracking-wider text-slate-400">
          {mixedPosts.length}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-2.5 lg:grid-cols-3 lg:gap-2.5">
        {mixedPosts.map(
          (post, index) => (
            <SmallPostCard
              key={`${getPostId(
                post,
                index
              )}-mixed-${index}`}
              post={post}
              index={index}
              matchedPostId={
                matchedPostId
              }
              postRefs={postRefs}
            />
          )
        )}
      </div>

      <p className="mt-3 font-body text-[7px] font-semibold uppercase tracking-[0.12em] text-slate-400">
        Amakuru mashya n'andi makuru
      </p>
    </section>
  );
};

/* =========================================================
   TOP FIVE SLIDER
========================================================= */

const TopFiveSlider = ({
  posts = [],
  matchedPostId,
  postRefs,
}) => {
  const newestFive = useMemo(() => {
    return [...posts]
      .sort(
        (a, b) =>
          getTime(b) - getTime(a)
      )
      .slice(0, 5);
  }, [posts]);

  const [
    currentIndex,
    setCurrentIndex,
  ] = useState(0);

  const [
    paused,
    setPaused,
  ] = useState(false);

  useEffect(() => {
    setCurrentIndex(0);
  }, [newestFive.length]);

  useEffect(() => {
    if (
      newestFive.length <= 1 ||
      paused
    ) {
      return undefined;
    }

    const interval = setInterval(
      () => {
        setCurrentIndex(
          (previous) =>
            previous >=
              newestFive.length - 1
              ? 0
              : previous + 1
        );
      },
      3000
    );

    return () =>
      clearInterval(interval);
  }, [
    newestFive.length,
    paused,
  ]);

  if (!newestFive.length) {
    return null;
  }

  const goPrevious = () => {
    setCurrentIndex(
      (previous) =>
        previous === 0
          ? newestFive.length - 1
          : previous - 1
    );
  };

  const goNext = () => {
    setCurrentIndex(
      (previous) =>
        (previous + 1) %
        newestFive.length
    );
  };

  return (
    <section
      className="
        mt-6
        w-full
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
        shadow-sm
      "
      onMouseEnter={() =>
        setPaused(true)
      }
      onMouseLeave={() =>
        setPaused(false)
      }
      onTouchStart={() =>
        setPaused(true)
      }
      onTouchEnd={() =>
        setPaused(false)
      }
    >
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />

          <h2 className="font-post-title text-sm font-black text-white sm:text-base">
            Amakuru mashya
          </h2>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={goPrevious}
            aria-label="Inkuru ibanza"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-lg text-white transition hover:bg-red-600"
          >
            ‹
          </button>

          <button
            type="button"
            onClick={goNext}
            aria-label="Inkuru ikurikira"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-lg text-white transition hover:bg-red-600"
          >
            ›
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-700 ease-out"
          style={{
            transform: `translateX(-${currentIndex * 100
              }%)`,
          }}
        >
          {newestFive.map(
            (post, index) => {
              const postId =
                getPostId(
                  post,
                  index
                );

              return (
                <article
                  key={postId}
                  ref={(element) => {
                    if (
                      postRefs &&
                      postId
                    ) {
                      postRefs.current[
                        postId
                      ] = element;
                    }
                  }}
                  className={`
                    w-full
                    shrink-0
                    ${matchedPostId ===
                      postId
                      ? "bg-yellow-50"
                      : "bg-white"
                    }
                  `}
                >
                  <Link
                    to={post?.slug ? `/${post.slug}.html` : `/post/${postId}`}
                    className="group flex min-h-[150px] flex-col sm:min-h-[190px] sm:flex-row"
                  >
                    <div className="relative h-[150px] w-full shrink-0 overflow-hidden bg-slate-100 sm:h-[190px] sm:w-[42%] md:w-[35%]">
                      {post.image ? (
                        <img
                          src={
                            post.image
                          }
                          alt={
                            post.title ||
                            "Inkuru"
                          }
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading={
                            index === 0
                              ? "eager"
                              : "lazy"
                          }
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-6xl opacity-30">
                          📰
                        </div>
                      )}

                      <div className="absolute left-3 top-3 rounded-full bg-red-600 px-2.5 py-1 font-body text-[8px] font-bold uppercase tracking-wider text-white shadow-lg">
                        #{index + 1}
                      </div>
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col justify-center p-4 sm:p-6">
                      {post.category && (
                        <span className="mb-2 w-fit rounded bg-red-600 px-2 py-1 font-body text-[8px] font-bold uppercase tracking-wider text-white">
                          {post.category}
                        </span>
                      )}

                      <h3 className="line-clamp-3 font-post-title text-lg font-black leading-snug text-slate-950 transition-colors group-hover:text-red-600 sm:text-xl md:text-2xl">
                        {post.title}
                      </h3>

                      <p className="mt-3 font-body text-[9px] font-medium text-slate-400 sm:text-[10px]">
                        {formatDate(
                          getPostDate(
                            post
                          ),
                          false
                        )}
                      </p>
                    </div>
                  </Link>
                </article>
              );
            }
          )}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
        <span className="font-body text-[8px] font-bold uppercase tracking-wider text-slate-400" />

        <div className="flex items-center gap-1.5">
          {newestFive.map(
            (post, index) => (
              <button
                key={`slide-dot-${getPostId(
                  post,
                  index
                )}`}
                type="button"
                onClick={() =>
                  setCurrentIndex(
                    index
                  )
                }
                className={`
                  h-1.5
                  rounded-full
                  transition-all
                  ${currentIndex ===
                    index
                    ? "w-6 bg-red-600"
                    : "w-1.5 bg-slate-300"
                  }
                `}
                aria-label={`Igice ${index + 1
                  }`}
              />
            )
          )}
        </div>
      </div>
    </section>
  );
};

/* =========================================================
   NEWS POSTS LAYOUT
========================================================= */

const NewsPostsLayout = ({
  posts = [],
  matchedPostId,
  postRefs,
}) => {
  if (!posts.length) {
    return null;
  }

  const sortedNewest = [...posts].sort(
    (a, b) =>
      getTime(b) - getTime(a)
  );

  const recentPost =
    sortedNewest[0];

  const recentId =
    getPostId(recentPost);

  const mixedPosts = posts.filter(
    (post) =>
      getPostId(post) !== recentId
  );

  return (
    <section className="w-full">
      <div className="mb-5 flex items-end justify-between border-b border-slate-200 pb-3">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-600" />

            <span className="font-body text-[9px] font-bold uppercase tracking-[0.2em] text-red-600">
              Amakuru
            </span>
          </div>

          <h1 className="font-post-title text-2xl font-black text-slate-950 sm:text-3xl">
            Amakuru agezweho
          </h1>
        </div>

        <span className="hidden font-body text-[10px] font-semibold uppercase tracking-wider text-slate-400 sm:block">
          Rubavu Today
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-7">
        <div className="order-1 min-w-0 lg:col-span-7">
          <article
            ref={(element) => {
              if (
                postRefs &&
                recentId
              ) {
                postRefs.current[
                  recentId
                ] = element;
              }
            }}
            className={`
              group
              overflow-hidden
              rounded-2xl
              border
              border-slate-200
              bg-white
              shadow-md
              transition-all
              duration-300
              hover:shadow-xl
              ${matchedPostId ===
                recentId
                ? "bg-yellow-50 ring-4 ring-yellow-300"
                : ""
              }
            `}
          >
            <Link
              to={recentPost?.slug ? `/${recentPost.slug}.html` : `/post/${recentId}`}
              className="relative block h-[230px] overflow-hidden bg-slate-100 sm:h-[320px] md:h-[380px] lg:h-[390px]"
            >
              {recentPost.image ? (
                <img
                  src={
                    recentPost.image
                  }
                  alt={
                    recentPost.title ||
                    "Inkuru nshya"
                  }
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-7xl opacity-30">
                  📰
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/70 to-transparent" />

              <div className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-5 sm:right-5">
                <span className="font-body text-[8px] font-bold uppercase tracking-[0.2em] text-white/80">
                  Rubavu Today
                </span>
              </div>
            </Link>

            <div className="p-4 sm:p-5 md:p-6">
              {recentPost.category && (
                <span className="mb-3 inline-block rounded bg-red-600 px-2.5 py-1 font-body text-[8px] font-bold uppercase tracking-wider text-white">
                  {recentPost.category}
                </span>
              )}

              <Link
                to={recentPost?.slug ? `/${recentPost.slug}.html` : `/post/${recentId}`}
              >
                <h2 className="font-post-title text-xl font-black leading-[1.18] text-slate-950 transition-colors group-hover:text-red-600 sm:text-2xl md:text-3xl">
                  {recentPost.title}
                </h2>
              </Link>

              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="font-body text-[9px] font-medium text-slate-400 sm:text-[10px]">
                  {formatDate(
                    getPostDate(
                      recentPost
                    ),
                    false
                  )}
                </p>

                <Link
                  to={recentPost?.slug ? `/${recentPost.slug}.html` : `/post/${recentId}`}
                  className="font-body text-[9px] font-bold uppercase tracking-wider text-red-600 transition hover:text-red-800"
                >
                  Soma →
                </Link>
              </div>
            </div>
          </article>

          <TopFiveSlider
            posts={posts}
            matchedPostId={
              matchedPostId
            }
            postRefs={postRefs}
          />
        </div>

        <aside className="order-2 min-w-0 lg:col-span-5">
          <MixedPosts
            posts={mixedPosts}
            matchedPostId={
              matchedPostId
            }
            postRefs={postRefs}
          />
        </aside>
      </div>
    </section>
  );
};

/* =========================================================
   NAVBAR
========================================================= */

const Navbar = ({ showHomeContent = true }) => {
  const [
    isMenuOpen,
    setIsMenuOpen,
  ] = useState(false);

  const [
    isMobileSearchOpen,
    setIsMobileSearchOpen,
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
  ] = useState(true);

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
     NAV LINKS
  ===================================================== */

  const links = useMemo(
    () => [
      {
        label: "Ahabanza",
        category: "All",
      },
      ...DEPARTMENTS.map(
        (department) => ({
          label:
            department.label,
          category:
            department.name,
        })
      ),
    ],
    []
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
          post.category ===
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
      return [
        ...filteredPosts,
      ].sort(
        (a, b) =>
          getTime(b) -
          getTime(a)
      );
    }, [filteredPosts]);

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
      "rw-RW",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );

  const timeLabel =
    currentTime.toLocaleTimeString(
      "rw-RW",
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
        sortedPosts
          .map(
            (post) =>
              post.title
          )
          .filter(Boolean),
      [sortedPosts]
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

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };

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
          Rubavu Today irafungura...
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
        @import url('https:

        .font-post-title {
          font-family: 'Merriweather', Georgia, serif;
        }

        .font-body {
          font-family: 'Source Sans 3', system-ui, sans-serif;
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
            Rubavu Today —{" "}
            {todayLabel}
          </span>

          <div className="ml-2 flex shrink-0 items-center gap-2">
            <span className="rounded border border-slate-700 bg-slate-900 px-2 py-0.5 font-mono text-yellow-400">
              ⏱ {timeLabel}
            </span>

            <span className="hidden font-semibold text-white md:inline">
              Amakuru yizewe,
              igihe cyose
            </span>
          </div>
        </div>
      </div>



      {showHomeContent && tickerHeadlines.length > 0 && (
        <div className="relative z-30 flex overflow-hidden border-b border-red-700 bg-red-600 font-body text-xs font-semibold text-white">
          <div className="z-10 flex shrink-0 items-center gap-2 bg-black px-3 py-2 font-bold uppercase tracking-wider">
            <span className="h-2 w-2 animate-ping rounded-full bg-red-500" />

            <span className="hidden sm:inline">
              Amakuru agezweho:
            </span>

            <span className="sm:hidden">
              LIVE
            </span>
          </div>

          <div className="relative flex w-full overflow-hidden whitespace-nowrap py-2">
            <div
              className="rubavu-ticker-scroll"
              style={{
                animation: "rubavuTicker 120s linear infinite",
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
                    <span className="mr-2 text-yellow-300">
                      ▪
                    </span>

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
                    <span className="mr-2 text-yellow-300">
                      ▪
                    </span>

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



          <div className="absolute right-3 hidden sm:block sm:right-6 lg:right-10">
            <SocialLinks />
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
            <span className="mr-1.5 text-sm">
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
            <div className="flex divide-x divide-slate-800 border-x border-slate-800">
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
            </div>
          </div>



          <div className="hidden justify-center md:flex lg:hidden">
            <div className="flex max-w-full overflow-x-auto">
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
            </div>
          </div>



          {isMenuOpen && (
            <div className="border-t border-slate-800 bg-slate-900 px-4 py-4 shadow-2xl sm:hidden">
              <div className="mb-4">
                <p className="mb-2 font-body text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  Ibice by'amakuru
                </p>

                <div className="grid grid-cols-2 gap-2">
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
                </div>
              </div>

              <div className="border-t border-slate-800 pt-4">
                <p className="mb-3 font-body text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  Dukurikire kuri
                </p>

                <SocialLinks compact />
              </div>
            </div>
          )}
        </div>
      </header>



      {showHomeContent && (
        <main className="relative z-20 mx-auto w-full max-w-7xl px-0 pb-5 pt-0 sm:pb-6">



          {advertisements.length > 0 && (
            <div className="m-0 w-full bg-white p-0">
              <AdCarousel
                ads={
                  advertisements
                }
              />
            </div>
          )}



          <div className="px-3 pt-5 sm:px-6 sm:pt-6 lg:px-10">
            {loading ? (
              <div className="py-20 text-center font-body text-slate-500">
                Tegereza gato,
                amakuru arimo
                gushakwa...
              </div>
            ) : sortedPosts.length ===
              0 ? (
              <div className="py-20 text-center font-body text-slate-500">
                Nta makuru aboneka
                muri iki cyiciro.
              </div>
            ) : (
              <NewsPostsLayout
                posts={
                  sortedPosts
                }
                matchedPostId={
                  matchedPostId
                }
                postRefs={
                  postRefs
                }
              />
            )}
          </div>
        </main>
      )}
    </div>
  );
};

/* =========================================================
   EXPORT
========================================================= */

export default Navbar;