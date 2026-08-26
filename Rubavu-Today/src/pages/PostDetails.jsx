import React, { useEffect, useState, useRef } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import rubavuLogo from "../Rubavu.jpeg";
import { API_ROOT as API_URL } from "../services/api";



export default function PostDetails() {
  const { id, slug } = useParams();
  const location = useLocation();

  const [post, setPost] = useState(null);
  const [allPosts, setAllPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replyName, setReplyName] = useState("");


  const [sliderIndex, setSliderIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const imageContainerRef = useRef(null);






  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      setLoading(true);

      try {
        const targetSlug = slug || id;
        const endpoint = targetSlug && !/^\d+$/.test(String(targetSlug))
          ? `${API_URL}/api/posts/slug/${encodeURIComponent(String(targetSlug).replace(/\.html$/i, ''))}`
          : `${API_URL}/api/posts/${id}`;

        const [postRes, commentsRes, postsRes] = await Promise.all([
          fetch(endpoint),
          fetch(`${API_URL}/api/comments/${id || slug}`),
          fetch(`${API_URL}/api/posts`),
        ]);

        const postData = await postRes.json();
        const commentsData = await commentsRes.json();
        const allPostsData = await postsRes.json();

        if (!mounted) return;

        setPost(postData);

        if (
          !slug &&
          id &&
          postData &&
          postData.slug &&
          location.pathname !== `/${postData.slug}.html`
        ) {
          window.location.replace(`/${postData.slug}.html`);
          return;
        }

        setComments(
          Array.isArray(commentsData) ? commentsData : []
        );

        setAllPosts(
          Array.isArray(allPostsData) ? allPostsData : []
        );

        setLoading(false);

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      } catch (error) {
        console.error("Ikibazo mu gushaka amakuru:", error);

        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [id, slug]);





  useEffect(() => {
    setSliderIndex(0);
  }, [id]);






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

    return image.startsWith("http")
      ? image
      : `${API_URL}${image}`;
  };





  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const postUrl = window.location.href;
    const shareData = {
      title: post?.title || "Rubavu Today",
      text: post?.title || "Rubavu Today",
      url: postUrl,
    };

    if (post?.image) {
      try {
        const imgUrl = getImageUrl(post.image);
        const response = await fetch(imgUrl);
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
        // user cancelled or error
      }
    } else {
      navigator.clipboard.writeText(postUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
      return;
    }

    try {
      const res = await fetch(
        `${API_URL}/api/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            post_id: id,
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
      }
    } catch (error) {
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
  );

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 font-semibold">
            Birimo gushakishwa...
          </p>
        </div>
      </div>
    );
  }





  if (!post || post.error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Inkuru ntiyabonetse
        </h2>

        <Link
          to="/"
          className="text-blue-600 hover:text-blue-800 font-semibold"
        >
          ← Subira ku Ahabanza
        </Link>
      </div>
    );
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

  const formattedDate = postDate
    ? new Date(postDate).toLocaleDateString(
      "rw-RW",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    )
    : "Uyu munsi";

  const embedUrl = getEmbedUrl(
    post.youtube_url
  );

  const topLevelComments =
    comments.filter(
      (c) => !c.parent_id
    );





  return (
    <div className="min-h-screen bg-gray-50">



      {otherPosts.length > 0 && (
        <section className="w-full bg-white border-b border-gray-200 print:hidden">

          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-5">

            <div className="flex items-center justify-between mb-4">

              <div>
                <h2 className="text-lg sm:text-xl font-black text-gray-900">
                  Andi Makuru
                </h2>

                <p className="text-xs text-gray-500">
                  Izindi nkuru
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
                        to={`/post/${pId}`}
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
                            Nta foto
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
                            Soma inkuru yose →
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">



          <aside className="print:hidden lg:col-span-1 order-2 lg:order-1">

            <div className="lg:sticky lg:top-6">

              <h3 className="text-sm font-black uppercase border-l-4 border-red-600 pl-2 mb-4">
                Andi Makuru
              </h3>

              <div className="space-y-4">

                {otherPosts
                  .slice(0, 6)
                  .map((p) => {

                    const pId =
                      p._id || p.id;

                    return (
                      <Link
                        key={pId}
                        to={`/post/${pId}`}
                        className="flex gap-3 bg-white border border-gray-200 rounded p-2 hover:shadow-md transition"
                      >

                        {p.image && (
                          <img
                            src={getImageUrl(
                              p.image
                            )}
                            alt={p.title}
                            className="w-20 h-16 object-cover rounded flex-shrink-0"
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
            className="order-1 lg:order-2 lg:col-span-2 bg-white border border-gray-200 rounded-lg shadow-sm p-4 sm:p-8"
          >



            <Link
              to="/"
              className="print:hidden inline-flex text-blue-600 hover:text-blue-800 font-semibold text-sm mb-6"
            >
              ← Subira ku Ahabanza
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
                      Yanditswe Na:
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
                    Yanditswe ku wa{" "}
                    <strong>
                      {formattedDate}
                    </strong>
                  </div>

                </div>

              </div>

            </div>



            <div className="print:hidden flex justify-end mb-4 gap-2">

              <button
                onClick={handleShare}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded"
              >
                {copied ? "Byakoporowe!" : "🔗 Sangiza Inkuru"}
              </button>

              <button
                onClick={handlePrint}
                className="bg-gray-700 hover:bg-gray-800 text-white text-xs px-3 py-1.5 rounded"
              >
                🖨 Print
              </button>

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
                  className="relative overflow-hidden border bg-gray-50"
                >

                  <img
                    src={getImageUrl(
                      post.image
                    )}
                    alt={post.title}
                    className="w-full h-auto max-h-[80vh] object-contain select-none"
                    draggable="false"
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

                <h3 className="font-bold text-lg mb-4">
                  📺 Videwo y'Inkuru
                </h3>

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
                Ibitekerezo ({comments.length})
              </h3>



              <form
                onSubmit={handleCommentSubmit}
                className="bg-gray-50 p-4 rounded border mb-8"
              >

                <h4 className="font-bold mb-3 text-sm">
                  Tanga igitekerezo cyawe
                </h4>

                <input
                  type="text"
                  placeholder="Amazina yawe"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  className="w-full sm:w-1/2 p-2 border rounded mb-3"
                  required
                />

                <textarea
                  placeholder="Andika igitekerezo cyawe hano..."
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
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded text-sm font-semibold"
                >
                  Ohereza Igitekerezo
                </button>

              </form>



              <div className="space-y-4">

                {topLevelComments.length === 0 ? (
                  <p className="text-gray-500 italic text-sm">
                    Nta bitekerezo birabaho.
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
                              ? "Hagarika"
                              : "Subiza"}
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
                                  placeholder="Amazina yawe"
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
                                  placeholder="Subiza..."
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
                                  Ohereza
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



          <aside className="print:hidden lg:col-span-1 order-3">

            <div className="lg:sticky lg:top-6">

              <h3 className="text-sm font-black uppercase border-l-4 border-red-600 pl-2 mb-4">
                Izindi Nkuru
              </h3>

              <div className="space-y-4">

                {otherPosts
                  .slice(6, 12)
                  .map((p) => {

                    const pId =
                      p._id || p.id;

                    return (
                      <Link
                        key={pId}
                        to={`/post/${pId}`}
                        className="block bg-white border border-gray-200 rounded p-2 hover:shadow-md transition"
                      >

                        {p.image && (
                          <img
                            src={getImageUrl(
                              p.image
                            )}
                            alt={p.title}
                            className="w-full h-28 object-cover rounded mb-2"
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
                Soma n'izindi nkuru
              </h2>

              <p className="text-sm text-gray-500">
                Izindi nkuru zose ziboneka hano hepfo.
              </p>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

              {otherPosts.map((p) => {

                const pId =
                  p._id || p.id;

                return (
                  <Link
                    key={pId}
                    to={`/post/${pId}`}
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