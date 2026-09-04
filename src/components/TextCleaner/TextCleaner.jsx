import React, { useState, useCallback, useRef, useEffect } from "react";
import TextEditor from "./TextEditor";
import DetectionStats from "./DetectionStats";
import CleanerToolbar from "./CleanerToolbar";
import {
    removeTextWatermark,
    detectHiddenChars,
    countWords,
    countVisibleChars,
} from "../../utils/textCleaner";

/**
 * TextCleaner
 *
 * Professional two-panel text cleaning tool.
 * Left panel: original input. Right panel: cleaned output.
 * Center toolbar: clean, auto-clean toggle, copy, download, reset.
 * Below: detection statistics.
 *
 * All processing is local — no external API calls.
 */
function TextCleaner() {
    const [originalText, setOriginalText] = useState("");
    const [cleanedText, setCleanedText] = useState("");
    const [autoClean, setAutoClean] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [removedCount, setRemovedCount] = useState(0);
    const [detection, setDetection] = useState({ detections: [], total: 0 });

    const inputRef = useRef(null);
    const toastTimerRef = useRef(null);

    // Derived stats
    const originalCharCount = originalText.length;
    const originalWordCount = countWords(originalText);
    const cleanedCharCount = countVisibleChars(cleanedText);
    const cleanedWordCount = countWords(cleanedText);

    // Auto-clean effect: runs whenever originalText changes and autoClean is on
    useEffect(() => {
        if (!autoClean || originalText.length === 0) {
            if (originalText.length === 0) {
                setCleanedText("");
                setRemovedCount(0);
                setDetection({ detections: [], total: 0 });
                setShowSuccess(false);
            }
            return;
        }

        // Debounce auto-clean to avoid running on every keystroke
        const timer = setTimeout(() => {
            performClean(originalText);
        }, 300);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [originalText, autoClean]);

    const performClean = useCallback((text) => {
        setLoading(true);
        setShowSuccess(false);

        // Use requestAnimationFrame to allow the UI to update before heavy work
        requestAnimationFrame(() => {
            try {
                const det = detectHiddenChars(text);
                const cleaned = removeTextWatermark(text);

                setCleanedText(cleaned);
                setRemovedCount(det.total);
                setDetection(det);
                setShowSuccess(true);

                if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
                toastTimerRef.current = setTimeout(() => setShowSuccess(false), 4000);
            } catch (err) {
                console.error("[TextCleaner] Clean error:", err);
                setCleanedText(text);
                setRemovedCount(0);
                setDetection({ detections: [], total: 0 });
            } finally {
                setLoading(false);
            }
        });
    }, []);

    const handleClean = useCallback(() => {
        performClean(originalText);
    }, [originalText, performClean]);

    const handleCopy = useCallback(() => {
        if (!cleanedText) return;
        navigator.clipboard.writeText(cleanedText).then(
            () => {
                setShowSuccess(true);
                if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
                toastTimerRef.current = setTimeout(() => setShowSuccess(false), 3000);
            },
            () => {
                // Fallback: select all in textarea
                if (inputRef.current) inputRef.current.select();
            }
        );
    }, [cleanedText]);

    const handleDownload = useCallback(() => {
        if (!cleanedText) return;
        const blob = new Blob([cleanedText], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `cleaned-text-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [cleanedText]);

    const handleReset = useCallback(() => {
        setOriginalText("");
        setCleanedText("");
        setRemovedCount(0);
        setDetection({ detections: [], total: 0 });
        setShowSuccess(false);
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    }, []);

    const handleInputChange = useCallback((e) => {
        setOriginalText(e.target.value);
    }, []);

    const handleToggleAutoClean = useCallback(() => {
        setAutoClean((prev) => !prev);
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handler = (e) => {
            // Ctrl/Cmd + Enter to clean
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                e.preventDefault();
                if (originalText.length > 0) handleClean();
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [originalText, handleClean]);

    return (
        <div className="flex flex-col gap-5">
            {/* Two-column editor panels */}
            <div className="grid min-h-0 gap-4 lg:grid-cols-2 lg:gap-5">
                <TextEditor
                    title="Original Text"
                    value={originalText}
                    onChange={handleInputChange}
                    placeholder="Paste your text here..."
                    readOnly={false}
                    charCount={originalCharCount}
                    wordCount={originalWordCount}
                    charLabel="Inyandiko (mbere)"
                    wordLabel="Amagambo (mbere)"
                    accentColor="from-slate-700 to-slate-600"
                    textareaRef={inputRef}
                />

                <TextEditor
                    title="Clean Text"
                    value={cleanedText}
                    onChange={() => {}}
                    placeholder="Cleaned text will appear here..."
                    readOnly={true}
                    charCount={cleanedCharCount}
                    wordCount={cleanedWordCount}
                    charLabel="Inyandiko (nyuma)"
                    wordLabel="Amagambo (nyuma)"
                    accentColor="from-emerald-600 to-emerald-500"
                />
            </div>

            {/* Toolbar */}
            <CleanerToolbar
                onClean={handleClean}
                onCopy={handleCopy}
                onDownload={handleDownload}
                onReset={handleReset}
                autoClean={autoClean}
                onToggleAutoClean={handleToggleAutoClean}
                loading={loading}
                hasInput={originalText.length > 0}
                hasOutput={cleanedText.length > 0}
                removedCount={removedCount}
                showSuccess={showSuccess}
            />

            {/* Detection stats */}
            <DetectionStats
                detections={detection.detections}
                total={detection.total}
                removed={removedCount}
            />

            {/* Keyboard shortcut hint */}
            <p className="text-center text-[11px] text-slate-300">
                Keyboard: <kbd className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">Ctrl</kbd>
                {" + "}
                <kbd className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">Enter</kbd>
                {" = Remove Hidden Characters"}
            </p>
        </div>
    );
}

export default TextCleaner;
