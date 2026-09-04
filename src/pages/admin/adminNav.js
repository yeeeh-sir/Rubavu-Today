/**
 * Shared admin navigation sections for the Rubavu Today admin area.
 * Used across all dedicated admin pages so the sidebar behaves identically.
 */
export const ADMIN_NAV_SECTIONS = [
    {
        label: "Dashboard",
        items: [
            { icon: <span>▦</span>, label: "Imbonerahamwe", path: "/admin/overview" },
            { icon: <span>⏳</span>, label: "Zitegereje gusuzumwa", path: "/admin/posts/pending" },
            { icon: <span>✓</span>, label: "Inkuru zasohotse", path: "/admin/posts/published" },
            { icon: <span>✕</span>, label: "Zanzwe", path: "/admin/posts/rejected" },
        ],
    },
    {
        label: "Imicungire",
        items: [
            { icon: <span>👤</span>, label: "Abakozi", path: "/admin/employees" },
            { icon: <span>🛡️</span>, label: "Abanditsi Bakuru", path: "/admin/chief-editors" },
            { icon: <span>📢</span>, label: "Kwamamaza", path: "/admin/advertisements" },
            { icon: <span>📥</span>, label: "Kuramo raporo", path: "/admin/reports" },
            { icon: <span>🧹</span>, label: "Text Cleaner", path: "/admin/text-cleaner" },
        ],
    },
];
