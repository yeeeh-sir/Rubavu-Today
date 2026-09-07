import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

const PROFILE_POPUP_EVENT = "rubavu-author-popup-open";

const normalizeAuthor = (author) => {
    if (!author) {
        return {
            id: null,
            name: "Rubavu Today",
            role: "unknown",
            profile_image: null,
        };
    }

    if (typeof author === "string") {
        return {
            id: null,
            name: author,
            role: "unknown",
            profile_image: null,
        };
    }

    return {
        id: author.id || null,
        name: author.name || author.full_name || author.email || "Rubavu Today",
        role: author.role || author.role_type || "unknown",
        email: author.email || null,
        bio: author.bio || null,
        profile_image: author.profile_image || null,
        profile_path: author.profile_path || null,
    };
};

const roleLabel = (role) => {
    const value = String(role || "").replace(/_/g, " ");

    if (!value || value === "unknown") return "Author";

    return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const getAuthorKey = (author) => {
    const normalized = normalizeAuthor(author);
    return `${normalized.id || "name"}:${normalized.name}`;
};

export default function AuthorProfilePopup({ author, open, onClose }) {
    const popupRef = useRef(null);
    const normalizedAuthor = normalizeAuthor(author);
    const authorKey = getAuthorKey(normalizedAuthor);
    const initial = normalizedAuthor.name.trim().charAt(0).toUpperCase() || "A";

    useEffect(() => {
        if (!open) return undefined;

        const handlePointerDown = (event) => {
            if (!popupRef.current?.contains(event.target)) {
                onClose();
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === "Escape") onClose();
        };

        const handleOtherPopup = (event) => {
            if (event.detail !== authorKey) onClose();
        };

        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("touchstart", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener(PROFILE_POPUP_EVENT, handleOtherPopup);

        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("touchstart", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener(PROFILE_POPUP_EVENT, handleOtherPopup);
        };
    }, [authorKey, onClose, open]);

    if (!open) return null;

    return (
        <div
            ref={popupRef}
            role="dialog"
            aria-label={`${normalizedAuthor.name} profile`}
            className="absolute left-0 top-full z-50 mt-2 w-[min(19rem,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-xl ring-1 ring-black/5"
            onClick={(event) => event.stopPropagation()}
        >
            <button
                type="button"
                onClick={onClose}
                aria-label="Close profile"
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
                <X size={16} />
            </button>

            <div className="flex flex-col items-center pr-4 text-center">
                {normalizedAuthor.profile_image ? (
                    <img
                        src={normalizedAuthor.profile_image}
                        alt={normalizedAuthor.name}
                        className="h-16 w-16 rounded-full border-4 border-white object-cover shadow-md"
                        onError={(event) => {
                            event.currentTarget.style.display = "none";
                        }}
                    />
                ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-2xl font-black text-white shadow-md">
                        {initial}
                    </div>
                )}

                <p className="mt-3 max-w-full break-words text-sm font-bold text-slate-900">
                    {normalizedAuthor.name}
                </p>
                <p className="mt-1 text-xs font-semibold capitalize text-red-600">
                    {roleLabel(normalizedAuthor.role)}
                </p>

                {normalizedAuthor.email && (
                    <p className="mt-2 max-w-full break-all text-xs text-slate-500">
                        {normalizedAuthor.email}
                    </p>
                )}

                {normalizedAuthor.bio && (
                    <p className="mt-2 text-xs leading-relaxed text-slate-600">
                        {normalizedAuthor.bio}
                    </p>
                )}

                {normalizedAuthor.profile_path && (
                    <a
                        href={normalizedAuthor.profile_path}
                        className="mt-3 inline-flex items-center rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-700"
                    >
                        View Profile
                    </a>
                )}
            </div>
        </div>
    );
}

export { PROFILE_POPUP_EVENT, getAuthorKey, normalizeAuthor };
