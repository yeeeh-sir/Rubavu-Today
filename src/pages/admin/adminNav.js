/**
 * Shared admin navigation sections for the Rubavu Today admin area.
 * Used across all dedicated admin pages so the sidebar behaves identically.
 */
export const ADMIN_NAV_SECTIONS = [
    {
        label: "MAIN",
        items: [
            { icon: <span>▦</span>, label: "Imbonerahamwe", path: "/admin/dashboard" },
        ],
    },
    {
        label: "INKURU",
        items: [
            { icon: <span>⏳</span>, label: "Zitegereje gusuzumwa", path: "/admin/posts/pending" },
            { icon: <span>✓</span>, label: "Inkuru zasohotse", path: "/admin/posts/published" },
            { icon: <span>✕</span>, label: "Zanzwe", path: "/admin/posts/rejected" },
        ],
    },
    {
        label: "IMICUNGIRE",
        items: [
            { icon: <span>👤</span>, label: "Abakozi", path: "/admin/employees" },
            { icon: <span>🛡️</span>, label: "Abanditsi Bakuru", path: "/admin/chief-editors" },
            { icon: <span>👥</span>, label: "Konti n'Inkuru", path: "/admin/accounts" },
            { icon: <span>📊</span>, label: "Imikorere y'Abakozi", path: "/admin/performance" },
        ],
    },
    {
        label: "IBINDI",
        items: [
            { icon: <span>📢</span>, label: "Kwamamaza", path: "/admin/advertisements" },
            { icon: <span>📥</span>, label: "Kuramo raporo", path: "/admin/reports" },
            { icon: <span>🧹</span>, label: "Text Cleaner", path: "/admin/text-cleaner" },
            { icon: <span>🔑</span>, label: "Hindura ijambobanga", path: "/admin/change-password" },
            { icon: <span>✉️</span>, label: "Hindura imeyili", path: "/admin/change-email" },
        ],
    },
];
