import React from "react";

const SIZE_CLASSES = {
    "728x90": "min-h-[72px] max-w-[728px] sm:min-h-[90px]",
    "300x250": "min-h-[180px] max-w-[300px] sm:min-h-[250px]",
    "320x100": "min-h-[80px] max-w-[320px] sm:min-h-[100px]",
};

const AdBanner = ({
    ad,
    size = "728x90",
    label = "Kwamamaza",
    loading = "lazy",
    sticky = false,
    onClose,
}) => {
    const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES["728x90"];
    const hasAdImage = Boolean(ad?.image);
    const targetUrl = String(ad?.target_url || "").trim();
    const content = hasAdImage ? (
        <img
            src={ad.image}
            alt={ad.title || `${label} - Rubavu Today`}
            loading={loading}
            decoding="async"
            className="h-full max-h-full w-full object-contain"
        />
    ) : (
        <div className="flex h-full min-h-[inherit] w-full flex-col items-center justify-center gap-1 bg-slate-50 px-3 text-center">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            <span className="text-[9px] font-bold uppercase tracking-[0.24em] text-slate-500">
                Rubavu Today
            </span>
            <span className="text-[10px] font-semibold text-slate-600">Rubavu Today</span>
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
            className={`${sticky ? "fixed bottom-3 left-3 right-3 z-50 mx-auto sm:bottom-4" : "mx-auto w-full"} ${sizeClass} overflow-hidden rounded-xl border ${hasAdImage ? "border-slate-200" : "border-dashed border-slate-300"} bg-white p-1 shadow-sm`}
        >
            <div className="relative flex h-full min-h-[inherit] w-full items-center justify-center">
                {banner}
                {sticky && onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Funga advertisement"
                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900/75 text-sm leading-none text-white transition hover:bg-red-600"
                    >
                        ×
                    </button>
                )}
            </div>
        </aside>
    );
};

export default AdBanner;
