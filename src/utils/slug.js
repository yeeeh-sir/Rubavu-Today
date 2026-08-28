export function slugifyTitle(value) {
    if (value === undefined || value === null) {
        return "";
    }

    const normalized = String(value)
        .replace(/&/g, " and ")
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[’'`]/g, "")
        .replace(/[^\p{L}\p{N}\s-]/gu, " ")
        .replace(/[\s_]+/g, " ")
        .trim();

    if (!normalized) {
        return "";
    }

    const slug = normalized
        .split(" ")
        .filter(Boolean)
        .map((word) => word.replace(/^-+|-+$/g, ""))
        .filter(Boolean)
        .join("-");

    return slug
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export function getArticleUrl(postOrSlug) {
    if (!postOrSlug) {
        return "/";
    }

    if (typeof postOrSlug === "string") {
        const slug = String(postOrSlug).replace(/\.html$/i, "").trim();
        return slug ? `/${slug}.html` : "/";
    }

    const postId = postOrSlug.id || postOrSlug._id;

    return postId ? `/post/${postId}` : "/";
}
