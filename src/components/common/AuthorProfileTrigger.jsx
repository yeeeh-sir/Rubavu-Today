import React, { useState } from "react";
import AuthorProfilePopup, {
    PROFILE_POPUP_EVENT,
    getAuthorKey,
} from "./AuthorProfilePopup";

export default function AuthorProfileTrigger({ author, children, className = "" }) {
    const [open, setOpen] = useState(false);

    const toggle = () => {
        const nextOpen = !open;

        if (nextOpen) {
            document.dispatchEvent(
                new CustomEvent(PROFILE_POPUP_EVENT, {
                    detail: getAuthorKey(author),
                })
            );
        }

        setOpen(nextOpen);
    };

    return (
        <span className={`relative inline-flex min-w-0 ${className}`}>
            <button
                type="button"
                onClick={toggle}
                aria-expanded={open}
                className="min-w-0 text-left transition hover:text-red-600"
            >
                {children}
            </button>
            <AuthorProfilePopup
                author={author}
                open={open}
                onClose={() => setOpen(false)}
            />
        </span>
    );
}
