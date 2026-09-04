import React from "react";

/**
 * CleanerToolbar
 *
 * Contains the primary actions: Remove, Auto-Clean toggle, Copy, Download, Reset.
 *
 * Props:
 *   onClean          – Handler to run the cleaning process
 *   onCopy           – Handler to copy cleaned text
 *   onDownload       – Handler to download cleaned text
 *   onReset          – Handler to reset both panels
 *   autoClean        – Current auto-clean state
 *   onToggleAutoClean – Toggle auto-clean
 *   loading          – Whether cleaning is in progress
 *   hasInput         – Whether there is any input text
 *   hasOutput        – Whether there is cleaned text to copy/download
 *   removedCount     – Number of characters removed (for success message)
 *   showSuccess      – Whether to show the success banner
 */
function CleanerToolbar({
    onClean,
    onCopy,
    onDownload,
    onReset,
    autoClean,
    onToggleAutoClean,
    loading = false,
    hasInput = false,
    hasOutput = false,
    removedCount = 0,
    showSuccess = false,
}) {
    return (
        <div className="flex flex-col gap-3">
            {/* Primary action */}
            <button
                onClick={onClean}
                disabled={!hasInput || loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-brand-200 transition hover:bg-brand-700 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none sm:text-base"
            >
                {loading ? (
                    <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Birimo gutwara...
                    </>
                ) : (
                    <>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-5 w-5"
                        >
                            <path d="M12 3v1m0 16v1m-8-9H3m18 0h-1M5.6 5.6l.7.7m12.4 12.4l-.7-.7M5.6 18.4l.7-.7M18.7 5.6l-.7.7" />
                            <circle cx="12" cy="12" r="4" />
                        </svg>
                       Remove Hidden Characters
                    </>
                )}
            </button>

            {/* Success banner */}
            {showSuccess && removedCount > 0 && (
                <div className="animate-fade-in rounded-xl bg-emerald-50 px-4 py-2.5 text-center text-sm font-semibold text-emerald-700">
                    ✓ {removedCount.toLocaleString()} hidden character
                    {removedCount !== 1 ? "s" : ""} removed successfully.
                </div>
            )}

            {/* Secondary actions row */}
            <div className="flex flex-wrap items-center gap-2">
                {/* Auto-clean toggle */}
                <button
                    onClick={onToggleAutoClean}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                        autoClean
                            ? "bg-brand-100 text-brand-700 ring-1 ring-brand-200"
                            : "border border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}
                    title="Kuza bikwiye ubusobanuro mu gihe uandika"
                >
                    <span
                        className={`inline-block h-3.5 w-3.5 rounded-full transition ${
                            autoClean ? "bg-brand-600" : "bg-slate-300"
                        }`}
                    />
                    Auto Clean
                </button>

                <div className="h-5 w-px bg-slate-200" />

                {/* Copy */}
                <button
                    onClick={onCopy}
                    disabled={!hasOutput}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    title="Koporora"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-3.5 w-3.5"
                    >
                        <rect x="9" y="9" width="13" height="13" rx="2" />
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                    </svg>
                    Koporora
                </button>

                {/* Download */}
                <button
                    onClick={onDownload}
                    disabled={!hasOutput}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    title="Kurura .txt"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-3.5 w-3.5"
                    >
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Kurura .txt
                </button>

                {/* Reset */}
                <button
                    onClick={onReset}
                    disabled={!hasInput && !hasOutput}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                    title="Siba byose"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-3.5 w-3.5"
                    >
                        <polyline points="1 4 1 10 7 10" />
                        <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
                    </svg>
                    Siba byose
                </button>
            </div>
        </div>
    );
}

export default CleanerToolbar;
