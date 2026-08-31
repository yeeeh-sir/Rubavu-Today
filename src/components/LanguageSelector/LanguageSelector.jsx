import React, { useState } from "react";
import { useLanguage } from "../../context/LanguageContext";

const LanguageSelector = ({ compact = false }) => {
    const { language, setLanguage, translating, LANGUAGES } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const selected = LANGUAGES[language] || LANGUAGES.rw;
    const selectedLabel = language === "rw"
        ? "RW Kinyarwanda"
        : `${language.toUpperCase()} ${selected.name}`;

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`
          flex items-center gap-2 rounded-lg border border-slate-300
          bg-white px-3 py-2 font-medium text-gray-700 shadow-sm
          transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500
          ${compact ? "text-[10px] sm:text-xs" : "text-[10px] sm:text-sm"}
        `}
                aria-label="Change language"
            >
                <span className="hidden sm:inline">{selectedLabel}</span>
                <span className="sm:hidden">{language.toUpperCase()}</span>
                {translating && language !== "rw" && (
                    <svg
                        className="h-4 w-4 animate-spin text-blue-500"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-label="Translating"
                    >
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                )}
                <svg
                    className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border border-slate-200 bg-white shadow-lg">
                    {Object.entries(LANGUAGES).map(([code, { name, flag }]) => (
                        <button
                            key={code}
                            type="button"
                            onClick={() => {
                                if (code === language) {
                                    setIsOpen(false);
                                    return;
                                }
                                setLanguage(code);
                                setIsOpen(false);
                            }}
                            className={`
                flex w-full items-center gap-2 px-4 py-2 text-left text-sm transition
                ${language === code
                                    ? "bg-blue-50 font-semibold text-blue-600"
                                    : "text-gray-700 hover:bg-gray-50"
                                }
                ${code === "en" ? "rounded-t-lg" : ""}
                ${code === "rw" ? "rounded-b-lg" : ""}
              `}
                        >
                            <span>{flag}</span>
                            <span>{name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LanguageSelector;
