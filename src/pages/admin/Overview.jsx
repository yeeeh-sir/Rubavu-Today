import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminPosts, logout } from "../../services/api";
import { DashboardLayout, StatCard } from "../../components/dashboard";
import { ADMIN_NAV_SECTIONS } from "./adminNav";

const normalizeStatus = (post) =>
    String(post?.status || post?.approval_status || post?.publication_status || "pending").toLowerCase();

function Overview() {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;
        const load = async () => {
            try {
                const data = await getAdminPosts();
                if (active) setPosts(Array.isArray(data) ? data : []);
            } catch (err) {
                if (active) setError(err?.message || "Unable to load statistics.");
            } finally {
                if (active) setLoading(false);
            }
        };
        load();
        return () => { active = false; };
    }, []);

    const pending = posts.filter((p) => normalizeStatus(p) === "pending").length;
    const approved = posts.filter((p) => normalizeStatus(p) === "approved").length;
    const rejected = posts.filter((p) => normalizeStatus(p) === "rejected").length;
    const comments = posts.reduce((t, p) => t + (p.comments?.length || 0), 0);
    const total = posts.length;

    const navigateTo = (path, condition) => (e) => {
        e.preventDefault();
        if (condition > 0) navigate(path);
    };

    return (
        <DashboardLayout
            navigationSections={ADMIN_NAV_SECTIONS}
            roleLabel="Imicungire y'ubwanditsi"
            onLogout={() => { logout(); navigate("/admin/login", { replace: true }); }}
        >
            <div className="mx-auto max-w-7xl px-3 py-6 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <h1 className="text-xl font-black text-slate-900 sm:text-2xl">
                        Imbonerahamwe
                    </h1>
                    <p className="mt-0.5 text-sm text-slate-400">
                        Igice cy'inkuru n'ibikorwa byawe byose.
                    </p>
                </div>

                {loading ? (
                    <p className="py-10 text-center text-sm text-slate-400">Birimo gutwara...</p>
                ) : error ? (
                    <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
                ) : (
                    <>
                        {/* Stat cards */}
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <StatCard label="Inkuru zose" value={total} icon="📰" color="blue" />
                            <StatCard label="Zitegereje" value={pending} icon="⏳" color="amber" />
                            <StatCard label="Zasohotse" value={approved} icon="✓" color="emerald" />
                            <StatCard label="Zanzwe" value={rejected} icon="✕" color="red" />
                        </div>

                        {/* Quick navigation */}
                        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <a href="/admin/posts/pending" onClick={navigateTo("/admin/posts/pending", pending)}
                                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand-300 hover:shadow-md">
                                <p className="text-sm font-bold text-slate-800">Zitegereje gusuzumwa</p>
                                <p className="mt-1 text-xs text-slate-400">{pending} inkuru itegereje gusuzumwa</p>
                            </a>
                            <a href="/admin/posts/published" onClick={navigateTo("/admin/posts/published", approved)}
                                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand-300 hover:shadow-md">
                                <p className="text-sm font-bold text-slate-800">Inkuru zasohotse</p>
                                <p className="mt-1 text-xs text-slate-400">{approved} inkuru zemejwe</p>
                            </a>
                            <a href="/admin/posts/rejected" onClick={navigateTo("/admin/posts/rejected", rejected)}
                                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand-300 hover:shadow-md">
                                <p className="text-sm font-bold text-slate-800">Zanzwe</p>
                                <p className="mt-1 text-xs text-slate-400">{rejected} inkuru zanzwe</p>
                            </a>
                            <a href="/admin/reports" onClick={(e) => { e.preventDefault(); navigate("/admin/reports"); }}
                                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand-300 hover:shadow-md">
                                <p className="text-sm font-bold text-slate-800">Kuramo raporo</p>
                                <p className="mt-1 text-xs text-slate-400">Kurura raporo ya CSV</p>
                            </a>
                        </div>

                        {/* Comments summary */}
                        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-base font-black text-slate-900">Ibitekerezo</h2>
                                    <p className="mt-0.5 text-xs text-slate-400">Igiteranyo cy'ibitekerezo ku nkuru zose.</p>
                                </div>
                                <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-black text-brand-700">
                                    {comments}
                                </span>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}

export default Overview;
