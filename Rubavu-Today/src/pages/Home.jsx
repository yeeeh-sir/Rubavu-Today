import React, { useEffect, useMemo, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { getPosts } from "../services/api";
import { SiteSEO } from "../components/SEO/SEO";


const summarize = (text, maxWords = 10) => {
  if (!text) return "";
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ") + "...";
};


const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("rw-RW", {
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



  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await getPosts();
        setPosts(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Ntibyashobotse kubona amakuru.");
      } finally {
        setLoading(false);
      }
    };
    loadPosts();
  }, []);


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
    const postId = post.id || post._id;
    const articleHref = post.slug ? `/${post.slug}.html` : `/post/${postId}`;
    return (
      <Link to={articleHref} className="group block">
        <article className="flex flex-col h-full bg-white border border-slate-200 rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="relative overflow-hidden bg-slate-100 h-40 sm:h-44">
            {post.image ? (
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                <span className="text-slate-400 text-[10px]">Nta ishusho</span>
              </div>
            )}
          </div>
          <div className="p-3 flex flex-col flex-grow">
            <span className="text-red-600 text-[9px] font-bold uppercase tracking-widest">
              {post.category}
            </span>
            <h4 className="font-masthead text-sm font-bold text-slate-900 leading-snug group-hover:text-red-600 transition-colors line-clamp-2 mt-1">
              {post.title}
            </h4>
            <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-2 mt-1">
              {summarize(post.summary || post.content, 12)}
            </p>
            <div className="mt-auto pt-2 flex items-center gap-2 text-[10px] text-slate-400 font-mono">
              <span>Rubavu Today</span>
              <span>•</span>
              <span>{formatDate(post.createdDate)}</span>
            </div>
          </div>
        </article>
      </Link>
    );
  };

  const SectionHeader = ({ title, count }) => (
    <div className="flex items-end justify-between border-b-2 border-black pb-3 mb-6">
      <h3 className="font-masthead text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
        {title}
      </h3>
      {count !== undefined && (
        <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">
          {count} Byose
        </span>
      )}
    </div>
  );

  return (
    <div className="min-h-screen emotional-gradient-bg text-black flex flex-col font-body selection:bg-red-600 selection:text-white">
      <SiteSEO />
      <main className="flex-grow">

        <section className="bg-white border-b-2 border-black py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-dashed border-slate-300 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-red-600 inline-block"></span>
                <span className="font-mono text-xs uppercase tracking-widest text-slate-700 font-bold">
                  Rubavu Today • Amakuru Mashya & Igazeti Y'ibanze
                </span>
              </div>
              <div className="font-mono text-xs text-slate-500">
                {new Date().toLocaleDateString("rw-RW", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>
        </section>


        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {loading ? (
            /* Loading Skeleton */
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-slate-200 h-40 sm:h-44 rounded-sm"></div>
                  <div className="mt-2 space-y-2">
                    <div className="bg-slate-200 h-3 w-16"></div>
                    <div className="bg-slate-200 h-4 w-full"></div>
                    <div className="bg-slate-200 h-3 w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
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
                    Ibyavuye mu gushakisha
                  </h2>
                  <p className="mt-1 break-words text-sm text-slate-600">
                    <span className="font-semibold">"{query}"</span> — habonetse {sortedPosts.length} {sortedPosts.length === 1 ? "igisubizo" : "ibisubizo"}
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
                    Nta makuru ahari
                  </h3>
                  <p className="text-slate-600 font-medium mt-2 text-sm">
                    Ongera ugerageze ukoresheje andi magambo.
                  </p>
                </div>
              )}
            </div>
          ) : sortedPosts.length > 0 ? (

            <div className="space-y-14">

              <SectionHeader
                title={query.trim() ? "Ibyavuye mu gushakisha" : "Amakuru agezweho"}
                count={sortedPosts.length}
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
                    Soma Andi Makuru <span aria-hidden="true">→</span>
                  </button>
                </div>
              )}
            </div>
          ) : (

            <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-8 max-w-md mx-auto text-center my-12">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                Nta makuru ahari
              </h3>
              <p className="text-slate-600 font-medium mt-2 text-sm">
                Nta nkuru zihari ubu. Ongera ugerageze nyuma.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Home;
