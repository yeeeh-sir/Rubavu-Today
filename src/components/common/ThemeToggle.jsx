import React from "react";
import { useTheme } from "../../context/ThemeContext";

export default function ThemeToggle({ compact = false }) {
    const { isDark, toggleTheme } = useTheme();

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-pressed={isDark}
            aria-label={isDark ? "Use light mode" : "Use dark mode"}
            className={`flex items-center gap-2 rounded-xl border text-xs font-bold transition ${compact ? "justify-center px-2.5 py-2" : "w-full px-3 py-2.5"} ${isDark
                    ? "border-blue-400/30 bg-blue-500/10 text-blue-200 hover:bg-blue-500/20"
                    : "border-slate-700 bg-slate-900/60 text-slate-300 hover:bg-slate-800"
                }`}
        >
            <span aria-hidden="true" className="text-base leading-none">{isDark ? "☀️" : "🌙"}</span>
            {!compact && <span>{isDark ? "Light Mode" : "Dark Mode"}</span>}
        </button>
    );
}
