import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { addPost, logout } from "../../services/api";
import { DashboardLayout } from "../../components/dashboard";
import ArticleEditor from "../../components/article/ArticleEditor";

const DEPARTMENTS = [
    { name: "Amakuru", icon: "📰", color: "bg-blue-100 text-blue-700" },
    { name: "Ubukungu", icon: "💼", color: "bg-emerald-100 text-emerald-700" },
    { name: "Imikino", icon: "⚽", color: "bg-amber-100 text-amber-700" },
    { name: "Imyidagaduro", icon: "🎭", color: "bg-purple-100 text-purple-700" },
    { name: "Uburezi", icon: "🎓", color: "bg-rose-100 text-rose-700" },
];

const DEPARTMENTS_NAV = [
    {
        label: "Dashboard",
        items: [
            { icon: <span>▦</span>, label: "Imbonerahamwe", path: "/admin/dashboard" },
        ],
    },
];

function CreatePost() {
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [editorKey, setEditorKey] = useState(0);

    const handleCreate = useCallback(async (formData) => {
        if (saving) return;
        setSaving(true);
        try {
            await addPost(formData);
            setEditorKey((k) => k + 1);
            navigate("/admin/dashboard", { replace: true });
        } catch (err) {
            console.error("[CreatePost] Failed:", err);
            alert(err.message || "Hari ikosa ryabaye mu gutanga inkuru.");
        } finally {
            setSaving(false);
        }
    }, [saving, navigate]);

    const handleCancel = useCallback(() => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate("/admin/dashboard", { replace: true });
        }
    }, [navigate]);

    const handleBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate("/admin/dashboard", { replace: true });
        }
    };

    return (
        <DashboardLayout
            navigationSections={DEPARTMENTS_NAV}
            roleLabel="Imicungire y'ubwanditsi"
            onLogout={() => { logout(); navigate("/admin/login", { replace: true }); }}
        >
            <div className="mx-auto max-w-4xl px-3 py-6 sm:px-6 lg:px-8">
                {/* Back button */}
                <button
                    onClick={handleBack}
                    className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-slate-800"
                >
                    <span>←</span> Subira inyuma
                </button>

                {/* Page header */}
                <div className="mb-6 flex items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
                        ✏️
                    </span>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 sm:text-2xl">
                            Kora Inkuru Nshya
                        </h1>
                        <p className="mt-0.5 text-sm text-slate-400">
                            Onjera inkuru nshya mu miryango.
                        </p>
                    </div>
                </div>

                {/* Article editor card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                    <ArticleEditor
                        key={editorKey}
                        initial={null}
                        categories={DEPARTMENTS}
                        submitLabel="Tanga inkuru"
                        saving={saving}
                        onSubmit={handleCreate}
                        onCancel={handleCancel}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}

export default CreatePost;
