import React, { useEffect, useState, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import rubavuLogo from "../Rubavu.jpeg";
import { API_ROOT as API_URL, getPostById, getPostBySlug, getPosts, commitCommentReaction } from "../services/api";
import { ArticleSEO } from "../components/SEO/SEO";
import SocialShare from "../components/SocialShare/SocialShare";
import { getPostSlug, getArticleUrl } from "../utils/slug";
import { useLanguage, translatePostsBatch } from "../context/LanguageContext";



export default function PostDetails() {
  const { id, slug } = useParams();
  const navigate = useNavigate();
  const { language, t, setTranslating, setTranslationUnavailable } = useLanguage();

  const [post, setPost] = useState(null);
  const [originalPost, setOriginalPost] = useState(null);
  const [originalAllPosts, setOriginalAllPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [commentStatus, setCommentStatus] = useState("");

  const [name, setName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replyName, setReplyName] = useState("");

  const [reactions, setReactions] = useState(() => {
    try {
      const stored = localStorage.getItem("rubavu_comment_reactions");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const getDeviceId = () => {
    let id = localStorage.getItem("rubavu_device_id");
    if (!id) {
      id = (
        "dv-" +
        Date.now().toString(36) +
        "-" +
        Math.random().toString(36).slice(2, 12)
      );
      localStorage.setItem("rubavu_device_id", id);
    }
    return id;
  };
  const myDeviceId = getDeviceId();

  const persistReactions = (next) => {
    setReactions(next);
    localStorage.setItem(
      "rubavu_comment_reactions",
      JSON.stringify(next)
    );
  };

  const applyCommentReaction = (comment, commentId, action) => {
    if (!commentId) return comment;
    const previous = comment.my_reaction || null;
    const nextAction =
      previous === action ? null : action;

    let likes = comment.likes || 0;
    let dislikes = comment.dislikes || 0;

    if (previous === "like") likes -= 1;
    if (previous === "dislike") dislikes -= 1;
    if (nextAction === "like") likes += 1;
    if (nextAction === "dislike") dislikes += 1;

    return {
      ...comment,
      likes: Math.max(0, likes),
      dislikes: Math.max(0, dislikes),
      my_reaction: nextAction,
    };
  };

  const handleCommentReaction = async (commentId, action, e) => {
    if (e) e.stopPropagation();
    if (!commentId) return;

    const comment = comments.find((c) => c.id === commentId);
    const previous = comment?.my_reaction || null;
    const nextAction = previous === action ? null : action;
    const optimistic = applyCommentReaction(
      comment,
      commentId,
      action
    );

    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? optimistic : c))
    );

    const nextReactions = {
      ...reactions,
      [commentId]: nextAction,
    };
    persistReactions(nextReactions);

    try {
      const result = await commitCommentReaction(
        commentId,
        nextAction || "none",
        myDeviceId
      );
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? {
              ...c,
              likes: result.likes,
              dislikes: result.dislikes,
              my_reaction: result.my_reaction,
            }
            : c
        )
      );
    } catch (error) {
      const rollback = {
        ...reactions,
        [commentId]: previous,
      };
      persistReactions(rollback);
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? {
              ...c,
              likes: comment.likes || 0,
              dislikes: comment.dislikes || 0,
              my_reaction: previous,
            }
            : c
        )
      );
    }
  };


  const [sliderIndex, setSliderIndex] = useState(0);

  const imageContainerRef = useRef(null);






  useEffect(() => {
    let cancelled = false;

    const loadArticle = async () => {
      setLoading(true);
      setError("");

      try {
        const numericId = /^\d+$/.test(String(id || "").trim())
          ? String(id).trim()
          : null;

        const slugValue = String(slug || "")
          .replace(/\.html$/i, "")
          .trim()
          .replace(/\/+$/, "");

        let postData = null;
        let all = [];

        if (numericId) {
          postData = await getPostById(numericId);
          if (cancelled) return;

          if (!postData) {
            setPost(null);
            setComments([]);
            setLoading(false);
            return;
          }

          const canonicalSlug = getPostSlug(postData);
          if (canonicalSlug && canonicalSlug !== slugValue) {
            navigate(`/${canonicalSlug}.html`, { replace: true });
          }
        }

        if (slugValue) {
          postData = await getPostBySlug(slugValue);
          if (cancelled) return;
        }

        if (postData) {
          const list = await getPosts();
          if (cancelled) return;
          all = Array.isArray(list) ? list : [];
        }

        if (cancelled) return;

        if (!postData) {
          setPost(null);
          setComments([]);
          setLoading(false);
          return;
        }

        setOriginalPost(postData);
        setPost(postData);

        const postId = postData.id ?? postData._id;

        const commentsRes = await fetch(
          `${API_URL}/api/comments/${postId}?device_id=${encodeURIComponent(
            myDeviceId
          )}`
        );
        const commentsData = await commentsRes.json();

        if (cancelled) return;

        const commentList = Array.isArray(commentsData)
          ? commentsData
          : [];
        setComments(commentList);

        const merged = { ...reactions };
        commentList.forEach((c) => {
          if (c.my_reaction) {
            merged[String(c.id)] = c.my_reaction;
          }
        });
        persistReactions(merged);

        setOriginalAllPosts(all);
        setAllPosts(all);
        setLoading(false);

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      } catch (err) {
        console.error("Ikibazo mu gushaka amakuru:", err);

        if (cancelled) return;

        setPost(null);
        setComments([]);
        setLoading(false);
        setError(
          "Habaye ikibazo mu kohereza inkuru. Ongera ugerageze."
        );
      }
    };

    loadArticle();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, slug, reloadKey]);





  useEffect(() => {
    setSliderIndex(0);
  }, [id]);


  useEffect(() => {
    let cancelled = false;

    const translate = async () => {
      if (!originalPost) return;

      if (language === "rw") {
        if (!cancelled) {
          setPost(originalPost);
          setAllPosts(originalAllPosts);
          setTranslating(false);
          setTranslationUnavailable(false);
        }
        return;
      }

      setTranslating(true);
      setTranslationUnavailable(false);

      try {
        const combined = [originalPost, ...originalAllPosts].filter(Boolean);
        const translatedCombined = await translatePostsBatch(combined, language);

        if (cancelled) return;

        if (translatedCombined && translatedCombined.length > 0) {
          setPost(translatedCombined[0]);
          if (originalAllPosts.length > 0) {
            setAllPosts(translatedCombined.slice(1));
          }
        }
      } catch (err) {
        if (!cancelled) {
          setPost(originalPost);
          setAllPosts(originalAllPosts);
        }
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
  }, [language, originalPost, originalAllPosts, setTranslating, setTranslationUnavailable]);






  useEffect(() => {
    const otherPosts = allPosts.filter(
      (p) => (p._id || p.id)?.toString() !== id?.toString()
    );

    if (otherPosts.length <= 3) {
      return;
    }

    const timer = setInterval(() => {
      setSliderIndex((current) => {
        if (current >= otherPosts.length - 3) {
          return 0;
        }

        return current + 1;
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [allPosts, id]);





  const getImageUrl = (image) => {
    if (!image) return null;

    const value = String(image).trim();

    if (/^https?:\/\//i.test(value)) {
      return value.replace(/^http:\/\//i, "https://");
    }

    if (value.startsWith("/")) {
      return `${API_URL}${value}`;
    }

    if (value.startsWith("uploads/")) {
      return `${API_URL}/${value}`;
    }

    return `${API_URL}/uploads/${value}`;
  };





  const triggerWatermarkedDownload = () => {
    if (!post?.image) return;

    const imgUrl = getImageUrl(post.image);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const imageObj = new Image();

    imageObj.crossOrigin = "anonymous";
    imageObj.src = imgUrl;

    imageObj.onload = () => {
      canvas.width = imageObj.naturalWidth;
      canvas.height = imageObj.naturalHeight;

      ctx.drawImage(imageObj, 0, 0);

      const fontSize = Math.max(
        Math.floor(canvas.width * 0.04),
        24
      );

      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.shadowColor = "rgba(0,0,0,0.8)";
      ctx.shadowBlur = 8;
      ctx.textAlign = "left";
      ctx.textBaseline = "bottom";

      const padding = canvas.width * 0.02;
      ctx.fillText(
        "© Rubavu Today",
        padding,
        canvas.height - padding
      );

      const link = document.createElement("a");

      link.download = `${post.title
        ? post.title.replace(/[^a-zA-Z0-9]/g, "_")
        : "rubavu-today"
        }-watermarked.jpg`;

      link.href = canvas.toDataURL("image/jpeg", 0.9);

      link.click();
    };
  };

  const handleImageContextMenu = (e) => {
    e.preventDefault();
    triggerWatermarkedDownload();
  };





  const getEmbedUrl = (url) => {
    if (!url) return null;

    let videoId = "";

    if (url.includes("youtu.be/")) {
      videoId = url
        .split("youtu.be/")[1]
        ?.split("?")[0];
    } else if (url.includes("watch?v=")) {
      videoId = url
        .split("watch?v=")[1]
        ?.split("&")[0];
    }

    return videoId
      ? `https://www.youtube.com/embed/${videoId}`
      : null;
  };





  // Open any related post in full using its title-based slug URL (e.g. /slug.html).
  const openPostFull = (p) => (e) => {
    if (e) e.preventDefault();
    const url = getArticleUrl(p);
    if (url && url !== "/") {
      navigate(url);
    }
  };

  const getAuthorName = (p) => {
    if (!p) return "Unknown Author";

    if (
      typeof p.Author === "string" &&
      p.Author.trim() !== ""
    ) {
      return p.Author.trim();
    }

    if (
      typeof p.author === "string" &&
      p.author.trim() !== ""
    ) {
      return p.author.trim();
    }

    if (
      p.author &&
      typeof p.author === "object"
    ) {
      return (
        p.author.name ||
        p.author.username ||
        p.author.full_name ||
        p.author.email ||
        "Unknown Author"
      );
    }

    return (
      p.user_name ||
      p.username ||
      p.postedBy ||
      p.authorName ||
      p.author_name ||
      p.full_name ||
      "Staff Member"
    );
  };

  const isPostByAdmin = (p) => {
    const authorName = getAuthorName(p).toLowerCase();

    const role = (
      p.role ||
      p.user_role ||
      p.type ||
      ""
    ).toLowerCase();

    const userObjRole =
      p.author &&
        typeof p.author === "object"
        ? (p.author.role || "").toLowerCase()
        : "";

    return (
      role === "admin" ||
      userObjRole === "admin" ||
      authorName.includes("admin") ||
      authorName === "rubavutoday" ||
      p.is_admin === true ||
      p.isAdmin === true
    );
  };





  const handleCommentSubmit = async (
    e,
    parentId = null
  ) => {
    e.preventDefault();

    const currentName = parentId
      ? replyName
      : name;

    const currentText = parentId
      ? replyText
      : commentText;

    if (!currentName || !currentText) {
      setCommentStatus("Andika amazina n'igitekerezo mbere yo kohereza.");
      return;
    }

    setCommentStatus("Ohereza igitekerezo...");

    try {
      const res = await fetch(
        `${API_URL}/api/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            post_id: post?._id || post?.id || id || slug,
            name: currentName,
            comment: currentText,
            parent_id: parentId,
          }),
        }
      );

      const newComment = await res.json();

      if (res.ok) {
        setComments((prev) => [
          ...prev,
          newComment,
        ]);

        if (parentId) {
          setReplyingTo(null);
          setReplyText("");
          setReplyName("");
        } else {
          setName("");
          setCommentText("");
        }
        setCommentStatus("Igitekerezo cyawe cyoherejwe.");
      } else {
        setCommentStatus(newComment?.error || "Igitekerezo nticyoherejwe.");
      }
    } catch (error) {
      setCommentStatus("Habaye ikibazo. Ongera ugerageze.");
      console.error(
        "Ikibazo mu kohereza igitekerezo:",
        error
      );
    }
  };





  const otherPosts = allPosts.filter(
    (p) =>
      (p._id || p.id)?.toString() !==
      id?.toString()
  ).slice(0, 16);

  const maxSliderIndex = Math.max(
    otherPosts.length - 3,
    0
  );

  const nextSlide = () => {
    setSliderIndex((current) => {
      if (current >= maxSliderIndex) {
        return 0;
      }

      return current + 1;
    });
  };

  const previousSlide = () => {
    setSliderIndex((current) => {
      if (current <= 0) {
        return maxSliderIndex;
      }

      return current - 1;
    });
  };





  if (loading) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {language === "rw" ? "Habaye ikibazo" : t("somethingWentWrong")}
        </h2>

        <p className="text-gray-600 mb-6">{error}</p>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            className="rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            {language === "rw" ? "Ongera Ugerageze" : t("retry")}
          </button>

          <Link
            to="/"
            className="rounded border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
          >
            {language === "rw" ? "← Subira ku Ahabanza" : t("backHome")}
          </Link>
        </div>
      </div>
    );
  }



  if (!post || post.error) {
    return null;
  }






  const adminPost = isPostByAdmin(post);

  const authorName = adminPost
    ? "RubavuToday"
    : getAuthorName(post);

  const employeeInitial = authorName
    .trim()
    .charAt(0)
    .toUpperCase();

  const postDate =
    post.createdDate ||
    post.created_at ||
    post.createdAt ||
    post.date;

  const locale = language === "fr" ? "fr-FR" : language === "sw" ? "sw-KE" : language === "en" ? "en-US" : "rw-RW";

  const formattedDate = postDate
    ? new Date(postDate).toLocaleDateString(
      locale,
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    )
    : language === "rw" ? "Uyu munsi" : "";

  const embedUrl = getEmbedUrl(
    post.youtube_url
  );

  const topLevelComments =
    comments.filter(
      (c) => !c.parent_id
    );





  return (
    <div className="min-h-screen bg-gray-50">

      <ArticleSEO post={post} />

      {otherPosts.length > 0 && (
        <section className="w-full bg-white border-b border-gray-200 print:hidden">

          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-5">

            <div className="flex items-center justify-between mb-4">

              <div>
                <h2 className="text-lg sm:text-xl font-black text-gray-900">
                  {language === "rw" ? "Andi Makuru" : t("otherStories")}
                </h2>

                <p className="text-xs text-gray-500">
                  {language === "rw" ? "Izindi nkuru" : t("moreStories")}
                </p>
              </div>

              {otherPosts.length > 3 && (
                <div className="flex gap-2">

                  <button
                    type="button"
                    onClick={previousSlide}
                    className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-red-600 transition"
                    aria-label="Previous posts"
                  >
                    ←
                  </button>

                  <button
                    type="button"
                    onClick={nextSlide}
                    className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-red-600 transition"
                    aria-label="Next posts"
                  >
                    →
                  </button>

                </div>
              )}

            </div>



            <div className="overflow-hidden">

              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{
                  transform: `translateX(-${sliderIndex * (100 / 3)
                    }%)`,
                }}
              >

                {otherPosts.map((p) => {

                  const pId =
                    p._id || p.id;

                  return (
                    <div
                      key={pId}
                      className="flex-shrink-0 w-full sm:w-1/2 lg:w-1/3 px-2"
                    >

                      <Link
                        to={getArticleUrl(p)}
                        onClick={openPostFull(p)}
                        className="block bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition"
                      >

                        {p.image ? (
                          <div className="h-40 overflow-hidden bg-gray-100">

                            <img
                              src={getImageUrl(
                                p.image
                              )}
                              alt={p.title}
                              className="w-full h-full object-cover"
                            />

                          </div>
                        ) : (
                          <div className="h-40 bg-gray-200 flex items-center justify-center text-gray-400 text-sm">
                            {language === "rw" ? "Nta foto" : t("noPhoto")}
                          </div>
                        )}

                        <div className="p-3">

                          <span className="inline-block bg-red-600 text-white text-[9px] uppercase font-bold px-2 py-1 rounded mb-2">
                            {p.category ||
                              "Inkuru"}
                          </span>

                          <h3 className="font-black text-gray-900 text-sm sm:text-base leading-snug line-clamp-2">
                            {p.title}
                          </h3>

                          <p className="text-xs text-gray-500 mt-2">
                            {language === "rw" ? "Soma inkuru yose" : t("readStory")} →
                          </p>

                        </div>

                      </Link>

                    </div>
                  );
                })}

              </div>

            </div>



            {otherPosts.length > 3 && (
              <div className="flex justify-center gap-1.5 mt-4">

                {Array.from({
                  length:
                    maxSliderIndex + 1,
                }).map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() =>
                      setSliderIndex(index)
                    }
                    className={`h-1.5 rounded-full transition-all ${index === sliderIndex
                      ? "w-7 bg-red-600"
                      : "w-2 bg-gray-300"
                      }`}
                    aria-label={`Go to slide ${index + 1
                      }`}
                  />
                ))}

              </div>
            )}

          </div>

        </section>
      )}



      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6">

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-6 lg:gap-6">



          <aside className="print:hidden order-2 lg:order-1 lg:col-span-1">

            <div className="lg:sticky lg:top-6 lg:max-w-[240px] lg:mx-auto">

              <h3 className="mb-3 border-l-4 border-red-600 pl-2 text-sm font-black uppercase">
                {language === "rw" ? "Andi Makuru" : t("otherStories")}
              </h3>

              <div className="space-y-3">

                {otherPosts
                  .slice(0, 6)
                  .map((p) => {

                    const pId =
                      p._id || p.id;

                    return (
                      <Link
                        key={pId}
                        to={getArticleUrl(p)}
                        onClick={openPostFull(p)}
                        className="flex gap-3 rounded-md border border-gray-200 bg-white p-2 transition hover:shadow-sm"
                      >

                        {p.image && (
                          <img
                            src={getImageUrl(
                              p.image
                            )}
                            alt={p.title}
                            className="h-16 w-20 flex-shrink-0 rounded object-cover"
                          />
                        )}

                        <div>
                          <span className="text-[9px] uppercase text-red-600 font-bold">
                            {p.category ||
                              "Inkuru"}
                          </span>

                          <h4 className="font-bold text-xs text-gray-900 line-clamp-3">
                            {p.title}
                          </h4>
                        </div>

                      </Link>
                    );
                  })}

              </div>

            </div>

          </aside>



          <main
            id="printable-article"
            className="order-1 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 lg:order-2 lg:col-span-4 lg:p-8"
          >



            <Link
              to="/"
              className="print:hidden inline-flex text-blue-600 hover:text-blue-800 font-semibold text-sm mb-6"
            >
              {language === "rw" ? "← Subira ku Ahabanza" : t("backHome")}
            </Link>



            <div className="mb-5">
              <span className="bg-red-600 text-white text-xs uppercase font-bold px-3 py-1 rounded">
                {post.category ||
                  "Inkuru"}
              </span>
            </div>



            <div className="mb-5 bg-gray-50 border rounded-lg p-4">

              <div className="flex items-center gap-3">

                {adminPost ? (
                  <div className="relative flex-shrink-0">

                    <img
                      src={rubavuLogo}
                      alt="RubavuToday"
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                    />



                    <span
                      className="absolute -right-1 -bottom-1 w-5 h-5 bg-blue-600 rounded-full border-2 border-white shadow-md flex items-center justify-center"
                      title="Verified RubavuToday"
                      aria-label="Verified RubavuToday"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="w-3.5 h-3.5 text-white fill-none stroke-current"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12.5l4 4L19 7.5" />
                      </svg>
                    </span>

                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-lg">
                    {employeeInitial || "E"}
                  </div>
                )}

                <div>

                  <div className="flex items-center gap-2">

                    <span className="text-sm font-bold text-red-600">
                      {language === "rw" ? "Yanditswe Na:" : t("writtenBy")}
                    </span>

                    <span className="text-sm font-bold text-gray-900">
                      {authorName}
                    </span>



                    {adminPost && (
                      <span
                        className="inline-flex items-center justify-center w-5 h-5 bg-blue-600 rounded-full shadow-sm"
                        title="Verified RubavuToday"
                        aria-label="Verified RubavuToday"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          className="w-3.5 h-3.5 text-white fill-none stroke-current"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 12.5l4 4L19 7.5" />
                        </svg>
                      </span>
                    )}

                  </div>

                  <div className="text-xs text-gray-500 mt-1">
                    {language === "rw" ? "Yanditswe ku wa" : t("publishedOn")}{" "}
                    <strong>
                      {formattedDate}
                    </strong>
                  </div>

                </div>

              </div>

            </div>



            <div className="print:hidden flex justify-end mb-4">

              <SocialShare post={post} />

            </div>



            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-black leading-tight mb-6">
              {post.title}
            </h1>



            {post.image && (
              <div className="mb-8">

                <div
                  ref={imageContainerRef}
                  onContextMenu={
                    handleImageContextMenu
                  }
                  className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50 shadow-sm"
                >

                  <img
                    src={getImageUrl(post.image)}
                    alt={post.title || "Rubavu Today article image"}
                    className="block h-auto w-full select-none object-contain"
                    draggable="false"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                    width="1200"
                    height="675"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = rubavuLogo;
                    }}
                  />

                  <div className="absolute bottom-3 left-3 bg-black/75 text-white text-xs px-2 py-1 rounded">
                    © Rubavu Today
                  </div>

                </div>

                <div className="print:hidden flex justify-end mt-2">

                  <button
                    onClick={
                      triggerWatermarkedDownload
                    }
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded"
                  >
                    ↓ Download Image
                  </button>

                </div>

              </div>
            )}



            <div className="text-gray-900 text-base sm:text-lg leading-relaxed whitespace-pre-line mb-10 border-b pb-8">
              {post.description}
            </div>



            {embedUrl && (
              <div className="mb-10 print:hidden">

                <div className="relative w-full aspect-video bg-black rounded overflow-hidden">

                  <iframe
                    src={embedUrl}
                    title="YouTube video player"
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />

                </div>

              </div>
            )}



            <section className="mt-8 print:hidden">

              <h3 className="text-xl font-bold mb-6 border-b pb-3">
                {language === "rw" ? "Ibitekerezo" : t("comments")} ({comments.length})
              </h3>



              <form
                onSubmit={handleCommentSubmit}
                className="bg-gray-50 p-4 rounded border mb-8"
              >

                <h4 className="font-bold mb-3 text-sm">
                  {language === "rw" ? "Tanga igitekerezo cyawe" : t("leaveComment")}
                </h4>

                <input
                  type="text"
                  placeholder={language === "rw" ? "Amazina yawe" : t("yourName")}
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  className="w-full sm:w-1/2 p-2 border rounded mb-3"
                  required
                />

                <textarea
                  placeholder={language === "rw" ? "Andika igitekerezo cyawe hano..." : t("commentPlaceholder")}
                  value={commentText}
                  onChange={(e) =>
                    setCommentText(
                      e.target.value
                    )
                  }
                  rows="3"
                  className="w-full p-2 border rounded mb-3"
                  required
                />

                <button
                  type="submit"
                  className="rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {language === "rw" ? "Ohereza Igitekerezo" : t("sendComment")}
                </button>

                {commentStatus && (
                  <p className="mt-2 text-xs font-medium text-slate-600" role="status">
                    {commentStatus}
                  </p>
                )}

              </form>



              <div className="space-y-4">

                {topLevelComments.length === 0 ? (
                  <p className="text-gray-500 italic text-sm">
                    {language === "rw" ? "Nta bitekerezo birabaho." : t("noComments")}
                  </p>
                ) : (
                  topLevelComments.map(
                    (comment) => {

                      const replies =
                        comments.filter(
                          (c) =>
                            c.parent_id ===
                            comment.id
                        );

                      return (
                        <div
                          key={comment.id}
                          className="bg-white border rounded p-4"
                        >

                          <div className="flex justify-between mb-2">

                            <span className="font-bold text-sm">
                              {comment.name}
                            </span>

                            <span className="text-xs text-gray-400">
                              {new Date(
                                comment.created_at
                              ).toLocaleDateString()}
                            </span>

                          </div>

                          <p className="text-sm mb-3 whitespace-pre-line">
                            {comment.comment}
                          </p>

                          <button
                            onClick={() =>
                              setReplyingTo(
                                replyingTo ===
                                  comment.id
                                  ? null
                                  : comment.id
                              )
                            }
                            className="text-blue-600 text-xs font-semibold"
                          >
                            {replyingTo ===
                              comment.id
                              ? (language === "rw" ? "Hagarika" : t("cancel"))
                              : (language === "rw" ? "Subiza" : t("reply"))}
                          </button>

                          <button
                            onClick={(e) =>
                              handleCommentReaction(
                                comment.id,
                                "like",
                                e
                              )
                            }
                            className={`ml-2 text-xs font-semibold ${reactions[comment.id] ===
                              "like"
                              ? "text-red-600"
                              : "text-gray-500 hover:text-red-600"
                              }`}
                            aria-label="Kunda ibitekerezo"
                            title="Kunda"
                          >
                            👍{" "}
                            {comment.likes ||
                              0}
                          </button>

                          <button
                            onClick={(e) =>
                              handleCommentReaction(
                                comment.id,
                                "dislike",
                                e
                              )
                            }
                            className={`ml-2 text-xs font-semibold ${reactions[comment.id] ===
                              "dislike"
                              ? "text-blue-600"
                              : "text-gray-500 hover:text-blue-600"
                              }`}
                            aria-label="Utanze ibitekerezo"
                            title="Ntanze"
                          >
                            👎{" "}
                            {comment.dislikes ||
                              0}
                          </button>

                          {replyingTo ===
                            comment.id && (
                              <form
                                onSubmit={(e) =>
                                  handleCommentSubmit(
                                    e,
                                    comment.id
                                  )
                                }
                                className="mt-3 bg-gray-50 p-3 border-l-2 border-blue-600"
                              >

                                <input
                                  type="text"
                                  placeholder={language === "rw" ? "Amazina yawe" : t("yourName")}
                                  value={
                                    replyName
                                  }
                                  onChange={(e) =>
                                    setReplyName(
                                      e.target.value
                                    )
                                  }
                                  className="w-full p-2 border rounded mb-2 text-xs"
                                  required
                                />

                                <textarea
                                  placeholder={language === "rw" ? "Subiza..." : t("replyPlaceholder")}
                                  value={
                                    replyText
                                  }
                                  onChange={(e) =>
                                    setReplyText(
                                      e.target.value
                                    )
                                  }
                                  rows="2"
                                  className="w-full p-2 border rounded mb-2 text-xs"
                                  required
                                />

                                <button
                                  type="submit"
                                  className="bg-black text-white text-xs px-3 py-1 rounded"
                                >
                                  {language === "rw" ? "Ohereza" : t("send")}
                                </button>

                              </form>
                            )}

                          {replies.length >
                            0 && (
                              <div className="mt-3 ml-4 pl-3 border-l-2 border-gray-200 space-y-2">

                                {replies.map(
                                  (reply) => (
                                    <div
                                      key={
                                        reply.id
                                      }
                                      className="bg-gray-50 p-3 rounded"
                                    >

                                      <div className="flex justify-between">

                                        <span className="font-bold text-xs">
                                          {
                                            reply.name
                                          }
                                        </span>

                                        <span className="text-[10px] text-gray-400">
                                          {new Date(
                                            reply.created_at
                                          ).toLocaleDateString()}
                                        </span>

                                      </div>

                                      <p className="text-xs mt-1">
                                        {
                                          reply.comment
                                        }
                                      </p>

                                      <div className="mt-1 flex items-center gap-2">                                        <button
                                        onClick={(e) =>
                                          handleCommentReaction(
                                            reply.id,
                                            "like",
                                            e
                                          )
                                        }
                                        className={`text-[10px] font-semibold ${reactions[reply.id] ===
                                          "like"
                                          ? "text-red-600"
                                          : "text-gray-500 hover:text-red-600"
                                          }`}
                                        aria-label="Kunda igisubizo"
                                        title="Kunda"
                                      >
                                        👍{" "}
                                        {reply.likes ||
                                          0}
                                      </button>

                                        <button
                                          onClick={(e) =>
                                            handleCommentReaction(
                                              reply.id,
                                              "dislike",
                                              e
                                            )
                                          }
                                          className={`text-[10px] font-semibold ${reactions[reply.id] ===
                                            "dislike"
                                            ? "text-blue-600"
                                            : "text-gray-500 hover:text-blue-600"
                                            }`}
                                          aria-label="Utanze igisubizo"
                                          title="Ntanze"
                                        >
                                          👎{" "}
                                          {reply.dislikes ||
                                            0}
                                        </button>
                                      </div>

                                    </div>
                                  )
                                )}

                              </div>
                            )}

                        </div>
                      );
                    }
                  )
                )}

              </div>

            </section>

          </main>



          <aside className="print:hidden order-3 lg:col-span-1">

            <div className="lg:sticky lg:top-6 lg:max-w-[240px] lg:mx-auto">

              <h3 className="mb-3 border-l-4 border-red-600 pl-2 text-sm font-black uppercase">
                {language === "rw" ? "Izindi Nkuru" : t("otherStories")}
              </h3>

              <div className="space-y-3">

                {otherPosts
                  .slice(6, 12)
                  .map((p) => {

                    const pId =
                      p._id || p.id;

                    return (
                      <Link
                        key={pId}
                        to={getArticleUrl(p)}
                        onClick={openPostFull(p)}
                        className="block rounded-md border border-gray-200 bg-white p-2 transition hover:shadow-sm"
                      >

                        {p.image && (
                          <img
                            src={getImageUrl(
                              p.image
                            )}
                            alt={p.title}
                            className="mb-2 h-24 w-full rounded object-cover"
                          />
                        )}

                        <span className="text-[9px] uppercase font-bold text-red-600">
                          {p.category ||
                            "Inkuru"}
                        </span>

                        <h4 className="font-bold text-xs text-gray-900 line-clamp-3">
                          {p.title}
                        </h4>

                      </Link>
                    );
                  })}

              </div>

            </div>

          </aside>

        </div>



        {otherPosts.length > 0 && (
          <section className="print:hidden mt-10 bg-white border rounded-lg p-4 sm:p-6">

            <div className="border-l-4 border-red-600 pl-3 mb-5">

              <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                {language === "rw" ? "Soma n'izindi nkuru" : t("readMoreStories")}
              </h2>

              <p className="text-sm text-gray-500">
                {language === "rw" ? "Izindi nkuru zose ziboneka hano hepfo." : t("allStoriesBelow")}
              </p>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

              {otherPosts.map((p) => {

                const pId =
                  p._id || p.id;

                return (
                  <Link
                    key={pId}
                    to={getArticleUrl(p)}
                    onClick={openPostFull(p)}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition"
                  >

                    {p.image ? (
                      <img
                        src={getImageUrl(
                          p.image
                        )}
                        alt={p.title}
                        className="w-full h-40 object-cover"
                      />
                    ) : (
                      <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                        Nta foto
                      </div>
                    )}

                    <div className="p-3">

                      <span className="text-[9px] uppercase font-bold text-red-600">
                        {p.category ||
                          "Inkuru"}
                      </span>

                      <h3 className="font-bold text-sm text-gray-900 line-clamp-3 mt-1">
                        {p.title}
                      </h3>

                      <p className="text-xs text-blue-600 font-semibold mt-3">
                        Soma inkuru yose →
                      </p>

                    </div>

                  </Link>
                );
              })}

            </div>

          </section>
        )}

      </div>
    </div>
  );
}