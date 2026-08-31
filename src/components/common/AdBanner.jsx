import React from "react";

const SIZE_CLASSES = {
    // Size keys
    "728x250": "aspect-[728/250] w-full",
    "600x210": "aspect-[600/210] w-full",
    "1024x358": "aspect-[1024/358] w-full",
    "1100x130": "aspect-[110/13] w-full",
    "leaderboard": "w-full max-w-full h-auto min-h-[100px] sm:min-h-[120px]",
    "rectangle": "w-full max-w-sm h-auto min-h-[300px] sm:min-h-[350px]",
    "mobile": "w-full h-auto min-h-[100px] sm:min-h-[120px]",
    "flexible": "w-full h-auto min-h-[120px] sm:min-h-[140px]",
    // Legacy names for backward compatibility
    "728x90": "aspect-[728/90] w-full",
    "300x250": "w-full max-w-sm h-auto min-h-[300px] sm:min-h-[350px]",
    "320x100": "w-full h-auto min-h-[100px] sm:min-h-[120px]",
};

const AdBanner = ({
    ad,
    size = "leaderboard",
    label = "Kwamamaza",
    loading = "lazy",
    sticky = false,
    onClose,
}) => {
    const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES["leaderboard"];
    const hasAdImage = Boolean(ad?.image);
    const targetUrl = String(ad?.target_url || "").trim();
    const content = hasAdImage ? (
        <img
            src={ad.image}
            alt={ad.title || `${label} - Rubavu Today`}
            loading={loading}
            decoding="async"
            className="h-full w-full object-cover"
        />
    ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 px-4 py-6 text-center">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {label}
            </span>
        </div>
    );

    const banner = targetUrl && targetUrl.toLowerCase() !== "null" ? (
        <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={ad.title || label}
            className="block h-full w-full"
        >
            {content}
        </a>
    ) : (
        content
    );

    return (
        <aside
            aria-label={label}
            className={`${sticky ? "fixed bottom-3 left-3 right-3 z-50 mx-auto sm:bottom-4" : "mx-auto w-full"} ${sizeClass} overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md`}
        >
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-white">
                {banner}
                {sticky && onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Funga advertisement"
                        className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-sm font-bold leading-none text-white transition hover:bg-red-600 hover:scale-110"
                    >
                        ×
                    </button>
                )}
            </div>
        </aside>
    );
};

export default AdBanner;
