import React from "react";

/**
 * TextEditor
 *
 * A reusable, styled textarea panel for the TextCleaner tool.
 * Shows character count and word count beneath the textarea.
 *
 * Props:
 *   title        – Panel heading
 *   value        – Current textarea value
 *   onChange     – Handler for textarea change
 *   placeholder  – Placeholder text
 *   readOnly     – Whether the textarea is read-only
 *   charCount    – Number to display for character count
 *   wordCount    – Number to display for word count
 *   charLabel    – Override label for char count (default: "Inyandiko")
 *   wordLabel    – Override label for word count (default: "Amagambo")
 *   accentColor  – Tailwind accent class for the header bar (default: brand)
 */
function TextEditor({
    title,
    value,
    onChange,
    placeholder = "Paste your text here...",
    readOnly = false,
    charCount = 0,
    wordCount = 0,
    charLabel = "Inyandiko",
    wordLabel = "Amagambo",
    accentColor = "from-brand-600 to-brand-500",
    textareaRef,
}) {
    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Header */}
            <div
                className={`flex shrink-0 items-center justify-between border-b border-slate-200 bg-gradient-to-r ${accentColor} px-4 py-3 sm:px-5`}
            >
                <h2 className="text-sm font-bold text-white sm:text-base">
                    {title}
                </h2>
                <div className="flex items-center gap-2 text-[11px] font-semibold text-white/80">
                    <span>{charCount.toLocaleString()} inyandiko</span>
                    <span className="text-white/40">|</span>
                    <span>{wordCount.toLocaleString()} amagambo</span>
                </div>
            </div>

            {/* Textarea */}
            <div className="relative min-h-0 flex-1">
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={onChange}
                    readOnly={readOnly}
                    placeholder={placeholder}
                    spellCheck={false}
                    className={`h-full w-full resize-none border-none bg-transparent p-4 font-mono text-sm leading-relaxed text-slate-800 outline-none placeholder:text-slate-300 sm:p-5 sm:text-[15px] ${
                        readOnly
                            ? "cursor-default"
                            : "focus:ring-0"
                    }`}
                />
            </div>

            {/* Footer counts */}
            <div className="flex shrink-0 items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-2 text-[11px] font-semibold text-slate-400 sm:px-5">
                <span>
                    {charLabel}: {charCount.toLocaleString()}
                </span>
                <span>
                    {wordLabel}: {wordCount.toLocaleString()}
                </span>
            </div>
        </div>
    );
}

export default TextEditor;
