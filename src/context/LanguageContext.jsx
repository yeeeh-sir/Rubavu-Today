import React, { createContext, useContext } from "react";
import rw from "../i18n/rw.json";
import en from "../i18n/en.json";

/* Single-language site. The multilingual translation system was removed:
   posts are shown in their original Kinyarwanda and the whole UI is in
   Kinyarwanda (rw.json), with English (en.json) only as a fallback for any
   untranslated key. The provider keeps the same public surface (useLanguage,
   t, setLanguage, flags) so every existing component keeps working without
   redesign; setLanguage is a no-op. */

const LanguageContext = createContext();

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within LanguageProvider");
    }
    return context;
};

const getNestedValue = (obj, key) => {
    if (!obj) return undefined;
    if (Object.prototype.hasOwnProperty.call(obj, key)) return obj[key];
    return key
        .split(".")
        .reduce(
            (acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined),
            obj
        );
};

/* Category labels are stored on posts in Kinyarwanda and are shown as-is. */
export const translateCategory = (category) => category;

export const LanguageProvider = ({ children }) => {
    const setLanguage = () => {};

    const t = (key) => {
        return getNestedValue(rw, key) || getNestedValue(en, key) || key;
    };

    const value = {
        language: "rw",
        setLanguage,
        translating: false,
        setTranslating: () => {},
        translationUnavailable: false,
        setTranslationUnavailable: () => {},
        translationUnavailableCode: null,
        t,
        LANGUAGES: {
            rw: { name: "Ikinyarwanda", flag: "🇷🇼" },
        },
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export default LanguageContext;