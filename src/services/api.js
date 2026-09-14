

export const API_BASE_URL = (
  process.env.REACT_APP_API_URL ||
  `${window.location.origin}/api`
).replace(/\/+$/, "");

export const API_ROOT = API_BASE_URL.replace(
  /\/api$/i,
  ""
);

export const normalizeImageUrl = (image) => {
  if (!image) return null;

  if (
    typeof image === "string" &&
    (image.startsWith("http://") ||
      image.startsWith("https://"))
  ) {
    return image.replace(/^http:\/\//, "https://");
  }

  if (image.startsWith("/")) {
    return `${API_ROOT}${image}`;
  }

  if (image.startsWith("uploads/")) {
    return `${API_ROOT}/${image}`;
  }

  return `${API_ROOT}/uploads/${image}`;
};

export const getProfileImageUrl = (user) => {
  if (!user) return null;

  const candidate =
    user.profile_image_url ||
    user.profile_image ||
    user.avatar ||
    null;

  if (!candidate) return null;

  return normalizeImageUrl(candidate);
};

export const normalizePost = (post) => ({
  ...post,

  id: post.id,

  title: post.title || "",

  category: post.category || "",

  description: post.description || "",

  summary:
    post.summary ||
    post.description ||
    "",

  content:
    post.content ||
    post.description ||
    "",

  image: normalizeImageUrl(post.image),

  youtube_url:
    post.youtube_url || null,

  author:
    post.author &&
      typeof post.author === "object"
      ? {
        ...post.author,
        profile_image: post.author.profile_image
          ? normalizeImageUrl(post.author.profile_image)
          : null,
      }
      : post.Author ||
      post.author ||
      post.author_name ||
      "",

  author_profile_image:
    post.author_profile_image ||
      (post.author && typeof post.author === "object"
        ? post.author.profile_image
        : null)
      ? normalizeImageUrl(
        post.author_profile_image || post.author.profile_image
      )
      : null,

  slug: post.slug || "",

  status: post.status || "",

  createdDate:
    post.createdDate ||
    post.created_at ||
    null,

  rejection_reason:
    post.rejection_reason || null,

  approved_by:
    post.approved_by || null,

  approved_at:
    post.approved_at || null,
});

const getStorage = () => {
  try {
    return window.localStorage;
  } catch (error) {
    console.warn("Browser storage is unavailable; continuing as signed out.");
    return null;
  }
};

export const getToken = () => {
  const storage = getStorage();

  return storage?.getItem("admin_token") ||
    storage?.getItem("token") ||
    null;
};

export const getTokenValue = () => getToken();

export const getStoredUser = () => {
  const storage = getStorage();
  const storedUser =
    storage?.getItem("admin_user") ||
    storage?.getItem("user");

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch (error) {
    console.error(
      "Unable to parse stored user:",
      error
    );

    return null;
  }
};

export function isLoggedIn() {
  return Boolean(getToken());
}

export const isAuthenticated = () => isLoggedIn();

const setAuthStorage = (token, user) => {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  if (token) {
    storage.setItem("admin_token", token);
    storage.setItem("token", token);
  }

  if (user) {
    storage.setItem(
      "admin_user",
      JSON.stringify(user)
    );

    storage.setItem(
      "user",
      JSON.stringify(user)
    );
  }
};

export const clearAuthStorage = () => {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  storage.removeItem("admin_token");
  storage.removeItem("admin_user");
  storage.removeItem("token");
  storage.removeItem("user");
};

export const getAuthHeaders = () => {
  const headers = {
    Accept: "application/json",
  };

  const token = getToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

export const getFormDataHeaders = () =>
  getAuthHeaders();

export async function handleResponse(response) {
  let data = null;

  try {
    data = await response.json();
  } catch (error) {
    data = null;
  }

  if (!response.ok) {
    const message =
      data?.error ||
      data?.message ||
      `Request failed with status ${response.status}`;

    const err = new Error(message);
    err.status = response.status;
    err.response = { status: response.status, data };
    throw err;
  }

  return data;
}

export async function request(endpoint, options = {}) {
  const response = await fetch(`${API_ROOT}${endpoint}`, {
    ...options,

    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });

  return handleResponse(response);
}

export async function login(
  credentialsOrEmail,
  passwordArg
) {
  const payload =
    typeof credentialsOrEmail === "object" &&
      credentialsOrEmail !== null
      ? credentialsOrEmail
      : {
        email: credentialsOrEmail,
        password: passwordArg,
      };

  const response = await fetch(
    `${API_ROOT}/api/auth/login`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },

      body: JSON.stringify({
        email: payload.email,
        password: payload.password,
      }),
    }
  );

  const data = await handleResponse(response);

  setAuthStorage(data.token, data.user);

  return data;
}

export async function logout() {
  const token = getToken();

  clearAuthStorage();

  try {
    if (token) {
      await fetch(`${API_ROOT}/api/auth/logout`, {
        method: "POST",

        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
    }
  } catch (error) {
    console.error("Logout request error:", error);
  } finally {
    clearAuthStorage();
  }
}

export async function getCurrentUser() {
  const data = await request("/api/auth/me");
  const user = data?.user || data;

  if (user) {
    setAuthStorage(getToken(), user);
  }

  return user;
}

export async function changeMyPassword(
  currentPassword,
  newPassword
) {
  return request("/api/auth/change-password", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
    }),
  });
}

export async function changeMyEmail(
  newEmail,
  currentPassword
) {
  const data = await request("/api/auth/change-email", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      new_email: newEmail,
      current_password: currentPassword,
    }),
  });

  if (data?.user) {
    setAuthStorage(getToken(), data.user);
  }

  return data;
}

export async function updateProfile(payload = {}) {
  return request("/api/profile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function uploadProfileImage(imageFile) {
  if (!imageFile) {
    throw new Error("No image file was selected.");
  }

  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await fetch(
    `${API_ROOT}/api/profile/image`,
    {
      method: "PUT",
      headers: getFormDataHeaders(),
      body: formData,
    }
  );

  const data = await handleResponse(response);

  const profileImage = data?.profile_image || null;
  const profileImageUrl = data?.profile_image_url || profileImage;

  if (profileImageUrl) {
    const storedUser = getStoredUser();

    if (storedUser) {
      const updatedUser = {
        ...storedUser,
        profile_image: profileImageUrl,
        profile_image_url: profileImageUrl,
        profile_image_public_id: data?.profile_image_public_id || storedUser.profile_image_public_id || null,
      };

      setAuthStorage(getToken(), updatedUser);
    }
  }

  return data;
}

export const getCurrentUserRole = () => {
  const user = getStoredUser();

  return (
    user?.role_type ||
    user?.role ||
    user?.position ||
    ""
  );
};

export const isAdmin = () => {
  const user = getStoredUser();

  return (
    String(
      user?.role_type || user?.role || ""
    ).toLowerCase() === "admin"
  );
};

export const isChiefEditor = () => {
  const value = String(
    getCurrentUserRole()
  ).toLowerCase();

  return value.includes("chief");
};

export const isEmployee = () => {
  const user = getStoredUser();

  return (
    Boolean(user) &&
    !isAdmin() &&
    !isChiefEditor()
  );
};

let postsInFlightPromise = null;
let cachedPosts = null;
let cachedPostsAt = 0;

const POSTS_CACHE_TTL_MS = 45 * 1000;

const postDetailCache = new Map();

const POST_DETAIL_CACHE_TTL_MS = 60 * 1000;

const cachePostDetail = (key, post) => {
  postDetailCache.set(key, { at: Date.now(), post });
};

const readPostDetailCache = (key) => {
  const entry = postDetailCache.get(key);

  if (entry && Date.now() - entry.at < POST_DETAIL_CACHE_TTL_MS) {
    return entry.post;
  }

  postDetailCache.delete(key);

  return null;
};

export const invalidatePostsCache = () => {
  cachedPosts = null;
  cachedPostsAt = 0;
  postDetailCache.clear();
};

export const getPosts = async () => {
  // Return a short-TTL snapshot of the last successful fetch so
  // repeated mounts (Navbar, Home, WebsiteChat, related posts) don't
  // hammer the backend. The same resolved promise is shared between
  // concurrent callers while a request is in flight; both layers are
  // dropped once the data is stale or explicitly invalidated.
  if (
    cachedPosts &&
    Date.now() - cachedPostsAt < POSTS_CACHE_TTL_MS
  ) {
    return cachedPosts;
  }

  if (postsInFlightPromise) return postsInFlightPromise;

  const load = async () => {
    const response = await fetch(`${API_BASE_URL}/posts`);

    if (!response.ok) {
      throw new Error("Unable to load posts from the server.");
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      return [];
    }

    const posts = data
      .filter((post) => String(post.status || "").toLowerCase() === "approved")
      .map(normalizePost);

    cachedPosts = posts;
    cachedPostsAt = Date.now();

    return posts;
  };

  postsInFlightPromise = load().finally(() => {
    postsInFlightPromise = null;
  });

  return postsInFlightPromise;
};

export const getPostById = async (id) => {
  const cacheKey = `id:${id}`;

  const cached = readPostDetailCache(cacheKey);

  if (cached) {
    return cached;
  }

  const response = await fetch(
    `${API_BASE_URL}/posts/${id}`
  );

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }

    throw new Error("Unable to load this post.");
  }

  const data = await response.json();

  if (!data) {
    return null;
  }

  if (
    String(data.status || "").toLowerCase() !==
    "approved"
  ) {
    return null;
  }

  const post = normalizePost(data);

  cachePostDetail(cacheKey, post);

  return post;
};

export const getPostBySlug = async (slug) => {
  const safeSlug = String(slug || "")
    .replace(/\.html$/i, "")
    .trim()
    .replace(/\/+$/, "");

  if (!safeSlug) {
    return null;
  }

  const cacheKey = `slug:${safeSlug}`;

  const cached = readPostDetailCache(cacheKey);

  if (cached) {
    return cached;
  }

  const response = await fetch(
    `${API_BASE_URL}/posts/slug/${encodeURIComponent(safeSlug)}`
  );

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }

    throw new Error("Unable to load this post.");
  }

  const data = await response.json();

  if (!data) {
    return null;
  }

  if (
    String(data.status || "").toLowerCase() !==
    "approved"
  ) {
    return null;
  }

  const post = normalizePost(data);

  cachePostDetail(cacheKey, post);

  return post;
};

export async function getPublicPosts() {
  return request("/api/posts");
}

export async function getPost(id) {
  return request(`/api/posts/${id}`);
}

export async function getAdminPosts() {
  return request("/api/admin/posts");
}

export async function getAdminPostById(id) {
  const data = await request(`/api/admin/posts/${id}`);
  return data ? normalizePost(data) : null;
}

export async function getPendingPosts() {
  return request("/api/admin/posts/pending");
}

export async function getChiefEditorPosts() {
  return request("/api/chief-editor/posts");
}

export async function getChiefEditorPendingPosts() {
  return request(
    "/api/chief-editor/posts/pending"
  );
}

export async function approvePost(postId) {
  if (!postId) {
    throw new Error("Post ID is required.");
  }

  const result = await request(
    `/api/chief-editor/posts/${postId}/approve`,
    { method: "PUT" }
  );

  invalidatePostsCache();

  return result;
}

export async function rejectPost(
  postId,
  reason = ""
) {
  if (!postId) {
    throw new Error("Post ID is required.");
  }

  const result = await request(
    `/api/chief-editor/posts/${postId}/reject`,
    {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({ reason }),
    }
  );

  invalidatePostsCache();

  return result;
}

export async function reviewPost(postId) {
  if (!postId) {
    throw new Error("Post ID is required.");
  }

  const result = await request(
    `/api/chief-editor/posts/${postId}/review`,
    { method: "PUT" }
  );

  invalidatePostsCache();

  return result;
}

export async function updatePostStatus(
  postId,
  status,
  reason = ""
) {
  if (!postId) {
    throw new Error("Post ID is required.");
  }

  if (
    !["pending", "approved", "rejected"].includes(
      status
    )
  ) {
    throw new Error("Invalid post status.");
  }

  if (status === "approved") {
    return approvePost(postId);
  }

  if (status === "rejected") {
    return rejectPost(postId, reason);
  }

  return reviewPost(postId);
}

const buildPostFormData = (postData) => {
  const formData = new FormData();

  if (postData.title !== undefined) {
    formData.append("title", postData.title);
  }

  if (postData.category !== undefined) {
    formData.append(
      "category",
      postData.category
    );
  }

  if (postData.description !== undefined) {
    formData.append(
      "description",
      postData.description
    );
  }

  if (
    postData.youtube_url !== undefined &&
    postData.youtube_url !== null
  ) {
    formData.append(
      "youtube_url",
      postData.youtube_url
    );
  }

  if (
    postData.author !== undefined &&
    postData.author !== null
  ) {
    formData.append("author", postData.author);
  }

  if (
    postData.tags !== undefined &&
    postData.tags !== null
  ) {
    const tagsString = Array.isArray(postData.tags)
      ? postData.tags.filter(Boolean).join(",")
      : String(postData.tags);
    if (tagsString.trim()) {
      formData.append("tags", tagsString.trim());
    }
  }

  if (
    postData.location !== undefined &&
    postData.location !== null
  ) {
    if (String(postData.location).trim()) {
      formData.append("location", String(postData.location).trim());
    }
  }

  if (
    postData.summary !== undefined &&
    postData.summary !== null
  ) {
    if (String(postData.summary).trim()) {
      formData.append("summary", String(postData.summary).trim());
    }
  }

  if (
    postData.status !== undefined &&
    postData.status !== null
  ) {
    formData.append("status", String(postData.status));
  }

  if (postData.image) {
    formData.append("image", postData.image);
  }

  if (Array.isArray(postData.images)) {
    postData.images.forEach((file) => {
      if (file) {
        formData.append("images", file);
      }
    });
  }

  return formData;
};

export async function addPost(postData) {
  const body =
    postData instanceof FormData
      ? postData
      : buildPostFormData(postData);

  const response = await fetch(
    `${API_ROOT}/api/posts`,
    {
      method: "POST",

      headers: getFormDataHeaders(),

      body,
    }
  );

  const result = await handleResponse(response);

  invalidatePostsCache();

  return result;
}

export async function updatePost(
  id,
  postData
) {
  const body =
    postData instanceof FormData
      ? postData
      : buildPostFormData(postData);

  const response = await fetch(
    `${API_ROOT}/api/posts/${id}`,
    {
      method: "PUT",

      headers: getFormDataHeaders(),

      body,
    }
  );

  const result = await handleResponse(response);

  invalidatePostsCache();

  return result;
}

export async function deletePost(id) {
  const result = await request(`/api/posts/${id}`, {
    method: "DELETE",
  });

  invalidatePostsCache();

  return result;
}

export async function getDashboard() {
  return request("/api/chief-editor/dashboard");
}

export async function getChiefEditorDashboard() {
  return getDashboard();
}

export async function getMyPosts() {
  return request("/api/my-posts");
}

export async function getNotifications() {
  return request("/api/notifications");
}

export async function getUnreadNotificationsCount() {
  const data = await request("/api/notifications/unread-count");
  return Number(data?.unread || 0);
}

export async function markNotificationRead(id) {
  return request(`/api/notifications/${id}/read`, { method: "PUT" });
}

export async function markAllNotificationsRead() {
  return request("/api/notifications/read-all", { method: "PUT" });
}

export async function getMediaLibrary() {
  return request("/api/media-library");
}

export async function uploadMedia(imageFile) {
  if (!imageFile) {
    throw new Error("No image file was selected.");
  }

  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await fetch(
    `${API_ROOT}/api/media-library`,
    {
      method: "POST",
      headers: getFormDataHeaders(),
      body: formData,
    }
  );

  return handleResponse(response);
}

export async function deleteMedia(id) {
  return request(`/api/media-library/${id}`, {
    method: "DELETE",
  });
}

export async function getComments(postId) {
  return request(`/api/comments/${postId}`);
}

// List ALL comments across every post (Admin / Chief Editor role required).
export async function getAllComments() {
  return request("/api/comments");
}

export async function addComment(commentData) {
  return request("/api/comments", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(commentData),
  });
}

export const createComment = addComment;

export async function updateComment(
  commentId,
  nameOrPayload,
  commentText
) {
  const body =
    typeof nameOrPayload === "object" &&
      nameOrPayload !== null
      ? nameOrPayload
      : {
        name: nameOrPayload,
        comment: commentText,
      };

  return request(`/api/comments/${commentId}`, {
    method: "PUT",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(body),
  });
}

export async function deleteComment(id) {
  return request(`/api/comments/${id}`, {
    method: "DELETE",
  });
}

export async function toggleCommentLike(commentId, liked) {
  return request(`/api/comments/${commentId}/like`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ liked: Boolean(liked) }),
  });
}

export async function commitCommentReaction(commentId, action, deviceId) {
  return request(`/api/comments/${commentId}/reaction`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action, device_id: deviceId }),
  });
}

export async function getEmployees() {
  return request("/api/employees");
}

export async function getEmployeeById(id) {
  try {
    const employees = await getEmployees();

    return (
      employees.find(
        (emp) => emp.id === Number(id)
      ) || null
    );
  } catch {
    return null;
  }
}

export async function addEmployee(employeeData) {
  return request("/api/employees", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      full_name: employeeData.full_name,
      email: employeeData.email,
      phone: employeeData.phone || null,
      password: employeeData.password,
      role: employeeData.role || "reporter",
      status: employeeData.status || "active",
    }),
  });
}

export const createEmployee = addEmployee;

export async function updateEmployee(
  id,
  employeeData
) {
  return request(`/api/employees/${id}`, {
    method: "PUT",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(employeeData),
  });
}

export async function deleteEmployee(id) {
  return request(`/api/employees/${id}`, {
    method: "DELETE",
  });
}

export async function getChiefEditors() {
  return request("/api/chief-editors");
}

export async function addChiefEditor(
  chiefEditorData
) {
  return request("/api/chief-editors", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      full_name: chiefEditorData.full_name,
      email: chiefEditorData.email,
      phone: chiefEditorData.phone || null,
      password: chiefEditorData.password,
      status: chiefEditorData.status || "active",
    }),
  });
}

export const createChiefEditor = addChiefEditor;

export async function updateChiefEditor(
  id,
  chiefEditorData
) {
  return request(`/api/chief-editors/${id}`, {
    method: "PUT",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(chiefEditorData),
  });
}

export async function deleteChiefEditor(id) {
  return request(`/api/chief-editors/${id}`, {
    method: "DELETE",
  });
}

let cachedAdvertisements = null;
let cachedAdvertisementsAt = 0;

const ADVERTISEMENTS_CACHE_TTL_MS = 60 * 1000;

export const invalidateAdvertisementsCache = () => {
  cachedAdvertisements = null;
  cachedAdvertisementsAt = 0;
};

export async function getAdvertisements() {
  if (
    cachedAdvertisements &&
    Date.now() - cachedAdvertisementsAt <
      ADVERTISEMENTS_CACHE_TTL_MS
  ) {
    return cachedAdvertisements;
  }

  const data = await request(
    "/api/advertisements"
  );

  const list = Array.isArray(data)
    ? data
    : [];

  const ads = list.map((ad) => ({
    ...ad,
    image: normalizeImageUrl(ad.image),
  }));

  cachedAdvertisements = ads;
  cachedAdvertisementsAt = Date.now();

  return ads;
}

const appendAdvertisementFields = (
  formData,
  advertisementData
) => {
  if (
    advertisementData.title !== undefined
  ) {
    formData.append(
      "title",
      advertisementData.title
    );
  }

  if (
    advertisementData.description !==
    undefined
  ) {
    formData.append(
      "description",
      advertisementData.description
    );
  }

  if (
    advertisementData.target_url !== undefined
  ) {
    formData.append(
      "target_url",
      advertisementData.target_url
    );
  }

  if (
    advertisementData.link !== undefined
  ) {
    formData.append(
      "link",
      advertisementData.link
    );
  }

  if (
    advertisementData.position !== undefined
  ) {
    formData.append(
      "position",
      advertisementData.position
    );
  }

  if (
    advertisementData.start_date !== undefined
  ) {
    formData.append(
      "start_date",
      advertisementData.start_date
    );
  }

  if (
    advertisementData.end_date !== undefined
  ) {
    formData.append(
      "end_date",
      advertisementData.end_date
    );
  }

  if (
    advertisementData.status !== undefined
  ) {
    formData.append(
      "status",
      advertisementData.status
    );
  }

  if (advertisementData.image) {
    formData.append(
      "image",
      advertisementData.image
    );
  }

  return formData;
};

export async function addAdvertisement(
  advertisementData
) {
  const formData = appendAdvertisementFields(
    new FormData(),
    advertisementData
  );

  const response = await fetch(
    `${API_ROOT}/api/advertisements`,
    {
      method: "POST",

      headers: getFormDataHeaders(),

      body: formData,
    }
  );

  const result = await handleResponse(response);

  invalidateAdvertisementsCache();

  return result;
}

export async function updateAdvertisement(
  id,
  advertisementData
) {
  const formData = appendAdvertisementFields(
    new FormData(),
    advertisementData
  );

  const response = await fetch(
    `${API_ROOT}/api/advertisements/${id}`,
    {
      method: "PUT",

      headers: getFormDataHeaders(),

      body: formData,
    }
  );

  const result = await handleResponse(response);

  invalidateAdvertisementsCache();

  return result;
}

export async function deleteAdvertisement(id) {
  const result = await request(`/api/advertisements/${id}`, {
    method: "DELETE",
  });

  invalidateAdvertisementsCache();

  return result;
}

export async function healthCheck() {
  return request("/api/health");
}

async function rawRequest(endpoint, options = {}) {
  const isFormData =
    options.body instanceof FormData;

  try {
    const response = await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        ...options,

        headers: {
          ...(isFormData
            ? {}
            : options.body
              ? {
                "Content-Type":
                  "application/json",
              }
              : {}),
          ...getAuthHeaders(),
          ...(options.headers || {}),
        },
      }
    );

    const contentType =
      response.headers.get("content-type") || "";

    const data = contentType.includes(
      "application/json"
    )
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      const errorMessage =
        (typeof data === "object" &&
          (data?.error || data?.message)) ||
        `Request failed with status ${response.status}`;

      const error = new Error(errorMessage);
      error.response = {
        status: response.status,
        data,
      };
      throw error;
    }

    return { data, status: response.status };
  } catch (err) {
    if (!err.response) {
      console.error(
        `Network Error on ${options.method || "GET"
        } ${endpoint}:`,
        err
      );
    }

    throw err;
  }
}

const api = {

  get: (endpoint) =>
    rawRequest(endpoint),

  post: (endpoint, body) =>
    rawRequest(endpoint, {
      method: "POST",
      body:
        body instanceof FormData
          ? body
          : JSON.stringify(body),
    }),

  put: (endpoint, body) =>
    rawRequest(endpoint, {
      method: "PUT",
      body:
        body instanceof FormData
          ? body
          : JSON.stringify(body),
    }),

  delete: (endpoint) =>
    rawRequest(endpoint, {
      method: "DELETE",
    }),

  login,
  logout,
  getCurrentUser,
  changeMyPassword,
  changeMyEmail,
  uploadProfileImage,
  updateProfile,
  getToken,
  getTokenValue,
  getStoredUser,
  getAuthHeaders,
  getFormDataHeaders,
  isLoggedIn,
  isAuthenticated,
  getCurrentUserRole,
  isAdmin,
  isChiefEditor,
  isEmployee,

  getPosts,
  getPostById,
  getPostBySlug,
  getPost,
  getPublicPosts,
  getAdminPosts,
  getAdminPostById,
  getPendingPosts,
  getChiefEditorPosts,
  getChiefEditorPendingPosts,
  addPost,
  updatePost,
  deletePost,
  approvePost,
  rejectPost,
  reviewPost,
  updatePostStatus,
  getDashboard,
  getChiefEditorDashboard,
  getMyPosts,

  getNotifications,
  getUnreadNotificationsCount,
  markNotificationRead,
  markAllNotificationsRead,

  getMediaLibrary,
  uploadMedia,
  deleteMedia,

  getComments,
  getAllComments,
  addComment,
  createComment,
  updateComment,
  deleteComment,
  toggleCommentLike,
  commitCommentReaction,

  getEmployees,
  getEmployeeById,
  addEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,

  getChiefEditors,
  addChiefEditor,
  createChiefEditor,
  updateChiefEditor,
  deleteChiefEditor,

  getAdvertisements,
  addAdvertisement,
  updateAdvertisement,
  deleteAdvertisement,

  healthCheck,
  normalizeImageUrl,
  normalizePost,
};

export default api;
