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

export function slugify(value) {
    return slugifyTitle(value);
}

export function getPostSlug(post) {
    if (!post) {
        return "";
    }

    if (post.slug && String(post.slug).trim()) {
        return String(post.slug)
            .replace(/\.html$/i, "")
            .trim()
            .replace(/\/+$/, "");
    }

    return slugifyTitle(post.title);
}

export function getArticleUrl(postOrSlug) {
    if (!postOrSlug) {
        return "/";
    }

    if (typeof postOrSlug === "string") {
        const slug = String(postOrSlug)
            .replace(/\.html$/i, "")
            .trim()
            .replace(/\/+$/, "");

        return slug ? `/${slug}` : "/";
    }

    const slug = getPostSlug(postOrSlug);

    return slug ? `/${slug}` : "/";
}
