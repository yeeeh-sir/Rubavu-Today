import React, { useEffect, useMemo, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { getPosts } from "../services/api";
import { SiteSEO } from "../components/SEO/SEO";
import { getArticleUrl } from "../utils/slug";
import { useLanguage, translatePostsBatch } from "../context/LanguageContext";


const summarize = (text, maxWords = 10) => {
  if (!text) return "";
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ") + "...";
};


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
  const location = useLocation();
  const { language, t, setTranslating, setTranslationUnavailable } = useLanguage();



  const [originalPosts, setOriginalPosts] = useState([]);

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
  }, []);

  useEffect(() => {
    let cancelled = false;

    const translate = async () => {
      if (originalPosts.length === 0) return;

      if (language === "rw") {
        if (!cancelled) {
          setPosts(originalPosts);
          setTranslating(false);
          setTranslationUnavailable(false);
        }
        return;
      }

      setTranslating(true);
      setTranslationUnavailable(false);

      try {
        const translated = await translatePostsBatch(originalPosts, language);
        if (!cancelled) setPosts(translated);
      } catch (err) {
        if (!cancelled) setPosts(originalPosts);
      } finally {
        if (!cancelled) {
          setTranslating(false);
        }
      }
    };

    translate();

    return () => {
      cancelled = true;
    };
  }, [language, originalPosts, setTranslating, setTranslationUnavailable]);


  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setQuery(params.get("q") || "");
    setVisibleCount(16);
  }, [location.search]);


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

  const isSearching = query.trim().length > 0;
  const visiblePosts = sortedPosts.slice(0, visibleCount);
  const hasMore = sortedPosts.length > visibleCount;

  const handleLoadMore = () => setVisibleCount((prev) => prev + 8);





  const PostCard = ({ post }) => {
    const articleHref = getArticleUrl(post);
    const imageUrl = post.image || "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80";

    return (
      <Link to={articleHref} className="group block h-full">
        <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-red-200 hover:shadow-xl">
          <div className="relative overflow-hidden bg-slate-100">
            <div className="aspect-[16/11] overflow-hidden">
              {post.image ? (
                <img
                  src={imageUrl}
                  alt={post.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80";
                  }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-200 via-slate-100 to-slate-300">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{language === "rw" ? "Nta ishusho" : ""}</span>
                </div>
              )}
            </div>

          </div>

          <div className="flex flex-1 flex-col p-3 sm:p-3.5">
            <div className="mb-1.5 text-[9px] font-medium uppercase tracking-[0.12em] text-slate-500">
              <span>{formatDate(post.createdDate, language)}</span>
            </div>

            <h4 className="font-masthead text-sm font-extrabold leading-snug text-slate-900 transition-colors group-hover:text-red-600 sm:text-[15px]">
              {post.title}
            </h4>

            <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-slate-600">
              {summarize(post.summary || post.content, 10)}
            </p>

            <div className="mt-auto pt-2" />
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

  return (
    <div className="min-h-screen emotional-gradient-bg text-black flex flex-col font-body selection:bg-red-600 selection:text-white">
      <SiteSEO />
      <main className="flex-grow">

        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-0 pb-2">
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
            <div className="space-y-6">
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
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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

            <div className="space-y-0">

              <SectionHeader
                title={query.trim() ? (language === "rw" ? "Ibyavuye mu gushakisha" : t("search")) : ""}
              />


              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {visiblePosts.map((post) => (
                  <PostCard key={post.id || post._id} post={post} />
                ))}
              </div>


              {hasMore && (
                <div className="pt-8 pb-4 flex justify-center">
                  <button
                    onClick={handleLoadMore}
                    className="inline-flex items-center gap-2 rounded border border-slate-900 bg-slate-950 px-4 py-2 font-body text-[10px] font-bold uppercase tracking-[0.14em] text-white shadow-sm transition hover:border-red-600 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-200"
                  >
                    {language === "rw" ? "Soma Andi Makuru" : t("loadMore")} <span aria-hidden="true">→</span>
                  </button>
                </div>
              )}
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
