import React from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../services/api";
import { DashboardLayout } from "../../components/dashboard";
import { TextCleaner } from "../../components/TextCleaner";

/**
 * TextCleanerPage
 *
 * Admin-only page that wraps the TextCleaner component inside
 * the standard DashboardLayout with admin navigation and logout.
 */
function TextCleanerPage() {
    const navigate = useNavigate();

    const navSections = [
        {
            label: "Dashboard",
            items: [
                {
                    icon: <span>▦</span>,
                    label: "Imbonerahamwe",
                    path: "/admin/dashboard",
                },
            ],
        },
        {
            label: "Ibikoresho",
            items: [
                {
                    icon: <span>🧹</span>,
                    label: "Text Cleaner",
                    path: "/admin/text-cleaner",
                },
            ],
        },
    ];

    return (
        <DashboardLayout
            navigationSections={navSections}
            roleLabel="Imicungire y'ubwanditsi"
            onLogout={() => {
                logout();
                navigate("/admin/login", { replace: true });
            }}
        >
            <div className="mx-auto max-w-7xl px-3 py-6 sm:px-6 lg:px-8">
                {/* Page header */}
                <div className="mb-6">
                    <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-6 w-6"
                            >
                                <path d="M12 3v1m0 16v1m-8-9H3m18 0h-1M5.6 5.6l.7.7m12.4 12.4l-.7-.7M5.6 18.4l.7-.7M18.7 5.6l-.7.7" />
                                <circle cx="12" cy="12" r="4" />
                            </svg>
                        </span>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 sm:text-2xl">
                                Text Cleaner
                            </h1>
                            <p className="mt-0.5 text-sm text-slate-400">
                                Remove hidden invisible characters from your text.
                                All processing is done locally in your browser.
                            </p>
                        </div>
                    </div>
                </div>

                <TextCleaner />
            </div>
        </DashboardLayout>
    );
}

export default TextCleanerPage;
