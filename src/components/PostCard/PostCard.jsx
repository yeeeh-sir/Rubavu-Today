import React, { useState } from "react";
import { Link } from "react-router-dom";
import { getArticleUrl } from "../../utils/slug";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=900&q=80";

const PostCard = ({ post }) => {
  const [copied, setCopied] = useState(false);

  const published = post?.createdDate
    ? new Date(post.createdDate).toLocaleDateString("rw-RW", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    : "Uyu munsi";


  const calculateReadTime = (text) => {
    if (!text) return "iminota 1 yo gusoma";
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `iminota ${minutes} yo gusoma`;
  };

  const contentText = post?.summary || post?.description || "";
  const readTime = calculateReadTime(contentText);
  const authorName = post?.Author || post?.author || "Rubavu Today";

  const getPostSlugPath = (entry) => getArticleUrl(entry);

  const handleShare = async (e) => {
    e.preventDefault();
    const postUrl = `${window.location.origin}${getPostSlugPath(post)}`;

    const title = post?.title || "Rubavu Today";
    const shareText = `${title}\n\n${postUrl}`;

    const shareData = {
      title,
      text: shareText,
      url: postUrl,
    };

    if (post?.image) {
      try {
        const response = await fetch(post.image);
        const blob = await response.blob();
        const file = new File([blob], "rubavu-today.jpg", { type: "image/jpeg" });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          shareData.files = [file];
        }
      } catch (err) {
        // fallback: share without image
      }
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // user cancelled
      }
    } else {
      navigator.clipboard.writeText(postUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <article className="group flex flex-col justify-between overflow-hidden border border-[#E5E3DC] bg-white transition hover:border-[#D8D5CC] shadow-sm hover:shadow-md">
      <div>

        <Link to={getPostSlugPath(post)} className="relative block aspect-[16/10] bg-[#F1EFE8] overflow-hidden">
          <img
            src={post.image || FALLBACK_IMAGE}
            alt={post.title}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = FALLBACK_IMAGE;
            }}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {post.category && (
            <span className="absolute left-3 top-3 bg-[#B3261E] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow">
              {post.category}
            </span>
          )}
        </Link>


        <div className="p-4 sm:p-5">

          <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wider text-[#888780] mb-2 font-medium">
            <time>{published}</time>
            <span>•</span>
            <span className="text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full lowercase text-[10px]">{readTime}</span>
            <span>•</span>
            <span className="truncate max-w-[100px]" title={authorName}>{authorName}</span>
          </div>

          <Link to={getPostSlugPath(post)}>
            <h2 className="font-masthead mt-1 text-lg sm:text-xl font-extrabold leading-snug text-[#161616] transition group-hover:text-[#B3261E]">
              {post.title}
            </h2>
          </Link>


          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#5F5E5A]">
            {contentText}
          </p>
        </div>
      </div>


      <div className="flex items-center justify-between border-t border-[#E5E3DC] bg-[#FAFAF7] px-4 sm:px-5 py-3 text-xs">
        <Link
          to={getPostSlugPath(post)}
          className="font-bold uppercase tracking-wider text-[#161616] transition hover:text-[#B3261E]"
        >
          Soma byinshi →
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-[#888780]" title="Abayirebye">👁 {post.views || 0}</span>
          <button
            type="button"
            onClick={handleShare}
            className="text-slate-600 hover:text-red-600 transition font-medium relative"
            title="Koporora ubutumwa"
          >
            {copied ? "Byakoporowe!" : "🔗 Sangiza"}
          </button>
        </div>
      </div>
    </article>
  );
};

export default PostCard;