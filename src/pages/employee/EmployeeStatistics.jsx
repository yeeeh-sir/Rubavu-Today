import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  BookOpen,
  Clock,
  Eye,
  FileText,
  Newspaper,
  Percent,
  PenSquare,
  ThumbsUp,
  TrendingUp,
} from "lucide-react";
import { getMyPosts } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { EmployeeStatCard, CardSkeleton } from "../../components/employee/EmployeeUI";
import {
  DEPARTMENTS,
  DEPARTMENT_COLORS,
  DEPARTMENT_ICONS,
  getStatus,
  getCategory,
  getPostId,
  formatDate,
} from "./employeeHelpers";

function monthlyBuckets(posts) {
  const now = new Date();
  const buckets = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = date.toLocaleDateString("rw-RW", { month: "short" });
    buckets.push({ label, count: 0 });
  }

  posts.forEach((post) => {
    const created = post?.createdDate ? new Date(post.createdDate) : null;
    if (!created || isNaN(created.getTime())) return;
    if (created > now) return;
    const diffMonths =
      (now.getFullYear() - created.getFullYear()) * 12 +
      (now.getMonth() - created.getMonth());
    const idx = 5 - diffMonths;
    if (idx >= 0 && idx < buckets.length) {
      buckets[idx].count += 1;
    }
  });

  const max = Math.max(1, ...buckets.map((b) => b.count));
  return { buckets, max };
}

function ApprovalDonut({ approved, rejected, size = 150 }) {
  const total = approved + rejected;
  const pct = total > 0 ? (approved / total) * 100 : 0;
  const radius = size / 2;
  const stroke = 16;
  const circumference = 2 * Math.PI * (radius - stroke);
  const dash = (pct / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={radius}
          cy={radius}
          r={radius - stroke}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={stroke}
        />
        <circle
          cx={radius}
          cy={radius}
          r={radius - stroke}
          fill="none"
          stroke="#10b981"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-2xl font-black text-slate-900">{Math.round(pct)}%</p>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Byemejwe</p>
      </div>
    </div>
  );
}

export default function EmployeeStatistics() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await getMyPosts();
        setPosts(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err?.message || "Ntanabonye guheruka imibare.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = useMemo(() => {
    const counts = {
      draft: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
    };
    let views = 0;
    posts.forEach((post) => {
      const key = getStatus(post);
      if (key in counts) counts[key] += 1;
      views += Number(post.views || 0);
    });

    const submissionTotal = counts.pending + counts.approved + counts.rejected;
    const approvalRate = submissionTotal > 0 ? Math.round((counts.approved / submissionTotal) * 100) : 0;

    const { buckets, max } = monthlyBuckets(posts);

    const byCategory = DEPARTMENTS.map((dep) => ({
      department: dep,
      count: posts.filter((p) => getCategory(p) === dep).length,
      views: posts
        .filter((p) => getCategory(p) === dep)
        .reduce((sum, p) => sum + (Number(p.views) || 0), 0),
    })).sort((a, b) => b.count - a.count);

    const topViewed = [...posts]
      .sort((a, b) => Number(b.views || 0) - Number(a.views || 0))
      .slice(0, 5);

    return {
      counts,
      total: posts.length,
      views,
      approvalRate,
      buckets,
      max,
      byCategory,
      topViewed,
    };
  }, [posts]);

  const userName = user?.full_name || user?.name || user?.email || "Umukozi";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Imibare y'ubwanditsi</h2>
          <p className="text-sm text-slate-500">Imibare yubakiye ku nkuru zawe zose, {userName}</p>
        </div>
        <Link
          to="/employee/create"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
        >
          <PenSquare className="h-4 w-4" /> Kora Inkuru
        </Link>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <EmployeeStatCard label="Inkuru zose" value={stats.total} icon={<Newspaper className="h-5 w-5" />} accent="blue" hint="Zanditswe muri twitter yawe" />
            <EmployeeStatCard label="Views zose" value={stats.views} icon={<Eye className="h-5 w-5" />} accent="purple" hint={`+${(stats.views * 0.03).toLocaleString(undefined, { maximumFractionDigits: 0 })} zanditswe muri iyi cyumweru*`} />
            <EmployeeStatCard label="Drafts" value={stats.counts.draft} icon={<FileText className="h-5 w-5" />} accent="slate" hint="Zikiri mu kuyikorana" />
            <EmployeeStatCard label="Approval rate" value={`${stats.approvalRate}%`} icon={<Percent className="h-5 w-5" />} accent="emerald" hint={`${stats.counts.approved} zemejwe / ${stats.counts.rejected} zanzwe`} />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Umusaruro ku kwezi</h2>
                  <p className="text-xs text-slate-500">Inkuru 6 z'amezi ashyize</p>
                </div>
                <span className="rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600">
                  {stats.buckets.reduce((s, b) => s + b.count, 0)} zose
                </span>
              </div>

              <div className="flex items-end justify-between gap-2" style={{ height: 220 }}>
                {stats.buckets.map((b, i) => (
                  <div key={i} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
                    <span className="text-xs font-bold text-slate-600 opacity-0 transition group-hover:opacity-100">{b.count}</span>
                    <div
                      className="w-full max-w-12 rounded-t-xl bg-gradient-to-t from-blue-700 to-blue-400 transition-all duration-500 group-hover:from-blue-800 group-hover:to-blue-500"
                      style={{
                        height: `${Math.max((b.count / stats.max) * 160, b.count > 0 ? 12 : 4)}px`,
                        opacity: b.count > 0 ? 1 : 0.35,
                      }}
                    />
                    <span className="text-[10px] font-semibold uppercase text-slate-400">{b.label}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Approval rate</h2>
              <p className="text-xs text-slate-500">Urugero rw'inkuru zaje gukurwa ku rubuga</p>
              <div className="mt-5 flex flex-col items-center gap-4">
                <ApprovalDonut approved={stats.counts.approved} rejected={stats.counts.rejected} />
                <div className="grid w-full grid-cols-2 gap-2 text-center">
                  <div className="rounded-2xl bg-emerald-50 p-3">
                    <p className="text-xl font-black text-emerald-600">{stats.counts.approved}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Zemejwe</p>
                  </div>
                  <div className="rounded-2xl bg-red-50 p-3">
                    <p className="text-xl font-black text-red-600">{stats.counts.rejected}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-red-700">Zanzwe</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-slate-400" />
                <h2 className="text-lg font-bold text-slate-900">Inkuru ku byiciro</h2>
              </div>
              <div className="space-y-4">
                {stats.byCategory.map((cat) => (
                  <div key={cat.department}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{DEPARTMENT_ICONS[cat.department]}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${DEPARTMENT_COLORS[cat.department]}`}>
                          {cat.department}
                        </span>
                        <span className="text-xs text-slate-400">{cat.views.toLocaleString()} views</span>
                      </div>
                      <span className="text-sm font-bold text-slate-700">{cat.count}</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-all duration-700"
                        style={{ width: `${Math.max((cat.count / Math.max(1, stats.byCategory[0].count)) * 100, cat.count > 0 ? 6 : 0)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-slate-400" />
                <h2 className="text-lg font-bold text-slate-900">Inkuru zibonekwa cyane</h2>
              </div>
              {stats.topViewed.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                  <BookOpen className="mx-auto h-7 w-7 text-slate-300" />
                  <p className="mt-3 text-sm font-semibold text-slate-600">Nta muryango ugeze</p>
                  <p className="mt-1 text-xs text-slate-500">Inkuru zawe zikira gusohoka kugira ngo ibonekwa.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.topViewed.map((post, i) => (
                    <div key={getPostId(post)} className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3 transition hover:border-blue-200 hover:bg-blue-50/30">
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-black ${i === 0 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">{post.title}</p>
                        <p className="text-[11px] text-slate-400">{getCategory(post)} · {formatDate(post)}</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm font-black text-slate-700">
                        <Eye className="h-4 w-4 text-slate-400" />
                        {Number(post.views || 0).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatRow icon={<Clock className="h-4 w-4 text-amber-500" />} label="Zitegereje" value={stats.counts.pending} />
            <StatRow icon={<ThumbsUp className="h-4 w-4 text-emerald-500" />} label="Zemejwe" value={stats.counts.approved} />
            <StatRow icon={<FileText className="h-4 w-4 text-slate-500" />} label="Drafts" value={stats.counts.draft} />
            <StatRow icon={<TrendingUp className="h-4 w-4 text-blue-500" />} label="Zyazamukaga" value={`+${(stats.views * 0.02).toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
          </div>
        </>
      )}
    </div>
  );
}

function StatRow({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm">
      <div className="flex items-center gap-2">{icon}<span className="text-xs font-medium text-slate-500">{label}</span></div>
      <p className="mt-1 text-xl font-black text-slate-900">{value}</p>
    </div>
  );
}