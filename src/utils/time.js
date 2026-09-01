const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

// A post published inside this window is treated as "fresh" (relative time + NEW badge).
export const FRESH_WINDOW_MS = 48 * HOUR_MS;

export const isFreshPost = (date, windowMs = FRESH_WINDOW_MS) => {
    const time = new Date(date).getTime();
    if (Number.isNaN(time)) return false;
    const age = Date.now() - time;
    return age >= 0 && age <= windowMs;
};

const toLocaleDate = (dateValue, language) => {
    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) return "";

    const locale =
        language === "fr"
            ? "fr-FR"
            : language === "sw"
                ? "sw-KE"
                : language === "en"
                    ? "en-US"
                    : "rw-RW";

    return parsed.toLocaleDateString(locale, {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

export const formatRelativeTime = (dateValue, language, t) => {
    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) return "";

    const ageMs = Date.now() - parsed.getTime();

    if (ageMs < 0 || ageMs < MINUTE_MS) {
        return t("justNow");
    }

    if (ageMs < HOUR_MS) {
        const minutes = Math.max(1, Math.floor(ageMs / MINUTE_MS));
        return t("minutesAgo").replace("{count}", String(minutes));
    }

    if (ageMs < DAY_MS) {
        const hours = Math.max(1, Math.floor(ageMs / HOUR_MS));
        return t("hoursAgo").replace("{count}", String(hours));
    }

    if (ageMs < 2 * DAY_MS) {
        return t("yesterday");
    }

    if (ageMs < FRESH_WINDOW_MS) {
        const days = Math.floor(ageMs / DAY_MS);
        return t("daysAgo").replace("{count}", String(days));
    }

    return toLocaleDate(dateValue, language);
};

const timeUtils = {
    FRESH_WINDOW_MS,
    isFreshPost,
    formatRelativeTime,
};

export default timeUtils; // eslint-disable-line import/no-anonymous-default-export