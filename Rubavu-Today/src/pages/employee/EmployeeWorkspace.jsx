import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";

import {
  Loader2,
  Upload,
  User,
  Lock,
  Eye,
  EyeOff,
  X,
  Calendar,
  Tag,
  BookOpen,
} from "lucide-react";

import api, { API_ROOT } from "../../services/api";
import rubavuLogo from "../../Rubavu.jpeg";

function Employee() {




  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [currentUser, setCurrentUser] = useState(null);

  const [showAllPosts, setShowAllPosts] = useState(true);


  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);


  const [selectedPost, setSelectedPost] = useState(null);

  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    youtube_url: "",
    category: "Amakuru",
    image: null,
  });

  const fileInputRef = useRef(null);





  const departments = [
    {
      name: "Amakuru",
      icon: "📰",
    },
    {
      name: "Ubukungu",
      icon: "💼",
    },
    {
      name: "Imikino",
      icon: "⚽",
    },
    {
      name: "Imyidagaduro",
      icon: "🎭",
    },
    {
      name: "Uburezi",
      icon: "🎓",
    },
  ];





  const loadCurrentUser = useCallback(async () => {
    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);

          if (parsedUser) {
            setCurrentUser(parsedUser);
            return;
          }
        } catch (storedError) {
          console.error(
            "Invalid stored user:",
            storedError
          );
        }
      }

      if (api.getCurrentUser) {
        const user = await api.getCurrentUser();

        if (user) {
          setCurrentUser(user);

          localStorage.setItem(
            "user",
            JSON.stringify(user)
          );
        }
      }
    } catch (err) {
      console.error(
        "Failed to load current user:",
        err
      );
    }
  }, []);

  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);





  const getCurrentUserName = () => {
    if (!currentUser) {
      return "Employee";
    }

    return (
      currentUser.full_name ||
      currentUser.fullName ||
      currentUser.name ||
      currentUser.username ||
      currentUser.email ||
      "Employee"
    );
  };





  const getCurrentUserRole = () => {
    if (!currentUser) {
      return "";
    }

    return (
      currentUser.role ||
      currentUser.role_type ||
      currentUser.user_role ||
      currentUser.position ||
      ""
    );
  };





  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      let response;

      if (api.getPosts) {
        response = await api.getPosts();
      } else if (api.get) {
        response = await api.get("/posts");
      } else {
        throw new Error(
          "getPosts API function is not available."
        );
      }

      const data = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : response?.posts ||
          response?.data?.posts ||
          response?.data?.data ||
          [];

      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(
        "Error fetching posts:",
        err
      );

      setError(
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load posts."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);





  const toggleAllPosts = () => {
    setShowAllPosts((previous) => !previous);
  };





  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };





  const handleOpenUploadModal = () => {
    setFormData({
      title: "",
      description: "",
      youtube_url: "",
      category: "Amakuru",
      image: null,
    });

    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setIsUploadModalOpen(true);
  };





  const handleCloseUploadModal = () => {
    if (actionLoading) {
      return;
    }

    setIsUploadModalOpen(false);
    setError("");

    setFormData({
      title: "",
      description: "",
      youtube_url: "",
      category: "Amakuru",
      image: null,
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };





  const getAuthorName = (post) => {
    if (!post) {
      return "Unknown Author";
    }

    if (
      typeof post.Author === "string" &&
      post.Author.trim() !== ""
    ) {
      return post.Author;
    }

    if (
      typeof post.author === "string" &&
      post.author.trim() !== ""
    ) {
      return post.author;
    }

    if (
      post.author &&
      typeof post.author === "object"
    ) {
      return (
        post.author.full_name ||
        post.author.fullName ||
        post.author.name ||
        post.author.username ||
        post.author.email ||
        "Unknown Author"
      );
    }

    return (
      post.user_name ||
      post.username ||
      post.postedBy ||
      post.authorName ||
      "Staff Member"
    );
  };





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
      return `${API_ROOT}${image}`;
    }

    if (image.startsWith("uploads/")) {
      return `${API_ROOT}/${image}`;
    }

    return `${API_ROOT}/uploads/${image}`;
  };





  const getPostDate = (post) => {
    const date =
      post?.createdDate ||
      post?.created_at ||
      post?.createdAt;

    if (!date) {
      return "";
    }

    try {
      return new Date(date).toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    } catch {
      return "";
    }
  };





  const handleViewPost = (post) => {
    setSelectedPost(post);
    setError("");
  };





  const handleCloseViewPost = () => {
    setSelectedPost(null);
  };





  const getYoutubeUrl = (post) => {
    return (
      post?.youtube_url ||
      post?.youtubeUrl ||
      post?.youtube ||
      ""
    );
  };





  const handleSubmit = async (e) => {
    e.preventDefault();

    setActionLoading(true);
    setError("");

    try {
      const authorName = getCurrentUserName();

      if (
        !currentUser ||
        authorName === "Employee"
      ) {
        setError(
          "Your account information could not be found. Please login again."
        );

        return;
      }





      if (!formData.title.trim()) {
        setError(
          "Please enter the post title."
        );

        return;
      }

      if (!formData.description.trim()) {
        setError(
          "Please enter the news content."
        );

        return;
      }





      const data = new FormData();

      data.append(
        "title",
        formData.title.trim()
      );

      data.append(
        "description",
        formData.description.trim()
      );

      data.append(
        "youtube_url",
        formData.youtube_url.trim()
      );

      data.append(
        "category",
        formData.category
      );


      data.append(
        "author",
        authorName
      );

      if (
        currentUser.id ||
        currentUser.user_id
      ) {
        data.append(
          "author_id",
          String(
            currentUser.id ||
            currentUser.user_id
          )
        );
      }

      if (currentUser.role) {
        data.append(
          "author_role",
          currentUser.role
        );
      }

      if (currentUser.role_type) {
        data.append(
          "author_role",
          currentUser.role_type
        );
      }

      if (formData.image) {
        data.append(
          "image",
          formData.image
        );
      }








      if (api.addPost) {
        await api.addPost(data);
      } else if (api.post) {
        await api.post(
          "/posts",
          data
        );
      } else {
        throw new Error(
          "addPost API function is not available."
        );
      }





      handleCloseUploadModal();

      await fetchPosts();
    } catch (err) {
      console.error(
        "Error creating post:",
        err
      );

      setError(
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to publish post."
      );
    } finally {
      setActionLoading(false);
    }
  };





  return (
    <div className="space-y-6">



      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:flex-row lg:items-center lg:justify-between">

        <div className="flex min-w-0 items-center gap-3">

          <img
            src={rubavuLogo}
            alt="Rubavu Today"
            className="h-11 w-11 shrink-0 rounded-full border border-slate-200 object-cover sm:h-14 sm:w-14"
          />

          <div className="min-w-0">

            <h1 className="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-2xl">
              Ahakorerwa umukozi
            </h1>

            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Kora inkuru usome iziri mu biro by'amakuru
              stories.
            </p>

          </div>

        </div>



        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

          <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2.5">

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
              {getCurrentUserName()
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="min-w-0">

              <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-500">
                Winjiye nka
              </p>

              <p className="max-w-[180px] truncate text-sm font-bold text-blue-900">
                {getCurrentUserName()}
              </p>

              {getCurrentUserRole() && (
                <p className="text-[10px] text-blue-600">
                  {getCurrentUserRole()}
                </p>
              )}

            </div>

          </div>

          <button
            type="button"
            onClick={handleOpenUploadModal}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:w-auto"
          >
            <Upload className="h-4 w-4" />

            Shyiraho inkuru
          </button>

        </div>

      </div>



      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">

        <div className="flex gap-3">

          <Lock className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

          <div>

            <p className="text-sm font-semibold text-amber-900">
              Uburenganzira bw'umukozi
            </p>

            <p className="mt-1 text-xs leading-5 text-amber-700 sm:text-sm">
              Ushobora gushyiraho inkuru nshya no
              gusoma iziri mu biro by'amakuru. Inkuru
              zisanzwe ntizihindurirwa kuri konti
              y'umukozi.
            </p>

          </div>

        </div>

      </div>



      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 sm:p-4">

        <div className="flex gap-3">

          <User className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

          <div>

            <p className="text-sm font-semibold text-emerald-900">
              Izina ryawe ryishyirwaho ubwaryo
            </p>

            <p className="mt-1 text-xs leading-5 text-emerald-700 sm:text-sm">
              Inkuru ushyizeho zihita zigaragaza
              izina rya konti yawe:

              <strong className="ml-1">
                {getCurrentUserName()}
              </strong>

              . Ntushobora guhindura izina ry'umwanditsi
              kuri uru rupapuro.
            </p>

          </div>

        </div>

      </div>



      {error && !isUploadModalOpen && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">

          <p className="text-sm font-medium text-red-600">
            {error}
          </p>

        </div>
      )}



      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">



        <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between">

          <div>

            <h2 className="text-base font-bold text-slate-900 sm:text-lg">
              Inkuru
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              Inkuru zose zo mu biro by'amakuru —
              kuzireba no kuzisoma gusa
            </p>

          </div>

          <div className="flex items-center gap-2">

            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
              {posts.length} Inkuru
            </span>

            <button
              type="button"
              onClick={toggleAllPosts}
              className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition ${showAllPosts
                ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
            >

              {showAllPosts ? (
                <>
                  <EyeOff className="h-4 w-4" />

                  Hisha zose
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />

                  Erekana zose
                </>
              )}

            </button>

          </div>

        </div>



        {!showAllPosts ? (

          <div className="p-12 text-center">

            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">

              <EyeOff className="h-7 w-7 text-slate-400" />

            </div>

            <p className="text-sm font-semibold text-slate-700">
              Inkuru zose zihishe
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Kanda “Erekana zose” kugira ngo uzibone.
            </p>

            <button
              type="button"
              onClick={toggleAllPosts}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Eye className="h-4 w-4" />

              Erekana inkuru zose
            </button>

          </div>

        ) : loading ? (



          <div className="flex items-center justify-center gap-2 p-12 text-sm text-slate-500">

            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />

            Inkuru zirimo gutegurwa...

          </div>

        ) : posts.length === 0 ? (



          <div className="p-12 text-center">

            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-3xl">
              📰
            </div>

            <p className="text-sm font-medium text-slate-700">
              Nta nkuru zihari.
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Kanda “Shyiraho inkuru” ukore
              inkuru yawe ya mbere.
            </p>

          </div>

        ) : (





          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-3 xl:grid-cols-4">

            {posts.map((post) => {

              const imageUrl =
                getImageUrl(post);

              return (

                <div
                  key={
                    post.id ||
                    post._id
                  }
                  className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >



                  <div className="relative h-44 w-full overflow-hidden bg-slate-200">

                    {imageUrl ? (

                      <img
                        src={imageUrl}
                        alt={
                          post.title ||
                          "News image"
                        }
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.style.display =
                            "none";
                        }}
                      />

                    ) : (

                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">

                        <span className="text-4xl">
                          📰
                        </span>

                      </div>

                    )}



                    <span className="absolute left-3 top-3 rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow">

                      {post.category ||
                        "General"}

                    </span>

                  </div>



                  <div className="flex flex-1 flex-col p-4">

                    <h3 className="line-clamp-2 text-base font-bold leading-snug text-slate-900">

                      {post.title ||
                        "Untitled Post"}

                    </h3>



                    <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-600">

                      {post.description ||
                        post.content ||
                        "No content available."}

                    </p>



                    <div className="mt-4 flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-2">

                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">

                        <User className="h-3.5 w-3.5" />

                      </div>

                      <div className="min-w-0">

                        <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                          Written by
                        </p>

                        <p className="truncate text-xs font-bold text-slate-700">

                          {getAuthorName(post)}

                        </p>

                      </div>

                    </div>



                    <div className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-400">

                      <Calendar className="h-3 w-3" />

                      {getPostDate(post) ||
                        "Date unavailable"}

                    </div>



                    <div className="mt-4 border-t border-slate-100 pt-3">

                      <button
                        type="button"
                        onClick={() =>
                          handleViewPost(post)
                        }
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700"
                      >

                        <BookOpen className="h-4 w-4" />

                        Open & Read Post

                      </button>

                    </div>

                  </div>

                </div>

              );
            })}

          </div>

        )}

      </div>



      {selectedPost && (

        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-950/70 p-3 backdrop-blur-sm sm:p-5">

          <div className="my-auto max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl">



            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-7">

              <div className="min-w-0">

                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                  News Article
                </p>

                <h2 className="mt-1 truncate text-lg font-bold text-slate-900 sm:text-xl">
                  {selectedPost.title ||
                    "Untitled Post"}
                </h2>

              </div>

              <button
                type="button"
                onClick={
                  handleCloseViewPost
                }
                className="ml-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
              >

                <X className="h-5 w-5" />

              </button>

            </div>



            <div className="p-5 sm:p-7">



              {getImageUrl(
                selectedPost
              ) && (

                  <div className="mb-6 overflow-hidden rounded-2xl bg-slate-100">

                    <img
                      src={getImageUrl(
                        selectedPost
                      )}
                      alt={
                        selectedPost.title ||
                        "News"
                      }
                      className="max-h-[500px] w-full object-cover"
                    />

                  </div>

                )}



              <div className="mb-4 flex flex-wrap items-center gap-2">

                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700">

                  <Tag className="h-3.5 w-3.5" />

                  {selectedPost.category ||
                    "General"}

                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">

                  <Calendar className="h-3.5 w-3.5" />

                  {getPostDate(
                    selectedPost
                  )}

                </span>

              </div>



              <h1 className="text-2xl font-extrabold leading-tight text-slate-900 sm:text-4xl">

                {selectedPost.title ||
                  "Untitled Post"}

              </h1>



              <div className="mt-5 flex items-center gap-3 border-b border-slate-200 pb-5">

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">

                  {getAuthorName(
                    selectedPost
                  )
                    .charAt(0)
                    .toUpperCase()}

                </div>

                <div>

                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Written by
                  </p>

                  <p className="text-sm font-bold text-slate-800">

                    {getAuthorName(
                      selectedPost
                    )}

                  </p>

                </div>

              </div>



              <article className="mt-7">

                <div className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-700 sm:text-base sm:leading-8">

                  {selectedPost.description ||
                    selectedPost.content ||
                    "No article content available."}

                </div>

              </article>



              {getYoutubeUrl(
                selectedPost
              ) && (

                  <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-4">

                    <p className="text-xs font-bold uppercase tracking-wide text-red-700">
                      YouTube Video
                    </p>

                    <a
                      href={getYoutubeUrl(
                        selectedPost
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 block break-all text-sm font-semibold text-red-600 underline hover:text-red-800"
                    >
                      {getYoutubeUrl(
                        selectedPost
                      )}
                    </a>

                  </div>

                )}



              <div className="mt-8 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">

                <Lock className="h-5 w-5 shrink-0 text-amber-600" />

                <p className="text-xs leading-5 text-amber-700 sm:text-sm">

                  This post is read-only for
                  employee accounts. Employees
                  cannot edit existing posts.

                </p>

              </div>



              <div className="mt-6 flex justify-end">

                <button
                  type="button"
                  onClick={
                    handleCloseViewPost
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >

                  <X className="h-4 w-4" />

                  Close

                </button>

              </div>

            </div>

          </div>

        </div>

      )}



      {isUploadModalOpen && (

        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5">

          <div className="my-auto max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">



            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-7">

              <div>

                <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                  Upload News Post
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">

                  Author:

                  <strong className="ml-1 text-blue-600">

                    {getCurrentUserName()}

                  </strong>

                </p>

              </div>

              <button
                type="button"
                onClick={
                  handleCloseUploadModal
                }
                disabled={actionLoading}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50"
              >

                <X className="h-5 w-5" />

              </button>

            </div>



            <div className="p-5 sm:p-7">

              {error && (

                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3">

                  <p className="text-xs font-medium text-red-600">
                    {error}
                  </p>

                </div>

              )}

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >



                <div>

                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-700">
                    Post Title
                  </label>

                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={
                      handleInputChange
                    }
                    required
                    placeholder="Catchy headline..."
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>



                <div>

                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-700">
                    Published By
                  </label>

                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">

                      {getCurrentUserName()
                        .charAt(0)
                        .toUpperCase()}

                    </div>

                    <div className="min-w-0">

                      <p className="truncate text-sm font-bold text-slate-800">

                        {getCurrentUserName()}

                      </p>

                      <p className="text-[10px] text-slate-400">

                        Automatically taken from
                        your account

                      </p>

                    </div>

                    <Lock className="ml-auto h-4 w-4 text-slate-400" />

                  </div>

                </div>



                <div>

                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-700">
                    Category
                  </label>

                  <select
                    name="category"
                    value={
                      formData.category
                    }
                    onChange={
                      handleInputChange
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >

                    {departments.map(
                      (dept) => (

                        <option
                          key={dept.name}
                          value={dept.name}
                        >

                          {dept.icon}{" "}
                          {dept.name}

                        </option>

                      )
                    )}

                  </select>

                </div>



                <div>

                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-700">
                    Description / Content
                  </label>

                  <textarea
                    name="description"
                    rows={8}
                    value={
                      formData.description
                    }
                    onChange={
                      handleInputChange
                    }
                    required
                    placeholder="Write the full news story here..."
                    className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm leading-6 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>



                <div>

                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-700">

                    YouTube URL

                    <span className="ml-1 font-normal normal-case text-slate-400">
                      Optional
                    </span>

                  </label>

                  <input
                    type="url"
                    name="youtube_url"
                    value={
                      formData.youtube_url
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>



                <div>

                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-700">
                    Featured Image
                  </label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setFormData(
                        (previous) => ({
                          ...previous,
                          image:
                            e.target
                              .files?.[0] ||
                            null,
                        })
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-blue-700"
                  />

                  <p className="mt-1.5 text-[10px] text-slate-400">
                    Recommended: JPG, PNG or
                    WEBP.
                  </p>

                </div>



                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">

                  <button
                    type="button"
                    onClick={
                      handleCloseUploadModal
                    }
                    disabled={actionLoading}
                    className="w-full rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 sm:w-auto"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >

                    {actionLoading && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}

                    Publish Post

                  </button>

                </div>

              </form>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Employee;