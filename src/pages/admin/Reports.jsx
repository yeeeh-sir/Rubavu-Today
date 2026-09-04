import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminPosts, getEmployees, getChiefEditors, logout } from "../../services/api";
import { DashboardLayout, StatCard } from "../../components/dashboard";
import { ADMIN_NAV_SECTIONS } from "./adminNav";

const normalizeStatus = (post) =>
    String(post?.status || post?.approval_status || post?.publication_status || "pending").toLowerCase();

const REPORT_TYPES = [
    { value: "posts", label: "Inkuru" },
    { value: "authors", label: "Abanditsi" },
];

function Reports() {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [chiefs, setChiefs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [reportType, setReportType] = useState("posts");

    useEffect(() => {
        let active = true;
        const load = async () => {
            try {
                const [p, emp, ch] = await Promise.all([
                    getAdminPosts().catch(() => []),
                    getEmployees().catch(() => []),
                    getChiefEditors().catch(() => []),
                ]);
                if (active) {
                    setPosts(Array.isArray(p) ? p : []);
                    setEmployees(Array.isArray(emp) ? emp : []);
                    setChiefs(Array.isArray(ch) ? ch : []);
                }
            } catch (err) {
                if (active) setError(err?.message || "Unable to load report data.");
            } finally {
                if (active) setLoading(false);
            }
        };
        load();
        return () => { active = false; };
    }, []);

    const filtered = useMemo(() => {
        let result = posts;
        if (from) {
            const fromT = new Date(from);
            result = result.filter((p) => new Date(p.createdDate || 0) >= fromT);
        }
        if (to) {
            const toT = new Date(to);
            toT.setHours(23, 59, 59, 999);
            result = result.filter((p) => new Date(p.createdDate || 0) <= toT);
        }
        return result;
    }, [posts, from, to]);

    const stats = useMemo(() => ({
        total: filtered.length,
        approved: filtered.filter((p) => normalizeStatus(p) === "approved").length,
        pending: filtered.filter((p) => normalizeStatus(p) === "pending").length,
        rejected: filtered.filter((p) => normalizeStatus(p) === "rejected").length,
        comments: filtered.reduce((t, p) => t + (p.comments?.length || 0), 0),
    }), [filtered]);

    const downloadCSV = () => {
        const headers = ["Title", "Category", "Status", "Created Date", "Comments"];
        const rows = filtered.map((post) => [
            post.title || "", post.category || "", normalizeStatus(post),
            post.createdDate || "", post.comments?.length || 0,
        ]);
        const csv = [headers, ...rows]
            .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
            .join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "rubavu-today-report.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <DashboardLayout
            navigationSections={ADMIN_NAV_SECTIONS}
            roleLabel="Imicungire y'ubwanditsi"
            onLogout={() => { logout(); navigate("/admin/login", { replace: true }); }}
        >
            <div className="mx-auto max-w-7xl px-3 py-6 sm:px-6 lg:px-8">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-black text-slate-900 sm:text-2xl">Kuramo raporo</h1>
                        <p className="mt-0.5 text-sm text-slate-400">Ibipimo n'u kurura raporo.</p>
                    </div>
                    <button onClick={downloadCSV}
                        className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-brand-200 transition hover:bg-brand-700">
                        📥 Kuramo raporo ya CSV
                    </button>
                </div>

                {/* Filters */}
                <div className="mb-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-3">
                    <div>
                        <label className="mb-1 block text-xs font-bold text-slate-600">Ubwoko bwa raporo</label>
                        <select value={reportType} onChange={(e) => setReportType(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500">
                            {REPORT_TYPES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-bold text-slate-600">Kuva (itariki)</label>
                        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500" />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-bold text-slate-600">Kugeza (itariki)</label>
                        <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500" />
                    </div>
                </div>

                {loading ? (
                    <p className="py-10 text-center text-sm text-slate-400">Birimo gutwara...</p>
                ) : error ? (
                    <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
                ) : (
                    <>
                        {reportType === "posts" ? (
                            <>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    <StatCard label="Inkuru zose" value={stats.total} icon="📰" color="blue" />
                                    <StatCard label="Zasohotse" value={stats.approved} icon="✓" color="emerald" />
                                    <StatCard label="Zitegereje" value={stats.pending} icon="⏳" color="amber" />
                                    <StatCard label="Zanzwe" value={stats.rejected} icon="✕" color="red" />
                                </div>
                                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <h2 className="text-base font-black text-slate-900">Ibitekerezo</h2>
                                    <p className="mt-1 text-sm text-slate-500">Igiteranyo cy'ibitekerezo: <span className="font-bold text-slate-800">{stats.comments}</span></p>
                                </div>
                            </>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <h2 className="text-base font-black text-slate-900">Abakozi</h2>
                                    <p className="mt-2 text-3xl font-black text-brand-600">{employees.length}</p>
                                    <p className="mt-1 text-xs text-slate-400">Igiteranyo cy'abakozi</p>
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <h2 className="text-base font-black text-slate-900">Abanditsi Bakuru</h2>
                                    <p className="mt-2 text-3xl font-black text-brand-600">{chiefs.length}</p>
                                    <p className="mt-1 text-xs text-slate-400">Igiteranyo cy'abanditsi bakuru</p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}

export default Reports;
