import React, {
  useEffect,
  useState,
  useCallback,
} from "react";

import {
  addPost,
  deletePost,
  updatePost,
  deleteComment,
  getStoredUser,
  getChiefEditorPosts,
  getAllComments,
  getComments,
  updatePostStatus,
} from "../../services/api";

import { API_ROOT as SERVER_URL } from "../../services/api";
import LoadingScreen from "../../components/common/LoadingScreen";
import { DashboardLayout, StatusBadge as SharedStatusBadge } from "../../components/dashboard";
import ArticleEditor from "../../components/article/ArticleEditor";

export default function ChiefDashboard({ onLogout }) {




  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingPostId, setEditingPostId] = useState(null);
  const [editInitial, setEditInitial] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);


  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const [allComments, setAllComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [commentsError, setCommentsError] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");





  const loggedInUser = getStoredUser();

  const editorName =
    loggedInUser?.full_name ||
    loggedInUser?.name ||
    loggedInUser?.email ||
    "Chief Editor";








  const categories = [
    "Amakuru",
    "Ubukungu",
    "Imikino",
    "Imyidagaduro",
    "Uburezi",
  ];






  const getImageUrl = (post) => {
    if (!post) {
      return null;
    }

    const image =
      post.image ||
      post.image_url ||
      post.imageUrl ||
      post.photo ||
      post.thumbnail;

    if (!image) {
      return null;
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.startsWith("data:")
    ) {
      return image;
    }

    if (image.startsWith("/")) {
      return `${SERVER_URL}${image}`;
    }

    if (image.startsWith("uploads/")) {
      return `${SERVER_URL}/${image}`;
    }

    return `${SERVER_URL}/uploads/${image}`;
  };





  const getPostId = (post) => {
    return post?.id || post?._id;
  };





  const getStatus = (post) => {
    return String(post?.status || "pending").toLowerCase();
  };





  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getChiefEditorPosts();

      if (Array.isArray(data)) {
        setPosts(data);
      } else if (data && Array.isArray(data.posts)) {
        setPosts(data.posts);
      } else {
        setPosts([]);
      }
    } catch (err) {
      console.error(
        "Failed to load Chief Editor posts:",
        err
      );

      setError(
        err?.message ||
        "Unable to load posts."
      );

      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);





  const resetForm = () => {
    setEditingPostId(null);
    setEditInitial(null);
  };




  const handleSubmit = async (formData) => {
    if (saving) return;
    setMessage("");
    setError("");

    try {
      setSaving(true);

      if (editingPostId) {
        await updatePost(
          editingPostId,
          formData
        );

        setMessage(
          "Post updated successfully."
        );
      } else {
        await addPost(formData);

        setMessage(
          "Post created successfully."
        );
      }

      await loadPosts();

      setEditingPostId(null);
      setEditInitial(null);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      console.error(
        "Save post error:",
        err
      );

      setError(
        err?.message ||
        "Unable to save post."
      );
    } finally {
      setSaving(false);
    }
  };




  const handleEdit = (post) => {
    const postId = getPostId(post);

    if (!postId) {
      setError(
        "Unable to identify this post."
      );
      return;
    }

    setEditingPostId(postId);

    setEditInitial({
      title: post.title || "",
      description: post.description || post.content || "",
      youtube_url: post.youtube_url || post.youtubeUrl || "",
      image: post.image || post.image_url || post.imageUrl || null,
      category: post.category || "Amakuru",
      status: post.status || post.Status || "",
      content_blocks: post.content_blocks || null,
    });

    setMessage(
      "Editing this post."
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };





  const handleDelete = async (id) => {
    if (!id) {
      setError(
        "Unable to identify this post."
      );
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this post?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      await deletePost(id);

      setPosts((previous) =>
        previous.filter(
          (post) =>
            getPostId(post) !== id
        )
      );

      if (
        selectedPost &&
        getPostId(selectedPost) === id
      ) {
        setSelectedPost(null);
      }

      setMessage(
        "Post deleted successfully."
      );
    } catch (err) {
      console.error(
        "Delete post error:",
        err
      );

      setError(
        err?.message ||
        "Unable to delete post."
      );
    } finally {
      setSaving(false);
    }
  };



  const handleStatusChange = async (
    postId,
    newStatus
  ) => {
    if (!postId) {
      setError(
        "Unable to identify this post."
      );
      return;
    }

    let confirmation =
      "Change this post status?";

    if (newStatus === "approved") {
      confirmation =
        "Approve this post and publish it on the user website?";
    }

    if (newStatus === "rejected") {
      confirmation =
        "Reject this post? It will NOT appear on the user website.";
    }

    if (newStatus === "pending") {
      confirmation =
        "Return this post to pending review?";
    }

    const confirmed = window.confirm(
      confirmation
    );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const result =
        await updatePostStatus(
          postId,
          newStatus
        );

      const updatedPost =
        result?.post;

      setPosts((previous) =>
        previous.map((post) =>
          getPostId(post) === postId
            ? {
              ...post,
              ...(updatedPost || {}),
              status: newStatus,
            }
            : post
        )
      );

      if (
        selectedPost &&
        getPostId(selectedPost) === postId
      ) {
        setSelectedPost({
          ...selectedPost,
          ...(updatedPost || {}),
          status: newStatus,
        });
      }

      if (newStatus === "approved") {
        setMessage(
          "Post approved and published on the user website."
        );
      } else if (newStatus === "rejected") {
        setMessage(
          "Post rejected. It will not appear on the user website."
        );
      } else {
        setMessage(
          "Post returned to pending review."
        );
      }
    } catch (err) {
      console.error(
        "Status update error:",
        err
      );

      setError(
        err?.message ||
        "Unable to update post status."
      );
    } finally {
      setSaving(false);
    }
  };





  const handleDeleteComment =
    async (commentId) => {
      if (!commentId) {
        setError(
          "Unable to identify this comment."
        );
        return;
      }

      const confirmed = window.confirm(
        "Remove this comment?"
      );

      if (!confirmed) {
        return;
      }

      try {
        setSaving(true);
        setError("");

        await deleteComment(commentId);

        const refreshed =
          await getChiefEditorPosts();

        const list =
          Array.isArray(refreshed)
            ? refreshed
            : refreshed?.posts || [];

        setPosts(list);

        if (selectedPost) {
          const updatedPost =
            list.find(
              (post) =>
                getPostId(post) ===
                getPostId(selectedPost)
            );

          if (updatedPost) {
            setSelectedPost(updatedPost);
          }
        }

        setMessage(
          "Comment removed."
        );
      } catch (err) {
        console.error(
          "Delete comment error:",
          err
        );

        setError(
          err?.message ||
          "Unable to remove comment."
        );
      } finally {
        setSaving(false);
      }
    };




  // Load every reader comment across all posts (Admin / Chief Editor).
  const loadAllComments = useCallback(async () => {
    setLoadingComments(true);
    setCommentsError("");
    try {
      const data = await getAllComments();
      setAllComments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Load all comments error:", err);
      setCommentsError(err?.message || "Unable to load comments.");
      setAllComments([]);
    } finally {
      setLoadingComments(false);
    }
  }, []);

  useEffect(() => {
    loadAllComments();
  }, [loadAllComments]);

  const handleDeleteAllComment = async (commentId) => {
    if (!commentId) {
      setCommentsError("Unable to identify this comment.");
      return;
    }

    const confirmed = window.confirm("Remove this comment?");
    if (!confirmed) return;

    try {
      setCommentsError("");
      await deleteComment(commentId);
      setAllComments((prev) =>
        prev.filter((c) => (c.id ?? c.comment_id ?? c._id) !== commentId)
      );
      setMessage("Comment removed.");
    } catch (err) {
      console.error("Delete comment error:", err);
      setCommentsError(err?.message || "Unable to remove comment.");
    }
  };

  // Open a post's details and load that post's reader comments so the
  // "Reader Comments" section shows real data (previously it was always empty).
  const handleViewPost = async (post) => {
    const postId = getPostId(post);

    if (postId) {
      try {
        const comments = await getComments(postId);
        post = { ...post, comments: Array.isArray(comments) ? comments : [] };
      } catch (err) {
        console.error("Load post comments error:", err);
        post = { ...post, comments: [] };
      }
    }

    setSelectedPost(post);
  };



  const filteredPosts =
    posts.filter((post) => {
      const title =
        post.title || "";

      const description =
        post.description ||
        post.content ||
        "";

      const category =
        post.category || "";

      const status =
        getStatus(post);

      const searchValue =
        search
          .toLowerCase()
          .trim();

      const matchesSearch =
        !searchValue ||
        title
          .toLowerCase()
          .includes(searchValue) ||
        description
          .toLowerCase()
          .includes(searchValue);

      const matchesCategory =
        categoryFilter === "All" ||
        category === categoryFilter;

      const matchesStatus =
        statusFilter === "All" ||
        status === statusFilter;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus
      );
    });





  const totalFiltered = filteredPosts.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );





  const toggleSelectPost = (id) => {
    if (!id) return;
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleSelectAll = (listIds) => {
    const idsOnPage = listIds || [];
    const allSelected = idsOnPage.every((id) => selectedIds.includes(id));
    setSelectedIds(allSelected ? [] : idsOnPage);
  };

  const clearSelection = () => setSelectedIds([]);

  const exportCSV = () => {
    const list = selectedIds.length ? posts.filter((p) => selectedIds.includes(getPostId(p))) : filteredPosts;
    const rows = list.map((p) => ({
      id: getPostId(p),
      title: p.title || "",
      category: p.category || "",
      status: getStatus(p),
      author: p.Author || p.author || p.author_name || "",
      date: formatDate(p),
    }));

    if (!rows.length) {
      setError("No posts to export.");
      return;
    }

    const header = Object.keys(rows[0]).join(",");
    const csv = [header]
      .concat(
        rows.map((r) =>
          Object.values(r)
            .map((v) => `"${String(v).replace(/"/g, '""')}"`)
            .join(",")
        )
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rubavu_posts_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const bulkAction = async (action) => {
    if (!selectedIds.length) {
      setError("No posts selected.");
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to ${action} ${selectedIds.length} selected posts?`);
    if (!confirmed) return;

    try {
      setSaving(true);
      setError("");

      if (action === "delete") {
        await Promise.all(selectedIds.map((id) => deletePost(id)));
      } else if (action === "approve" || action === "reject" || action === "pending") {
        const status = action === "approve" ? "approved" : action === "reject" ? "rejected" : "pending";
        await Promise.all(selectedIds.map((id) => updatePostStatus(id, status)));
      }

      await loadPosts();
      clearSelection();
      setMessage(`Bulk ${action} completed.`);
    } catch (err) {
      console.error("Bulk action error:", err);
      setError(err?.message || "Bulk action failed.");
    } finally {
      setSaving(false);
    }
  };





  const totalPosts = posts.length;

  const pendingPosts =
    posts.filter(
      (post) =>
        getStatus(post) ===
        "pending"
    ).length;

  const approvedPosts =
    posts.filter(
      (post) =>
        getStatus(post) ===
        "approved"
    ).length;

  const rejectedPosts =
    posts.filter(
      (post) =>
        getStatus(post) ===
        "rejected"
    ).length;





  const formatDate = (post) => {
    const date =
      post.createdDate ||
      post.created_at ||
      post.createdAt;

    if (!date) {
      return "Itariki ntiboneka";
    }

    try {
      return new Date(
        date
      ).toLocaleString();
    } catch {
      return String(date);
    }
  };





  const StatusBadge = ({ status }) => <SharedStatusBadge status={status} size="xs" />;

  const navSections = [
    {
      label: "Dashboard",
      items: [
        { icon: <span className="text-sm">📊</span>, label: "Imbonerahamwe", path: "/chief-editor/dashboard" },
        { icon: <span className="text-sm">📝</span>, label: "Kora inkuru", path: "/chief-editor/posts" },
      ],
    },
    {
      label: "Inkuru",
      items: [
        { icon: <span className="text-sm">📋</span>, label: "Zose", badge: totalPosts, onClick: () => setStatusFilter("All") },
        { icon: <span className="text-sm">⏳</span>, label: "Zitegereje", badge: pendingPosts, onClick: () => setStatusFilter("pending") },
        { icon: <span className="text-sm">✅</span>, label: "Zemejwe", badge: approvedPosts, onClick: () => setStatusFilter("approved") },
        { icon: <span className="text-sm">❌</span>, label: "Zanzwe", badge: rejectedPosts, onClick: () => setStatusFilter("rejected") },
      ],
    },
  ];





  if (loading) {
    return <LoadingScreen message="Imbonerahamwe y'Umwanditsi Mukuru irimo gutegurwa..." />;
  }





  return (
    <DashboardLayout navigationSections={navSections} roleLabel="Umwanditsi Mukuru" onLogout={onLogout}>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">



        <section className="mb-6">

          <div className="rounded-3xl bg-gradient-to-r from-blue-950 via-blue-800 to-cyan-700 p-6 text-white shadow-lg sm:p-8">

            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

              <div>

                <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-blue-200">
                  Imicungire y'inkuru
                </p>

                <h2 className="text-2xl font-black sm:text-3xl">
                  Suzuma kandi wemeze inkuru
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
                  Suzuma inkuru zatanzwe n'abakozi.
                  Izemejwe zihita zisohoka ku rubuga.
                </p>

              </div>

              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">

                <p className="text-xs font-bold text-blue-100">
                  Winjiye nka
                </p>

                <p className="mt-1 font-black">
                  {editorName}
                </p>

              </div>

            </div>

          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <button onClick={() => { resetForm(); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xl">✍️</span>
                <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white">Andika</span>
              </div>
              <p className="text-sm font-black text-blue-800">Kora inkuru</p>
              <p className="mt-1 text-xs text-blue-700">Tangira inkuru nshya yo gutangazwa.</p>
            </button>

            <button onClick={() => setStatusFilter("pending")} className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xl">⏳</span>
                <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white">Gusuzuma</span>
              </div>
              <p className="text-sm font-black text-amber-800">Zitegereje gusuzumwa</p>
              <p className="mt-1 text-xs text-amber-700">Fungura inkuru zikiri gusuzumwa.</p>
            </button>

            <button onClick={() => bulkAction("approve")} className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xl">✅</span>
                <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white">Gusohora</span>
              </div>
              <p className="text-sm font-black text-emerald-800">Emeza byatoranijwe</p>
              <p className="mt-1 text-xs text-emerald-700">Sohora inkuru zatoranijwe mu kanda kamwe.</p>
            </button>

            <button onClick={exportCSV} className="rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xl">📥</span>
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white">Raporo</span>
              </div>
              <p className="text-sm font-black text-slate-800">Kuramo raporo</p>
              <p className="mt-1 text-xs text-slate-600">Kuramo imbonerahamwe y'ubwanditsi.</p>
            </button>
          </div>

        </section>



        {message && (
          <div className="mb-5 flex items-start justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">

            <span>
              ✓ {message}
            </span>

            <button
              onClick={() =>
                setMessage("")
              }
              className="font-black"
            >
              ×
            </button>

          </div>
        )}

        {error && (
          <div className="mb-5 flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">

            <span>
              ✕ {error}
            </span>

            <button
              onClick={() =>
                setError("")
              }
              className="font-black"
            >
              ×
            </button>

          </div>
        )}



        <section className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <p className="text-xs font-black uppercase tracking-wide text-slate-400">
              Inkuru zose
            </p>

            <p className="mt-2 text-3xl font-black text-slate-900">
              {totalPosts}
            </p>

          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">

            <p className="text-xs font-black uppercase tracking-wide text-amber-600">
              Zitegereje gusuzumwa
            </p>

            <p className="mt-2 text-3xl font-black text-amber-700">
              {pendingPosts}
            </p>

          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">

            <p className="text-xs font-black uppercase tracking-wide text-emerald-600">
              Zemejwe
            </p>

            <p className="mt-2 text-3xl font-black text-emerald-700">
              {approvedPosts}
            </p>

          </div>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm">

            <p className="text-xs font-black uppercase tracking-wide text-red-600">
              Zanzwe
            </p>

            <p className="mt-2 text-3xl font-black text-red-700">
              {rejectedPosts}
            </p>

          </div>

        </section>



        {/* ---- ALL COMMENTS (every reader comment on every post) ---- */}
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">

            <div>

              <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                Ibitekerezo
              </p>

              <h3 className="mt-1 text-lg font-black text-slate-900">
                Ibitekerezo byose by'abasomyi
              </h3>

            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
              {allComments.length}
            </span>

          </div>

          {commentsError && (
            <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
              {commentsError}
            </p>
          )}

          {loadingComments ? (
            <p className="py-6 text-center text-sm text-slate-500">
              Birimo gutwara ibitekerezo...
            </p>
          ) : allComments.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">
              Nta bitekerezo bihari.
            </p>
          ) : (
            <div className="max-h-[480px] space-y-3 overflow-y-auto pr-1">

              {allComments.map((comment) => {

                const commentId = comment.id ?? comment.comment_id ?? comment._id;

                return (

                  <div
                    key={commentId}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >

                    <div className="flex items-start justify-between gap-3">

                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-2">

                          <span className="text-sm font-black text-slate-900">
                            {comment.name || comment.user_name || comment.author || "Anonymous"}
                          </span>

                          {comment.post_title && (
                            <span className="truncate rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-black text-blue-700">
                              {comment.post_title}
                            </span>
                          )}

                        </div>

                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                          {comment.comment || comment.content || comment.text || ""}
                        </p>

                        {comment.created_at && (
                          <p className="mt-2 text-[11px] text-slate-400">
                            {new Date(comment.created_at).toLocaleString()}
                          </p>
                        )}

                      </div>

                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => handleDeleteAllComment(commentId)}
                        className="flex-shrink-0 rounded-lg bg-red-50 px-2 py-1 text-[10px] font-black text-red-600 hover:bg-red-600 hover:text-white disabled:opacity-50"
                      >
                        Gusiba
                      </button>

                    </div>

                  </div>

                );
              })}

            </div>
          )}

        </section>



        <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">

          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-xs font-black uppercase tracking-wide text-blue-600">
                {editingPostId
                  ? "Hindura inkuru"
                  : "Kora inkuru"}
              </p>

              <h2 className="mt-1 text-xl font-black text-slate-900">
                {editingPostId
                  ? "Vugurura inkuru"
                  : "Kora inkuru nshya"}
              </h2>

            </div>

            {editingPostId && (
              <button
                onClick={resetForm}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-black text-slate-700 hover:bg-slate-100"
              >
                Reka guhindura
              </button>
            )}

          </div>

          <ArticleEditor
            key={editingPostId ? `edit-${editingPostId}` : "create-new-form"}
            initial={editInitial}
            categories={categories.map((c) => ({ name: c }))}
            submitLabel={editingPostId ? "Vugurura inkuru" : "Kora inkuru"}
            saving={saving}
            onSubmit={handleSubmit}
            onCancel={resetForm}
          />

        </section>



        <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="mb-4">

            <p className="text-xs font-black uppercase tracking-wide text-blue-600">
              Imicungire y'inkuru
            </p>

            <h2 className="mt-1 text-xl font-black text-slate-900">
              Suzuma inkuru
            </h2>

          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_200px_200px]">

            <input
              type="search"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Shakisha inkuru..."
              className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />

            <select
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(
                  e.target.value
                )
              }
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500"
            >

              <option value="All">
                Ibyiciro byose
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                )
              )}

            </select>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500"
            >

              <option value="All">
                Imimerere yose
              </option>

              <option value="pending">
                Zitegereje
              </option>

              <option value="approved">
                Zemejwe
              </option>

              <option value="rejected">
                Zanzwe
              </option>

            </select>

          </div>

        </section>



        {totalFiltered === 0 ? (

          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-16 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
              📰
            </div>

            <h3 className="mt-5 text-lg font-black text-slate-900">
              Nta nkuru zabonetse
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Nta nkuru zihuye n'ibyo wahisemo.
            </p>

          </div>

        ) : (

          <div className="space-y-4">


            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleSelectAll(paginatedPosts.map((p) => getPostId(p)).filter(Boolean))}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-black text-slate-700 hover:bg-slate-100"
                >
                  {selectedIds.length ? `Zatoranyijwe: ${selectedIds.length}` : "Toranya"}
                </button>

                <button
                  onClick={() => bulkAction('approve')}
                  disabled={saving}
                  className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-black text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  ✓ Emeza
                </button>

                <button
                  onClick={() => bulkAction('reject')}
                  disabled={saving}
                  className="rounded-xl bg-red-600 px-3 py-2 text-sm font-black text-white hover:bg-red-700 disabled:opacity-50"
                >
                  ✕ Anga
                </button>

                <button
                  onClick={() => bulkAction('delete')}
                  disabled={saving}
                  className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-black text-red-600 hover:bg-red-600 hover:text-white disabled:opacity-50"
                >
                  Siba
                </button>

                <button
                  onClick={exportCSV}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-black text-slate-700 hover:bg-slate-100"
                >
                  Kuramo CSV
                </button>

              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-500">Ku rupapuro</label>
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none"
                >
                  <option value={6}>6</option>
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                </select>
              </div>

            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

              {paginatedPosts.map((post) => {

                const postId =
                  getPostId(post);

                const imageUrl =
                  getImageUrl(post);

                const description =
                  post.description ||
                  post.content ||
                  "";

                const status =
                  getStatus(post);

                const author =
                  post.Author ||
                  post.author ||
                  post.author_name ||
                  post.authorName ||
                  "Employee";

                return (

                  <article
                    key={postId}
                    className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >


                    <div className="absolute left-3 top-3 z-20">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(postId)}
                        onChange={() => toggleSelectPost(postId)}
                        className="h-4 w-4 rounded-md"
                      />
                    </div>



                    <div className="relative h-36 bg-slate-100">

                      {imageUrl ? (

                        <img
                          src={imageUrl}
                          alt={
                            post.title
                          }
                          className="h-full w-full object-cover"
                        />

                      ) : (

                        <div className="flex h-full items-center justify-center text-3xl">
                          📰
                        </div>

                      )}

                      <div className="absolute left-2 top-2">
                        <StatusBadge
                          status={status}
                        />
                      </div>

                    </div>



                    <div className="p-3">



                      <div className="mb-2 flex items-center justify-between gap-2">

                        <span className="rounded-full bg-blue-50 px-2 py-1 text-[9px] font-black uppercase tracking-wide text-blue-700">
                          {post.category ||
                            "Amakuru"}
                        </span>

                        <span className="truncate text-[9px] font-semibold text-slate-400">
                          {formatDate(
                            post
                          )}
                        </span>

                      </div>



                      <h3 className="line-clamp-2 text-sm font-black leading-5 text-slate-900">
                        {post.title ||
                          "Inkuru itagira umutwe"}
                      </h3>



                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                        {description}
                      </p>



                      <div className="mt-3 rounded-lg bg-slate-50 p-2">

                        <p className="text-[9px] font-black uppercase tracking-wide text-slate-400">
                          Yatanzwe na
                        </p>

                        <p className="mt-0.5 truncate text-xs font-black text-slate-800">
                          {author}
                        </p>

                      </div>



                      <div className="mt-3 grid grid-cols-2 gap-1.5">



                        <button
                          onClick={() =>
                            handleViewPost(
                              post
                            )
                          }
                          className="rounded-lg bg-slate-900 px-2 py-2 text-[10px] font-black text-white hover:bg-blue-700"
                        >
                          Reba
                        </button>



                        <button
                          onClick={() =>
                            handleEdit(
                              post
                            )
                          }
                          className="rounded-lg bg-amber-100 px-2 py-2 text-[10px] font-black text-amber-700 hover:bg-amber-500 hover:text-white"
                        >
                          Hindura
                        </button>



                        {status ===
                          "pending" && (
                            <button
                              onClick={() =>
                                handleStatusChange(
                                  postId,
                                  "approved"
                                )
                              }
                              disabled={
                                saving
                              }
                              className="rounded-lg bg-emerald-600 px-2 py-2 text-[10px] font-black text-white hover:bg-emerald-700 disabled:opacity-50"
                            >
                              ✓ Approve
                            </button>
                          )}



                        {status ===
                          "pending" && (
                            <button
                              onClick={() =>
                                handleStatusChange(
                                  postId,
                                  "rejected"
                                )
                              }
                              disabled={
                                saving
                              }
                              className="rounded-lg bg-red-600 px-2 py-2 text-[10px] font-black text-white hover:bg-red-700 disabled:opacity-50"
                            >
                              ✕ Reject
                            </button>
                          )}



                        {status ===
                          "rejected" && (
                            <button
                              onClick={() =>
                                handleStatusChange(
                                  postId,
                                  "pending"
                                )
                              }
                              disabled={
                                saving
                              }
                              className="col-span-2 rounded-lg bg-amber-100 px-2 py-2 text-[10px] font-black text-amber-700 hover:bg-amber-500 hover:text-white disabled:opacity-50"
                            >
                              ↻ Return to Review
                            </button>
                          )}



                        <button
                          onClick={() =>
                            handleDelete(
                              postId
                            )
                          }
                          disabled={
                            saving
                          }
                          className="col-span-2 rounded-lg border border-red-200 bg-red-50 px-2 py-2 text-[10px] font-black text-red-600 hover:bg-red-600 hover:text-white disabled:opacity-50"
                        >
                          Delete Article
                        </button>

                      </div>

                    </div>

                  </article>
                );
              })}

            </div>


            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-slate-500">Showing page {currentPage} of {totalPages}</div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-black text-slate-700 disabled:opacity-50"
                >
                  Prev
                </button>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-black text-slate-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>

          </div>
        )}

      </div>

      {selectedPost && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
          onClick={() =>
            setSelectedPost(null)
          }
        >

          <div
            className="max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
            onClick={(e) =>
              e.stopPropagation()
            }
          >



            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-sm font-bold text-white shadow-sm">
                  RT
                </div>

                <div>

                  <p className="text-xs font-black uppercase tracking-wide text-blue-600">
                    Article Review
                  </p>

                  <p className="text-xs text-slate-400">
                    Chief Editor
                  </p>

                </div>

              </div>

              <button
                onClick={() =>
                  setSelectedPost(null)
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-lg font-black text-slate-700 hover:bg-red-100 hover:text-red-600"
              >
                ×
              </button>

            </div>



            <div className="p-5 sm:p-7">

              <div className="mb-5 flex flex-wrap items-center gap-3">

                <StatusBadge
                  status={getStatus(
                    selectedPost
                  )}
                />

                <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700">
                  {selectedPost.category ||
                    "Amakuru"}
                </span>

              </div>

              <h2 className="text-2xl font-black leading-tight text-slate-900 sm:text-4xl">
                {selectedPost.title ||
                  "Untitled Article"}
              </h2>

              <div className="mt-3 flex flex-wrap gap-4 text-xs font-semibold text-slate-400">

                <span>
                  Author:{" "}
                  <strong className="text-slate-700">
                    {selectedPost.Author ||
                      selectedPost.author ||
                      selectedPost.author_name ||
                      "Employee"}
                  </strong>
                </span>

                <span>
                  {formatDate(
                    selectedPost
                  )}
                </span>

              </div>



              {getImageUrl(
                selectedPost
              ) && (

                  <img
                    src={getImageUrl(
                      selectedPost
                    )}
                    alt={
                      selectedPost.title
                    }
                    className="mt-6 max-h-[500px] w-full rounded-2xl object-cover"
                  />

                )}



              <div className="mt-6 whitespace-pre-wrap text-base leading-8 text-slate-700">
                {selectedPost.description ||
                  selectedPost.content ||
                  "No description available."}
              </div>



              {(
                selectedPost.youtube_url ||
                selectedPost.youtubeUrl
              ) && (

                  <div className="mt-6 rounded-2xl bg-slate-50 p-4">

                    <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                      YouTube
                    </p>

                    <a
                      href={
                        selectedPost.youtube_url ||
                        selectedPost.youtubeUrl
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 block break-all text-sm font-bold text-blue-600 hover:underline"
                    >
                      {selectedPost.youtube_url ||
                        selectedPost.youtubeUrl}
                    </a>

                  </div>
                )}



              <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">

                <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                  Editorial Decision
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Approved posts become visible
                  on the public user website.
                </p>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row">

                  {getStatus(
                    selectedPost
                  ) === "pending" && (
                      <>

                        <button
                          onClick={() =>
                            handleStatusChange(
                              getPostId(
                                selectedPost
                              ),
                              "approved"
                            )
                          }
                          disabled={
                            saving
                          }
                          className="flex-1 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                          ✓ Approve & Publish
                        </button>

                        <button
                          onClick={() =>
                            handleStatusChange(
                              getPostId(
                                selectedPost
                              ),
                              "rejected"
                            )
                          }
                          disabled={
                            saving
                          }
                          className="flex-1 rounded-xl bg-red-600 px-5 py-3 text-sm font-black text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          ✕ Reject Post
                        </button>

                      </>
                    )}

                  {getStatus(
                    selectedPost
                  ) === "rejected" && (

                      <button
                        onClick={() =>
                          handleStatusChange(
                            getPostId(
                              selectedPost
                            ),
                            "pending"
                          )
                        }
                        disabled={
                          saving
                        }
                        className="w-full rounded-xl bg-amber-500 px-5 py-3 text-sm font-black text-white hover:bg-amber-600 disabled:opacity-50"
                      >
                        ↻ Return to Review
                      </button>
                    )}

                  {getStatus(
                    selectedPost
                  ) === "approved" && (

                      <button
                        onClick={() =>
                          handleStatusChange(
                            getPostId(
                              selectedPost
                            ),
                            "pending"
                          )
                        }
                        disabled={
                          saving
                        }
                        className="w-full rounded-xl bg-amber-500 px-5 py-3 text-sm font-black text-white hover:bg-amber-600 disabled:opacity-50"
                      >
                        ↻ Return to Review
                      </button>
                    )}

                </div>

              </div>



              <div className="mt-8">

                <div className="mb-4 flex items-center justify-between">

                  <div>

                    <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                      Comments
                    </p>

                    <h3 className="mt-1 text-lg font-black text-slate-900">
                      Reader Comments
                    </h3>

                  </div>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                    {Array.isArray(
                      selectedPost.comments
                    )
                      ? selectedPost.comments
                        .length
                      : 0}
                  </span>

                </div>

                {Array.isArray(
                  selectedPost.comments
                ) &&
                  selectedPost.comments.length >
                  0 ? (

                  <div className="space-y-3">

                    {selectedPost.comments.map(
                      (
                        comment,
                        index
                      ) => {

                        const commentId =
                          comment.id ||
                          comment.comment_id ||
                          comment._id;

                        return (

                          <div
                            key={
                              commentId ||
                              index
                            }
                            className="rounded-2xl border border-slate-200 bg-white p-4"
                          >

                            <div className="flex items-start justify-between gap-4">

                              <div className="min-w-0">

                                <p className="text-sm font-black text-slate-900">
                                  {comment.name ||
                                    comment.user_name ||
                                    comment.author ||
                                    "Anonymous"}
                                </p>

                                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                                  {comment.comment ||
                                    comment.content ||
                                    comment.text ||
                                    ""}
                                </p>

                              </div>

                              {commentId && (

                                <button
                                  onClick={() =>
                                    handleDeleteComment(
                                      commentId
                                    )
                                  }
                                  disabled={
                                    saving
                                  }
                                  className="shrink-0 rounded-lg bg-red-50 px-3 py-2 text-[10px] font-black text-red-600 hover:bg-red-600 hover:text-white disabled:opacity-50"
                                >
                                  Remove
                                </button>

                              )}

                            </div>

                          </div>
                        );
                      }
                    )}

                  </div>

                ) : (

                  <div className="rounded-2xl bg-slate-50 p-6 text-center text-sm font-semibold text-slate-400">
                    No comments on this article.
                  </div>

                )}

              </div>

            </div>

          </div>

        </div>
      )}

    </DashboardLayout>
  );
}
