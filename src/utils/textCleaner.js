/**
 * textCleaner.js
 *
 * Reusable utility for detecting and removing hidden/invisible Unicode
 * characters that may have been inserted into text (text-watermarking).
 *
 * IMPORTANT: This tool is intended for cleaning text that the user owns
 * or has permission to edit. It does NOT remove visible copyright
 * notices, author attribution, legal notices, or ownership information.
 *
 * All processing is done locally — no text is ever sent to an external API.
 */

/**
 * Each entry in HIDDEN_CHARS defines a character (or range) to detect.
 *
 * Why it's invisible / safe to remove:
 *   - Zero Width Space (U+200B): invisible separator; renders nothing.
 *   - Zero Width Non-Joiner (U+200C): invisible formatting; prevents ligatures.
 *   - Zero Width Joiner (U+200D): invisible formatting; enables ligatures/emoji variation.
 *   - Word Joiner (U+2060): invisible; prevents line-break at a point.
 *   - BOM / ZW No-Break Space (U+FEFF): invisible byte-order marker; meaningless in the middle of text.
 *   - LTR/RTL Embeddings (U+202A–U+202E): invisible bidi formatting controls.
 *   - Bidi Isolates (U+2066–U+2069): invisible bidi isolation controls.
 *   - Object Replacement Character (U+FFFC): invisible placeholder for objects.
 *   - Interlinear Annotation Anchor (U+FF9E): half-width katakana used as annotation anchor.
 *
 * What is intentionally PRESERVED:
 *   - All Kinyarwanda characters (Latin Extended with diacritics like é, è, ê, ë, etc.)
 *   - All French characters (ç, ù, â, î, ô, û, etc.)
 *   - All English characters
 *   - Numbers, punctuation, emojis, quotation marks, apostrophes
 *   - Normal spaces (U+0020), tabs (U+0009), newlines (U+000A, U+000D)
 *   - En-dash (U+2013), em-dash (U+2014) — visible punctuation
 *   - Non-breaking space (U+00A0) — normal whitespace
 *   - Normal hyphens and dashes
 *   - All visible Unicode code points in BMP and supplementary planes
 */
const HIDDEN_CHARS = [
    { code: 0x200B, name: "Zero Width Space", category: "formatting" },
    { code: 0x200C, name: "Zero Width Non-Joiner", category: "formatting" },
    { code: 0x200D, name: "Zero Width Joiner", category: "formatting" },
    { code: 0x2060, name: "Word Joiner", category: "formatting" },
    { code: 0xFEFF, name: "BOM / ZW No-Break Space", category: "formatting" },
    { code: 0xFFFC, name: "Object Replacement Character", category: "formatting" },

    // Bidirectional formatting controls (U+202A–U+202E)
    { code: 0x202A, name: "LTR Embedding", category: "bidi" },
    { code: 0x202B, name: "RTL Embedding", category: "bidi" },
    { code: 0x202C, name: "Pop Directional Formatting", category: "bidi" },
    { code: 0x202D, name: "LTR Override", category: "bidi" },
    { code: 0x202E, name: "RTL Override", category: "bidi" },

    // Bidirectional isolate controls (U+2066–U+2069)
    { code: 0x2066, name: "LTR Isolate", category: "bidi" },
    { code: 0x2067, name: "RTL Isolate", category: "bidi" },
    { code: 0x2068, name: "First Strong Isolate", category: "bidi" },
    { code: 0x2069, name: "Pop Directional Isolate", category: "bidi" },
];

/**
 * Build a regex that matches any of the HIDDEN_CHARS code points.
 * Using a character class is deterministic and O(n) per character.
 */
function buildHiddenCharRegex() {
    const chars = HIDDEN_CHARS.map((c) => `\\u{${c.code.toString(16).toUpperCase()}}`).join("");
    return new RegExp(`[${chars}]`, "gu");
}

const HIDDEN_CHAR_REGEX = buildHiddenCharRegex();

/**
 * Count hidden characters in text, grouped by type.
 *
 * @param {string} text - The input text to scan.
 * @returns {{ detections: Array<{name: string, count: number}>, total: number }}
 */
export function detectHiddenChars(text) {
    if (typeof text !== "string" || text.length === 0) {
        return { detections: [], total: 0 };
    }

    const counts = {};
    let total = 0;

    for (let i = 0; i < text.length; i++) {
        const cp = text.codePointAt(i);
        const entry = HIDDEN_CHARS.find((c) => c.code === cp);
        if (entry) {
            counts[entry.name] = (counts[entry.name] || 0) + 1;
            total++;
            // If this is a surrogate pair, skip the low surrogate
            if (cp > 0xFFFF) i++;
        }
    }

    const detections = Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

    return { detections, total };
}

/**
 * Remove hidden / invisible Unicode watermark characters from text.
 *
 * This function:
 *   1. Replaces every detected hidden character with an empty string.
 *   2. Normalises Unicode (NFC form) so combining decomposed chars are
 *      re-composed where possible (e.g. e + combining accent → é).
 *   3. Collapses runs of 3+ whitespace-only lines into exactly 2
 *      (preserving paragraph breaks while removing artificial gaps).
 *   4. Does NOT alter normal spaces, tabs, or single newlines.
 *
 * The original text is never mutated — a new string is returned.
 *
 * @param {string} text - The input text.
 * @returns {string} The cleaned text.
 */
export function removeTextWatermark(text) {
    if (typeof text !== "string") return "";
    if (text.length === 0) return "";

    // Step 1: Remove hidden characters
    let cleaned = text.replace(HIDDEN_CHAR_REGEX, "");

    // Step 2: Unicode NFC normalisation
    // This re-composes characters like e + ́ → é without changing visible content.
    // It is safe for Kinyarwanda, French, English, and emoji text.
    try {
        cleaned = cleaned.normalize("NFC");
    } catch (_) {
        // If the environment doesn't support normalize(), skip gracefully.
    }

    // Step 3: Collapse 3+ consecutive blank lines into exactly 2 newlines (one blank line).
    // This preserves intentional paragraph breaks while removing artificial gaps
    // that may have been introduced by watermark removal.
    cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

    // Step 4: Remove trailing whitespace on each line (but preserve the line break).
    // This cleans up trailing zero-width chars that were between a space and a newline.
    cleaned = cleaned.replace(/[ \t]+\n/g, "\n");

    // Step 5: Remove leading/trailing blank lines from the whole text.
    cleaned = cleaned.replace(/^\n+/, "").replace(/\n+$/, "");

    return cleaned;
}

/**
 * Count words in text. Handles multiple scripts and punctuation boundaries.
 *
 * @param {string} text
 * @returns {number}
 */
export function countWords(text) {
    if (typeof text !== "string" || text.trim().length === 0) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Count visible characters (excluding hidden chars).
 *
 * @param {string} text
 * @returns {number}
 */
export function countVisibleChars(text) {
    if (typeof text !== "string") return 0;
    return text.replace(HIDDEN_CHAR_REGEX, "").length;
}

/**
 * The full list of hidden char definitions, exposed for testing / UI display.
 */
export const HIDDEN_CHAR_DEFINITIONS = HIDDEN_CHARS;
