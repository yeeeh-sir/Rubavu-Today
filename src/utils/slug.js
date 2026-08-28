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

    const slugSource =
        typeof postOrSlug === "string"
            ? postOrSlug
            : postOrSlug.slug || postOrSlug.title || "";

    const slug = String(slugSource).replace(/\.html$/i, "").trim();

    if (!slug) {
        return "/";
    }

    return `/${slug}`;
}
