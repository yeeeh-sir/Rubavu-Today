import React, { useEffect, useMemo, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { getPosts, getAdvertisements } from "../services/api";
import { SiteSEO } from "../components/SEO/SEO";
import { getArticleUrl } from "../utils/slug";
import { useLanguage } from "../context/LanguageContext";
import AdBanner from "../components/common/AdBanner";
import OptimizedImage from "../components/common/OptimizedImage";
import { RESOLUTION_WIDTHS } from "../utils/images";


const formatDate = (dateStr, language) => {
  if (!dateStr) return "";
  const locale = language === "fr" ? "fr-FR" : language === "sw" ? "sw-KE" : language === "en" ? "en-US" : "rw-RW";
  return new Date(dateStr).toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const Home = () => {
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [visibleCount, setVisibleCount] = useState(16);
  const [showMedia, setShowMedia] = useState(true);
  const [mediaSearch, setMediaSearch] = useState("");
  const location = useLocation();
  const { language, t } = useLanguage();



  const [originalPosts, setOriginalPosts] = useState([]);
  const [advertisements, setAdvertisements] = useState([]);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await getPosts();
        setOriginalPosts(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Ntibyashobotse kubona amakuru.");
      } finally {
        setLoading(false);
      }
    };
    loadPosts();

    const loadAds = async () => {
      try {
        const ads = await getAdvertisements();
        setAdvertisements(Array.isArray(ads) ? ads : []);
      } catch {
        setAdvertisements([]);
      }
    };
    loadAds();
  }, []);

  useEffect(() => {
    // Single-language site: show the original posts as-is.
    setPosts(originalPosts);
  }, [originalPosts]);


  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const nextQuery = params.get("q") || "";
    const nextCategory = params.get("category") || "";
    const isMediaPage = location.pathname === "/media" || location.pathname.includes("/media");

    setQuery(nextQuery);
    setVisibleCount(16);

    if (isMediaPage || nextCategory || nextQuery) {
      setShowMedia(false);
    } else if (!nextCategory && !nextQuery && !location.pathname.includes("/post/")) {
      setShowMedia(true);
    }
  }, [location.search, location.pathname]);

  const filteredPosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter((post) =>
      [post.title, post.summary, post.content, post.category].some(
        (item) => item && item.toString().toLowerCase().includes(q)
      )
    );
  }, [posts, query]);


  const sortedPosts = useMemo(() => {
    return [...filteredPosts].sort(
      (a, b) => new Date(b.createdDate || 0) - new Date(a.createdDate || 0)
    );
  }, [filteredPosts]);

  const mediaPosts = useMemo(() => {
    return [...sortedPosts]
      .filter((post) => post.image || post.youtube_url)
      .slice(0, 6)
      .map((post) => ({
        ...post,
        articleHref: getArticleUrl(post),
      }));
  }, [sortedPosts]);

  const sidebarPosts = useMemo(() => {
    const allRecent = [...sortedPosts].map((post) => ({
      ...post,
      articleHref: getArticleUrl(post),
    }));

    return allRecent.slice(0, 6);
  }, [sortedPosts]);

  const filteredMediaPosts = useMemo(() => {
    const term = mediaSearch.trim().toLowerCase();
    const sourcePosts = mediaPosts.length >= 3 ? mediaPosts : sidebarPosts;

    if (!term) return sourcePosts;

    return sourcePosts.filter((post) => {
      const combined = [
        post.title,
        post.summary,
        post.category,
        post.youtube_url,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return combined.includes(term);
    });
  }, [mediaPosts, sidebarPosts, mediaSearch]);

  const isSearching = query.trim().length > 0;
  const visiblePosts = sortedPosts.slice(0, visibleCount);
  const hasMore = sortedPosts.length > visibleCount;

  const handleLoadMore = () => setVisibleCount((prev) => prev + 8);





  const PostCard = ({ post }) => {
    const articleHref = getArticleUrl(post);
    const imageUrl = post.image || "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80";

    return (
      <Link to={articleHref} className="group block h-full">
        <article className="flex h-24 flex-row overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-colors hover:bg-slate-50 hover:shadow-md">
          <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-slate-100 sm:w-24">
            {post.image ? (
              <OptimizedImage
                src={imageUrl}
                alt={post.title}
                widths={RESOLUTION_WIDTHS.CARD}
                sizes="96px"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80";
                }}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <img src="/Rubavu.jpeg" alt="" className="h-full w-full object-cover" loading="lazy" width="320" height="180" />
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-center px-2.5 py-2">
            {post.category && <span className="mb-0.5 truncate text-[8px] font-bold uppercase tracking-wider text-red-600">{post.category}</span>}

            <h4 className="break-words line-clamp-2 font-masthead text-[12px] font-extrabold leading-tight text-slate-900 transition-colors group-hover:text-red-600 sm:text-[13px]">
              {post.title}
            </h4>

            {post.createdDate && <time className="mt-1 text-[8px] font-medium text-slate-400">{formatDate(post.createdDate, language)}</time>}
          </div>
        </article>
      </Link>
    );
  };

  const SectionHeader = ({ title }) => {
    if (!title) return null;

    return (
      <div className="mb-0 sm:mb-0">
        <h3 className="font-masthead text-xl font-black uppercase tracking-tight text-slate-900 sm:text-2xl">
          {title}
        </h3>
      </div>
    );
  };

  const MediaSidebar = () => {
    const sourcePosts = filteredMediaPosts.length > 0 ? filteredMediaPosts : sidebarPosts;

    return (
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm sm:p-3">
          <button
            type="button"
            onClick={() => setShowMedia((prev) => !prev)}
            className="flex w-full items-center justify-between gap-2 rounded-md border border-slate-900 bg-slate-950 px-2.5 py-1.5 sm:px-3 sm:py-2 font-body text-[8px] xs:text-[9px] sm:text-[10px] font-black uppercase tracking-[0.14em] sm:tracking-[0.16em] text-white shadow-sm transition hover:border-red-600 hover:bg-red-600"
          >
            <span className="truncate">PHOTOS &amp; VIDEOS</span>
            <span className="flex shrink-0 items-center gap-1 text-[10px] sm:text-[12px] leading-none">
              <span aria-hidden="true">{showMedia ? "−" : "+"}</span>
              {showMedia ? (
                <span aria-label="Leave media panel" className="text-[9px] sm:text-[10px]">X</span>
              ) : (
                <span aria-label="Return to media panel" className="text-[9px] sm:text-[10px]">↺</span>
              )}
            </span>
          </button>

          {showMedia && (
            <div className="mt-3">
              <div className="mb-3 flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 sm:px-2.5 sm:py-2">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-500 fill-none stroke-current stroke-2">
                  <circle cx="11" cy="11" r="6"></circle>
                  <path d="M16 16l5 5"></path>
                </svg>
                <input
                  type="text"
                  value={mediaSearch}
                  onChange={(e) => setMediaSearch(e.target.value)}
                  placeholder="Shakisha amafoto / video..."
                  className="w-full border-0 bg-transparent text-[9px] xs:text-[10px] text-slate-700 placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              <div className="space-y-0">
                {sourcePosts.length > 0 ? (
                  sourcePosts.slice(0, 3).map((post) => (
                    <div
                      key={post.id || post._id || post.title}
                      className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50 shadow-sm"
                    >
                      <Link to={post.articleHref} className="block overflow-hidden bg-slate-100">
                        <div className="aspect-[4/3] overflow-hidden">
                          <OptimizedImage
                            src={post.image || "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=900&q=80"}
                            alt={post.title}
                            widths={RESOLUTION_WIDTHS.THUMB}
                            sizes="(max-width: 1024px) 40vw, 300px"
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                          />
                        </div>
                      </Link>

                      <div className="p-2.5">
                        <Link
                          to={post.articleHref}
                          className="block font-body text-[10px] font-bold leading-snug text-slate-900 transition-colors hover:text-red-600"
                        >
                          {post.title}
                        </Link>

                        {post.youtube_url && (
                          <a
                            href={post.youtube_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center gap-1 rounded bg-red-600 px-2 py-1 font-body text-[8px] font-bold uppercase tracking-[0.12em] text-white transition hover:bg-red-700"
                          >
                            Video
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-center">
                    <p className="font-body text-[10px] font-semibold text-slate-500">
                      Nta mafoto cyangwa video bihuye n'ibisubizo.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </aside>
    );
  };

  return (
    <div className="min-h-screen emotional-gradient-bg text-black flex flex-col font-body selection:bg-red-600 selection:text-white">
      <SiteSEO />
      <main className="flex-grow">
        <section className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 pt-2 pb-2">
          {loading ? null : error ? (
            /* Error State */
            <div className="bg-red-50 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 max-w-lg mx-auto text-center my-12">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-600 text-white mb-3 border border-black font-bold text-lg">
                !
              </div>
              <h3 className="text-xl font-black text-red-600 uppercase tracking-wide">
                Habaye ikibazo
              </h3>
              <p className="text-slate-800 font-medium mt-2 text-sm">{error}</p>
            </div>
          ) : isSearching ? (
            /* ==================== SEARCH RESULTS VIEW ==================== */
            <div className="space-y-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-4">
                <div>
                  <h2 className="font-masthead text-2xl font-black text-slate-900">
                    {language === "rw" ? "Ibyavuye mu gushakisha" : t("search")}
                  </h2>
                  <p className="mt-1 break-words text-sm text-slate-600">
                    <span className="font-semibold">"{query}"</span> — {language === "rw"
                      ? `habonetse ${sortedPosts.length} ${sortedPosts.length === 1 ? "igisubizo" : "ibisubizo"}`
                      : `${sortedPosts.length} ${sortedPosts.length === 1 ? t("result") : t("results")}`}
                  </p>
                </div>

              </div>

              {sortedPosts.length > 0 ? (
                <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {sortedPosts.map((post) => (
                    <PostCard key={post.id || post._id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-8 max-w-md mx-auto text-center my-12">
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                    {t("noPostsFound")}
                  </h3>
                  <p className="text-slate-600 font-medium mt-2 text-sm">
                    {language === "rw" ? "Ongera ugerageze ukoresheje andi magambo." : t("tryAgain")}
                  </p>
                </div>
              )}
            </div>
          ) : sortedPosts.length > 0 ? (

            <div className="space-y-6">

              <SectionHeader
                title={query.trim() ? (language === "rw" ? "Ibyavuye mu gushakisha" : t("search")) : ""}
              />

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start lg:gap-6">
                <MediaSidebar />

                <div className="min-w-0">
                  {advertisements[0] && advertisements[0].image && (
                    <div className="my-4 xs:my-5 sm:my-6 flex justify-center print:hidden">
                      <AdBanner ad={advertisements[0]} size="728x90" />
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {visiblePosts.map((post) => (
                      <PostCard key={post.id || post._id} post={post} />
                    ))}
                  </div>

                  {advertisements[1] && advertisements[1].image && hasMore && (
                    <div className="my-0 flex justify-center print:hidden">
                      <AdBanner ad={advertisements[1]} size="728x90" />
                    </div>
                  )}

                  {hasMore && (
                    <div className="flex justify-center py-2">
                      <button
                        onClick={handleLoadMore}
                        className="inline-flex items-center gap-2 rounded sm:rounded-md border border-slate-900 bg-slate-950 px-3 xs:px-4 py-1.5 xs:py-2 font-body text-[9px] xs:text-[10px] font-bold uppercase tracking-[0.14em] text-white shadow-sm transition hover:border-red-600 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-200"
                      >
                        {language === "rw" ? "Soma Andi Makuru" : t("loadMore")} <span aria-hidden="true">→</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (

            <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-8 max-w-md mx-auto text-center my-12">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                {t("noPostsFound")}
              </h3>
              <p className="text-slate-600 font-medium mt-2 text-sm">
                {language === "rw" ? "Nta nkuru zihari ubu. Ongera ugerageze nyuma." : t("noPostsNow")}
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Home;
