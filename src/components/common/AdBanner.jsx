import React from "react";

const SIZE_CLASSES = {
    "728x250": "aspect-[728/250] w-full",
    "600x210": "aspect-[600/210] w-full",
    "1024x358": "aspect-[1024/358] w-full",
    "1100x130": "aspect-[110/13] w-full",
    "leaderboard": "w-full max-w-full h-auto min-h-[100px] sm:min-h-[120px]",
    "rectangle": "w-full max-w-sm h-auto min-h-[300px] sm:min-h-[350px]",
    "mobile": "w-full h-auto min-h-[100px] sm:min-h-[120px]",
    "flexible": "w-full h-auto min-h-[120px] sm:min-h-[140px]",
    "728x90": "aspect-[728/90] w-full",
    "300x250": "w-full max-w-sm h-auto min-h-[300px] sm:min-h-[350px]",
    "320x100": "w-full h-auto min-h-[100px] sm:min-h-[120px]",
};

const normalizeAdUrl = (ad) => {
    if (!ad) return "";

    const candidates = [ad.target_url, ad.link, ad.url, ad.href];

    for (const candidate of candidates) {
        const value = String(candidate || "").trim();

        if (!value || value.toLowerCase() === "null" || value === "#") {
            continue;
        }

        return value;
    }

    return "";
};

const normalizeCtaText = (ad) => {
    if (!ad) return "";

    return (
        ad.ctaText ||
        ad.cta_text ||
        ad.buttonText ||
        ad.callToAction ||
        ad.cta ||
        ad.linkText ||
        ""
    );
};

const getHighQualityAdImage = (image) => {
    if (typeof image !== "string" || !image.includes("res.cloudinary.com")) {
        return image;
    }

    return image.replace("/upload/", "/upload/f_auto,q_auto:best/");
};

const prefersReducedMotion = () => {
    if (typeof window === "undefined" || !window.matchMedia) {
        return false;
    }

    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

const AdBanner = ({
    ad,
    size = "leaderboard",
    label = "Advertise",
    loading = "lazy",
    sticky = false,
    onClose,
}) => {
    const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES["leaderboard"];
    const hasAdImage = Boolean(ad?.image);
    const targetUrl = normalizeAdUrl(ad);
    const ctaText = normalizeCtaText(ad);
    const title = ad?.title || ad?.name || label || "Rubavu Today";
    const description = ad?.description || ad?.subtitle || "";
    const reducedMotion = prefersReducedMotion();

    const content = hasAdImage ? (
        <div className="relative h-full w-full overflow-hidden bg-slate-100">
            <img
                src={getHighQualityAdImage(ad.image)}
                alt={title}
                loading={loading}
                decoding="async"
                className="absolute inset-0 h-full w-full select-none object-cover"
                style={{
                    transform: reducedMotion ? "none" : "scale(1.04)",
                    animation: reducedMotion ? "none" : "ad-pan 16s ease-in-out infinite alternate",
                }}
            />

            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/20 via-slate-900/5 to-slate-900/5" />
        </div>
    ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 px-4 py-6 text-center">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
        </div>
    );

    const banner = targetUrl ? (
        <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={title}
            className="block h-full w-full"
        >
            {content}
        </a>
    ) : (
        <div className="block h-full w-full">{content}</div>
    );

    return (
        <>
            <style>{`\n                @keyframes ad-pan {\n                    0% { transform: scale(1.04) translateX(0); }\n                    50% { transform: scale(1.08) translateX(-1.5%); }\n                    100% { transform: scale(1.12) translateX(1.5%); }\n                }\n\n                @keyframes ad-slide-in {\n                    0% { opacity: 0; transform: translateX(-16px); }\n                    100% { opacity: 1; transform: translateX(0); }\n                }\n\n                @keyframes ad-fade-up {\n                    0% { opacity: 0; transform: translateY(10px); }\n                    100% { opacity: 1; transform: translateY(0); }\n                }\n\n                @keyframes ad-cta {\n                    0% { opacity: 0; transform: scale(0.96); }\n                    60% { opacity: 1; transform: scale(1.04); }\n                    100% { opacity: 1; transform: scale(1); }\n                }\n            `}</style>

            <aside
                aria-label={label}
                className={`${sticky ? "fixed bottom-3 left-3 right-3 z-50 mx-auto sm:bottom-4" : "mx-auto w-full"} ${sizeClass} overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md`}
            >
                <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-white">
                    {banner}
                    {sticky && onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Funga advertisement"
                            className="absolute right-2 top-2 z-30 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-sm font-bold leading-none text-white transition hover:bg-red-600 hover:scale-110"
                        >
                            ×
                        </button>
                    )}
                </div>
            </aside>
        </>
    );
};

export default AdBanner;
