import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { deletePost, getMyPosts } from "../../services/api";
import { useToast } from "../../components/employee/EmployeeUI";
import { useNotifications } from "../../context/NotificationsContext";
import { ModalShell, ModalHeader, ModalFooter } from "../../components/dashboard/Modal";
import {
  EmployeeStatusBadge,
  ConfirmModal,
  CardSkeleton,
} from "../../components/employee/EmployeeUI";
import {
  DEPARTMENTS,
  DEPARTMENT_COLORS,
  DEPARTMENT_ICONS,
  getStatus,
  getCategory,
  getPostId,
  getImageUrl,
  formatDate,
} from "./employeeHelpers";

const PAGE_SIZE = 8;

const STATUS_FILTERS = [
  { value: "all", label: "Zose" },
  { value: "draft", label: "Drafts" },
  { value: "pending", label: "Zitegereje" },
  { value: "approved", label: "Zemejwe" },
  { value: "rejected", label: "Zanzwe" },
];

export default function MyArticles() {
  const toast = useToast();
  const { refresh: refreshNotifications } = useNotifications();
  const [searchParams, setSearchParams] = useSearchParams();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [status, setStatus] = useState(searchParams.get("status") || "all");
  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadPosts = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getMyPosts();
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Ntanabonye gushyiramo inkuru. Ongera ugerageze.");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
    refreshNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null && q !== undefined) {
      setSearch(q);
      setPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return posts.filter((post) => {
      if (status !== "all" && getStatus(post) !== status) return false;
      if (category !== "all" && getCategory(post) !== category) return false;
      if (!term) return true;
      return String(post.title || "").toLowerCase().includes(term);
    });
  }, [posts, search, status, category]);

  const sorted = useMemo(
    () =>
      [...filtered].sort((a, b) =>
        String(b.createdDate || "").localeCompare(String(a.createdDate || ""))
      ),
    [filtered]
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const applyFilters = (nextStatus, nextCategory) => {
    setStatus(nextStatus);
    setCategory(nextCategory);
    setPage(1);
    const params = {};
    if (nextStatus !== "all") params.status = nextStatus;
    if (nextCategory !== "all") params.category = nextCategory;
    setSearchParams(params, { replace: true });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const id = getPostId(deleteTarget);
    setDeleting(true);
    try {
      await deletePost(id);
      toast.success("Inkuru yakukuruweho neza.");
      setPosts((prev) => prev.filter((p) => getPostId(p) !== id));
      setDeleteTarget(null);
      refreshNotifications();
    } catch (err) {
      toast.error(err?.message || "Ntanabonye gukuraho inkuru. Ongera ugerageze.");
    } finally {
      setDeleting(false);
    }
  };

  const openDetails = (post) => {
    setSelected(post);
    setDetailsOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-40"><CardSkeleton /></div>
        <div className="grid gap-3 rounded-3xl border border-slate-200 bg-white p-5">
          {[0, 1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Inkuru Zanjye</h2>
          <p className="text-sm text-slate-500">
            {posts.length} zose, {filtered.length} zigera {status === "all" ? "" : `(status: ${status})`}
          </p>
        </div>
        <Link
          to="/employee/create"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> Kora Inkuru
        </Link>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>
      )}

      <div className="space-y-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Shakisha n'umutwe w'inkuru..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={status}
                onChange={(e) => applyFilters(e.target.value, category)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white"
              >
                {STATUS_FILTERS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>

              <select
                value={category}
                onChange={(e) => applyFilters(status, e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white"
              >
                <option value="all">Ibyiciro byose</option>
                {DEPARTMENTS.map((dep) => (
                  <option key={dep} value={dep}>{dep}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <FileText className="h-10 w-10 text-slate-300" />
            <h3 className="mt-4 text-base font-semibold text-slate-800">Nta nkuru ibonetse</h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              {posts.length === 0
                ? "Urahano inkuru. Tangira ukore inkuru yawe ya mbere."
                : "Ongera uhindure imigenzo yose cg ushakishe indi nkuru."}
            </p>
            {posts.length === 0 && (
              <Link
                to="/employee/create"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" /> Kora Inkuru
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[820px] text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-5 py-3.5">Inkuru</th>
                    <th className="px-4 py-3.5">Icyiciro</th>
                    <th className="px-4 py-3.5">Date</th>
                    <th className="px-4 py-3.5">Imiterere</th>
                    <th className="px-4 py-3.5 text-right">Views</th>
                    <th className="px-5 py-3.5 text-right">Ibikorwa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pageItems.map((post) => (
                    <tr key={getPostId(post)} className="transition hover:bg-slate-50/70">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                            {getImageUrl(post) ? (
                              <img src={getImageUrl(post)} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-slate-300">
                                <FileText className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="max-w-md truncate text-sm font-semibold text-slate-900">{post.title}</p>
                            <p className="mt-0.5 text-xs text-slate-400">
                              {post.summary ? String(post.summary).slice(0, 60) : getCategory(post)}
                              {post.summary ? "…" : ""}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${DEPARTMENT_COLORS[getCategory(post)] || "bg-slate-100 text-slate-600"}`}>
                          {DEPARTMENT_ICONS[getCategory(post)] || "📰"} {getCategory(post)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-xs font-medium text-slate-600">{formatDate(post).split(",")[0]}</p>
                        <p className="text-[10px] text-slate-400">{formatDate(post).split(",")[1]}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <EmployeeStatusBadge status={getStatus(post)} size="xs" />
                      </td>
                      <td className="px-4 py-3.5 text-right text-sm font-bold text-slate-600">
                        {Number(post.views || 0).toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openDetails(post)}
                            title="Reba"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {getStatus(post) !== "approved" && (
                            <button
                              onClick={() => setDeleteTarget(post)}
                              title="Kuraho"
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 gap-3 p-3 md:hidden">
              {pageItems.map((post) => (
                <div key={getPostId(post)} className="rounded-2xl border border-slate-200 p-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="h-11 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                        {getImageUrl(post) ? (
                          <img src={getImageUrl(post)} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-300"><FileText className="h-4 w-4" /></div>
                        )}
                      </div>
                      <p className="truncate text-sm font-semibold text-slate-900">{post.title}</p>
                    </div>
                    <EmployeeStatusBadge status={getStatus(post)} size="xs" />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {DEPARTMENT_ICONS[getCategory(post)] || "📰"} {getCategory(post)} · {formatDate(post)}
                  </p>
                  <div className="mt-3 flex items-center gap-1.5">
                    <button onClick={() => openDetails(post)} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">
                      <Eye className="h-3.5 w-3.5" /> Reba
                    </button>
                    {getStatus(post) !== "approved" && (
                      <button onClick={() => setDeleteTarget(post)} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100">
                        <Trash2 className="h-3.5 w-3.5" /> Kuraho
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3.5">
                <p className="text-xs font-medium text-slate-500">
                  {((safePage - 1) * PAGE_SIZE) + 1}–{Math.min(safePage * PAGE_SIZE, sorted.length)} / {sorted.length}
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={safePage <= 1}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-bold transition ${
                        p === safePage ? "bg-blue-600 text-white" : "border border-slate-200 text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage >= totalPages}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <PostDetailsModal
        open={detailsOpen}
        post={selected}
        onClose={() => setDetailsOpen(false)}
      />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Kuraho inkuru?"
        description={`Inkuru "${deleteTarget?.title || ""}" izakukurwaho burundu. Ntishobora guzarurwa.`}
        confirmText="Kuraho"
        cancelText="Reka"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function PostDetailsModal({ open, post, onClose }) {
  if (!open || !post) return null;

  const rejection = String(post.rejection_reason || "").trim();
  const isRejected = getStatus(post) === "rejected";
  const isApproved = getStatus(post) === "approved";

  const blocks = parseBlocks(post);
  const hasParagraphs = blocks.some(
    (b) => b.type === "paragraph" && String(b.text || "").trim()
  );
  const hero = getImageUrl(post);
  const isEmpty =
    !hasParagraphs &&
    !String(post.description || "").trim() &&
    blocks.filter((b) => b.type === "image" && b.url).length === 0;

  return (
    <ModalShell open={open} onClose={onClose} maxWidth="max-w-2xl">
      <ModalHeader
        title="Inkuru"
        onClose={onClose}
      />
      <div className="divide-y divide-slate-100">
        <div className="flex flex-col gap-4 p-5 sm:flex-row">
          <div className="h-28 w-full shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 sm:h-32 sm:w-48">
            {getImageUrl(post) ? (
              <img src={getImageUrl(post)} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-300"><FileText className="h-8 w-8" /></div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${DEPARTMENT_COLORS[getCategory(post)] || "bg-slate-100 text-slate-600"}`}>
                {DEPARTMENT_ICONS[getCategory(post)] || "📰"} {getCategory(post)}
              </span>
              <EmployeeStatusBadge status={getStatus(post)} size="xs" />
            </div>
            <h3 className="mt-2 text-lg font-bold leading-snug text-slate-900">{post.title}</h3>
            {!hasParagraphs && (
              <p className="mt-1.5 text-sm text-slate-500">{post.description || "Nta nsobanuro yanditse."}</p>
            )}
            {post.location && (
              <p className="mt-2 flex items-center gap-1 text-xs font-medium text-slate-500">📍 {post.location}</p>
            )}
          </div>
        </div>

        <div className="grid gap-3 px-5 py-4 text-xs sm:grid-cols-2">
          <InfoRow label="Yarezwaho" value={formatDate(post)} />
          <InfoRow label="Views" value={Number(post.views || 0).toLocaleString()} />
          {post.tags && <InfoRow label="Tags" value={String(post.tags)} />}
          {post.summary && <InfoRow label="Incamisake" value={String(post.summary)} />}
        </div>

        {!isEmpty && (
          <div className="px-5 py-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Inkuru yuzuye</p>
            <div className="mt-2 max-h-96 space-y-4 overflow-y-auto rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
              {hero && (
                <img src={hero} alt="" className="w-full rounded-xl border border-slate-200 object-cover" />
              )}
              {!hasParagraphs && post.description && (
                <p className="whitespace-pre-line text-sm leading-7 text-slate-700">{post.description}</p>
              )}
              {blocks.map((block, i) => {
                if (block.type === "paragraph") {
                  return (
                    <p key={i} className="whitespace-pre-line text-sm leading-7 text-slate-700">
                      {block.text}
                    </p>
                  );
                }
                if (block.type === "image" && block.url) {
                  return (
                    <figure key={i}>
                      <img src={block.url} alt="" className="w-full rounded-xl border border-slate-200 object-cover" />
                      {block.caption && (
                        <figcaption className="mt-1.5 text-center text-xs text-slate-400">{block.caption}</figcaption>
                      )}
                    </figure>
                  );
                }
                return null;
              })}
            </div>
          </div>
        )}

        {isRejected && (
          <div className="px-5 py-4">
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-red-600">Impamvu y'uko byanzwe</p>
              <p className="mt-1 text-sm text-red-700">{rejection || "Nta mpamvu yatanzwe y'uko byanzwe."}</p>
            </div>
          </div>
        )}

        {isApproved && (
          <div className="px-5 py-4">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Inkuru Yemejwe</p>
              <p className="mt-1 text-sm text-emerald-700">
                Inkuru yawe yemejwe kandi isohoka. {post.approved_by ? `Yemejwe na ${post.approved_by}.` : ""}
                <Link to={`/post/${post.slug || ""}`} target="_blank" className="inline-flex items-center gap-1 font-bold underline">
                  Reba ku rubuga <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>
      <ModalFooter>
        <button onClick={onClose} type="button" className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
          Gufunga
        </button>
      </ModalFooter>
    </ModalShell>
  );
}

function parseBlocks(post) {
  let blocks = [];
  const raw = post?.content_blocks || post?.contentBlocks || "";
  if (raw && String(raw).trim()) {
    try {
      const parsed = JSON.parse(String(raw));
      blocks = Array.isArray(parsed) ? parsed : [];
    } catch {
      blocks = [];
    }
  }
  return blocks;
}

function InfoRow({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-0.5 truncate text-sm font-medium text-slate-700">{value || "—"}</p>
    </div>
  );
}