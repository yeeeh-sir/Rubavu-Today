import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminAccountPosts, getAdminAccounts, logout } from "../../services/api";
import { DashboardLayout } from "../../components/dashboard";
import { ADMIN_NAV_SECTIONS } from "./adminNav";
import OptimizedImage from "../../components/common/OptimizedImage";

const PAGE_SIZE = 20;
const ROLE_LABELS = {
    employee: "Employee",
    chief_editor: "Chief Editor",
    admin: "Admin",
};

function statusClass(status) {
    return {
        active: "bg-emerald-100 text-emerald-700",
        approved: "bg-emerald-100 text-emerald-700",
        pending: "bg-amber-100 text-amber-700",
        rejected: "bg-red-100 text-red-700",
        draft: "bg-slate-100 text-slate-600",
    }[String(status || "").toLowerCase()] || "bg-slate-100 text-slate-600";
}

function formatDate(value) {
    if (!value) return "-";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString();
}

function Pagination({ page, pageCount, onChange }) {
    if (pageCount <= 1) return null;
    return (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-sm">
            <span className="text-slate-500">Page {page} of {pageCount}</span>
            <div className="flex gap-2">
                <button type="button" disabled={page <= 1} onClick={() => onChange(page - 1)} className="btn-secondary px-3 py-2 disabled:opacity-50">Previous</button>
                <button type="button" disabled={page >= pageCount} onClick={() => onChange(page + 1)} className="btn-secondary px-3 py-2 disabled:opacity-50">Next</button>
            </div>
        </div>
    );
}

function Accounts() {
    const navigate = useNavigate();
    const [accounts, setAccounts] = useState([]);
    const [accountMeta, setAccountMeta] = useState({ page: 1, pageCount: 1, total: 0 });
    const [accountSearch, setAccountSearch] = useState("");
    const [accountQuery, setAccountQuery] = useState("");
    const [selected, setSelected] = useState(null);
    const [postData, setPostData] = useState(null);
    const [postPage, setPostPage] = useState(1);
    const [postSearch, setPostSearch] = useState("");
    const [postStatus, setPostStatus] = useState("");
    const [loading, setLoading] = useState(true);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [error, setError] = useState("");

    const loadAccounts = useCallback(async (page = 1, search = accountQuery) => {
        setLoading(true);
        try {
            const payload = await getAdminAccounts({ page, limit: PAGE_SIZE, search });
            setAccounts(payload.accounts || []);
            setAccountMeta(payload);
            setError("");
        } catch (err) {
            setError(err?.message || "Unable to load accounts.");
        } finally {
            setLoading(false);
        }
    }, [accountQuery]);

    const loadPosts = useCallback(async (account, page = 1) => {
        if (!account) return;
        setLoadingPosts(true);
        try {
            const payload = await getAdminAccountPosts(account.role, account.id, {
                page,
                limit: PAGE_SIZE,
                search: postSearch,
                status: postStatus,
            });
            setSelected(account);
            setPostData(payload);
            setPostPage(page);
            setError("");
        } catch (err) {
            setError(err?.message || "Unable to load account posts.");
        } finally {
            setLoadingPosts(false);
        }
    }, [postSearch, postStatus]);

    useEffect(() => { loadAccounts(); }, [loadAccounts]);

    const submitAccountSearch = (event) => {
        event.preventDefault();
        setAccountQuery(accountSearch.trim());
        loadAccounts(1, accountSearch.trim());
    };

    const submitPostSearch = (event) => {
        event.preventDefault();
        loadPosts(selected, 1);
    };

    return (
        <DashboardLayout
            navigationSections={ADMIN_NAV_SECTIONS}
            roleLabel="Imicungire y'ubwanditsi"
            onLogout={() => { logout(); navigate("/admin/login", { replace: true }); }}
        >
            <div className="mx-auto max-w-7xl px-3 py-6 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <h1 className="text-xl font-black text-slate-900 sm:text-2xl">Konti n'Inkuru</h1>
                    <p className="mt-1 text-sm text-slate-500">Reba konti zose n'amateka yuzuye y'inkuru zabo.</p>
                </div>

                <form onSubmit={submitAccountSearch} className="mb-5 flex flex-col gap-2 sm:flex-row">
                    <input value={accountSearch} onChange={(event) => setAccountSearch(event.target.value)} placeholder="Shakisha izina, email cyangwa username..." className="form-input" />
                    <button type="submit" className="btn-primary shrink-0">Shakisha konti</button>
                </form>

                {error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

                <section className="card overflow-hidden">
                    <div className="border-b border-slate-200 px-4 py-4 sm:px-5">
                        <h2 className="font-black text-slate-900">Konti zose ({accountMeta.total || 0})</h2>
                    </div>
                    {loading ? <p className="p-8 text-center text-sm text-slate-500">Birimo gutwara...</p> : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[760px] text-left text-sm">
                                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                    <tr><th className="px-4 py-3">Konti</th><th className="px-2 py-3">Role</th><th className="px-2 py-3">Status</th><th className="px-2 py-3 text-center">Inkuru</th><th className="px-2 py-3">Created</th><th className="px-2 py-3">Last activity</th><th className="px-4 py-3 text-right">Action</th></tr>
                                </thead>
                                <tbody>
                                    {accounts.map((account) => (
                                        <tr key={`${account.role}-${account.id}`} className="border-t border-slate-100">
                                            <td className="px-4 py-3"><p className="font-bold text-slate-900">{account.name}</p><p className="text-xs text-slate-500">{account.email}</p></td>
                                            <td className="px-2 py-3 text-slate-600">{ROLE_LABELS[account.role] || account.role}</td>
                                            <td className="px-2 py-3"><span className={`rounded-full px-2 py-1 text-xs font-bold ${statusClass(account.status)}`}>{account.status || "-"}</span></td>
                                            <td className="px-2 py-3 text-center font-black text-slate-900">{account.post_count || 0}</td>
                                            <td className="px-2 py-3 text-slate-500">{formatDate(account.created_at)}</td>
                                            <td className="px-2 py-3 text-slate-500">{formatDate(account.last_activity)}</td>
                                            <td className="px-4 py-3 text-right"><button type="button" onClick={() => loadPosts(account, 1)} className="btn-secondary px-3 py-2 text-xs">👁️ Reba Inkuru</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {!loading && accounts.length === 0 && <p className="p-8 text-center text-sm text-slate-500">Nta konti ibonetse.</p>}
                    <Pagination page={accountMeta.page || 1} pageCount={accountMeta.pageCount || 1} onChange={(page) => loadAccounts(page)} />
                </section>

                {selected && (
                    <section className="card mt-6 overflow-hidden">
                        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 p-4 sm:p-5">
                            <div><h2 className="font-black text-slate-900">{selected.name}</h2><p className="text-sm text-slate-500">{ROLE_LABELS[selected.role]} • {selected.email}</p></div>
                            <span className={`rounded-full px-2 py-1 text-xs font-bold ${statusClass(selected.status)}`}>{selected.status}</span>
                        </div>
                        {postData && <div className="grid grid-cols-2 gap-2 border-b border-slate-200 p-4 sm:grid-cols-5">
                            {[["Total", postData.stats?.total], ["Published", postData.stats?.published], ["Pending", postData.stats?.pending], ["Rejected", postData.stats?.rejected], ["Drafts", postData.stats?.drafts]].map(([label, value]) => <div key={label} className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-xl font-black text-slate-900">{value || 0}</p></div>)}
                        </div>}
                        <form onSubmit={submitPostSearch} className="flex flex-col gap-2 border-b border-slate-200 p-4 sm:flex-row">
                            <input value={postSearch} onChange={(event) => setPostSearch(event.target.value)} placeholder="Shakisha inkuru cyangwa icyiciro..." className="form-input" />
                            <select value={postStatus} onChange={(event) => setPostStatus(event.target.value)} className="form-select sm:max-w-48"><option value="">Status zose</option><option value="approved">Published</option><option value="pending">Pending</option><option value="rejected">Rejected</option><option value="draft">Draft</option></select>
                            <button type="submit" className="btn-secondary shrink-0">Shakisha</button>
                        </form>
                        {loadingPosts ? <p className="p-8 text-center text-sm text-slate-500">Birimo gutwara inkuru...</p> : (
                            <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Title</th><th className="px-2 py-3">Category</th><th className="px-2 py-3">Status</th><th className="px-2 py-3">Created</th><th className="px-2 py-3">Updated</th><th className="px-2 py-3">Views</th></tr></thead><tbody>{(postData?.posts || []).map((post) => <tr key={post.id} className="border-t border-slate-100"><td className="px-4 py-3"><div className="flex items-center gap-3">{post.image && <OptimizedImage src={post.image} alt="" widths={[80]} sizes="40px" className="h-10 w-10 rounded-lg object-cover" />}<span className="font-bold text-slate-900">{post.title}</span></div></td><td className="px-2 py-3 text-slate-600">{post.category}</td><td className="px-2 py-3"><span className={`rounded-full px-2 py-1 text-xs font-bold ${statusClass(post.status)}`}>{post.status}</span></td><td className="px-2 py-3 text-slate-500">{formatDate(post.created_at)}</td><td className="px-2 py-3 text-slate-500">{formatDate(post.updated_at || post.published_at)}</td><td className="px-2 py-3 text-slate-600">{post.views ?? 0}</td></tr>)}</tbody></table></div>
                        )}
                        {!loadingPosts && postData?.posts?.length === 0 && <p className="p-8 text-center text-sm text-slate-500">Nta nkuru ibonetse.</p>}
                        <Pagination page={postData?.page || postPage} pageCount={postData?.pageCount || 1} onChange={(page) => loadPosts(selected, page)} />
                    </section>
                )}
            </div>
        </DashboardLayout>
    );
}

export default Accounts;
