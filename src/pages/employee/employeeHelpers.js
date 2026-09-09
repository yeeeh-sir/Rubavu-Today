import { API_ROOT } from "../../services/api";

export const DEPARTMENTS = [
  "Amakuru",
  "Ubukungu",
  "Imikino",
  "Imyidagaduro",
  "Uburezi",
];

export const DEPARTMENT_COLORS = {
  Amakuru: "bg-blue-100 text-blue-700",
  Ubukungu: "bg-emerald-100 text-emerald-700",
  Imikino: "bg-orange-100 text-orange-700",
  Imyidagaduro: "bg-pink-100 text-pink-700",
  Uburezi: "bg-purple-100 text-purple-700",
};

export const DEPARTMENT_ICONS = {
  Amakuru: "📰",
  Ubukungu: "💼",
  Imikino: "⚽",
  Imyidagaduro: "🎭",
  Uburezi: "🎓",
};

export const getStatus = (post) =>
  String(post?.status || "pending").toLowerCase();

export const getPostId = (post) => post?.id || post?._id || post?.post_id;

export const getCategory = (post) =>
  post?.category || post?.Category || "Amakuru";

export const getImageUrl = (post) => {
  const image =
    post?.image ||
    post?.image_url ||
    post?.imageUrl ||
    post?.photo ||
    post?.thumbnail;

  if (!image) return null;

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

export const parseTags = (post) => {
  const raw = post?.tags;
  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (!raw) return [];
  return String(raw)
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
};

export const toDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed;
};

export const formatDate = (post, key = "createdDate") => {
  const date = toDate(post?.[key] || post?.created_at || post?.createdAt);
  return date
    ? date.toLocaleString("rw-RW", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Itariki ntiboneka";
};

export const formatShortDate = (value) => {
  const date = toDate(value);
  return date
    ? date.toLocaleDateString("rw-RW", { day: "2-digit", month: "short", year: "numeric" })
    : "—";
};

export const splitTagsInput = (value) =>
  String(value || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 12);

export const errorMessage = (err, fallback) =>
  err?.message || err?.error || fallback;