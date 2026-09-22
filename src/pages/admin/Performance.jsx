import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminAnalytics, logout } from "../../services/api";
import { DashboardLayout, StatCard } from "../../components/dashboard";
import { ADMIN_NAV_SECTIONS } from "./adminNav";

const RANGES = [
  { value: "today", label: "Today", startDate: "today", endDate: "today" },
  { value: "7", label: "7 Days", startDate: "6daysAgo", endDate: "today" },
  { value: "28", label: "28 Days", startDate: "27daysAgo", endDate: "today" },
  { value: "90", label: "90 Days", startDate: "89daysAgo", endDate: "today" },
];

const REALTIME_INTERVAL_MS = 60000;

function formatCount(value) {
  const number = Number(value || 0);
  if (!isFinite(number)) return "0";
  return number.toLocaleString();
}

function formatDuration(seconds) {
  const total = Math.max(0, Math.round(Number(seconds) || 0));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}

function formatTick(value) {
  const raw = String(value || "");
  if (/^\d{8}$/.test(raw)) return `${raw.slice(4, 6)}/${raw.slice(6, 8)}`;
  return raw.slice(5);
}

function Section({ title, subtitle, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-3">
        <h3 className="text-sm font-black text-slate-900">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function TimeChart({ items, valueKey, colorClass = "bg-brand-500" }) {
  if (!items || items.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">Nta mibare ibonetse.</p>;
  }

  const max = Math.max(1, ...items.map((item) => Number(item[valueKey]) || 0));

  return (
    <div className="mt-2 flex h-44 items-end gap-1 overflow-x-auto pb-5" role="img">
      {items.map((item, index) => {
        const value = Number(item[valueKey]) || 0;
        const height = Math.max(3, Math.round((value / max) * 100));
        return (
          <div
            key={index}
            className="group flex h-full min-w-6 flex-1 flex-col justify-end"
            title={`${item.date}: ${formatCount(value)}`}
          >
            <div
              className={`w-full rounded-t-md ${colorClass} transition group-hover:opacity-80`}
              style={{ height: `${height}%` }}
            />
            <span className="mt-1 -rotate-45 origin-top-left whitespace-nowrap text-[9px] text-slate-400">
              {formatTick(item.date)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function DataTable({ columns, rows, emptyText = "Nta mibare ibonetse." }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={`px-4 py-2.5 font-bold ${column.align === "right" ? "text-right" : ""}`}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-slate-400">
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr key={`${row.key || index}-${index}`} className="transition hover:bg-slate-50/70">
                {columns.map((column) => (
                  <td key={column.key} className={`px-4 py-2.5 ${column.align === "right" ? "text-right" : ""}`}>
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function CellText({ children, className }) {
  return <span className={className || "text-slate-700"}>{children}</span>;
}

function PublicPageLink({ path, fallback }) {
  if (!path || !String(path).startsWith("/")) {
    return <span className="block truncate text-xs text-slate-500">{fallback}</span>;
  }
  return (
    <a
      href={`${window.location.origin}${path}`}
      target="_blank"
      rel="noopener noreferrer"
      className="block truncate text-xs font-semibold text-brand-600 underline decoration-dotted underline-offset-2 hover:text-brand-800"
    >
      {path}
    </a>
  );
}

function LiveNow({ realtime, updatedAt, refreshing }) {
  const rows = realtime?.byCountry || [];

  return (
    <div className="mb-5 overflow-hidden rounded-2xl border border-red-200 bg-gradient-to-r from-red-600 to-rose-600 shadow-md">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-2xl" aria-hidden="true">
            🔴
          </span>
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/80">LIVE NOW</p>
            <p className="text-xl font-black text-white">
              {formatCount(realtime?.activeUsers)} Active Users
            </p>
          </div>
        </div>
        <div className="text-right text-[11px] text-white/90">
          <p>{refreshing ? "Refreshing..." : "Auto-refreshes every 60s"}</p>
          {updatedAt && <p>Updated {updatedAt.toLocaleTimeString()}</p>}
        </div>
      </div>

      {(rows.length > 0 || realtime?.activeUsers > 0) && (
        <div className="bg-white/95 px-4 py-3 sm:px-5">
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">Active Users Right Now</p>
          <div className="mt-2 grid gap-x-8 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
            {rows.length > 0 ? (
              rows.map((row, index) => (
                <div key={`${row.country}-${index}`} className="flex items-center justify-between gap-3 border-b border-slate-100 py-1 text-sm last:border-0">
                  <span className="truncate text-slate-700">{row.country}</span>
                  <span className="font-bold text-slate-900">{formatCount(row.activeUsers)}</span>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-between gap-3 py-1 text-sm">
                <span className="truncate text-slate-700">Rwanda</span>
                <span className="font-bold text-slate-900">{formatCount(realtime?.activeUsers)}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Performance() {
  const navigate = useNavigate();
  const [range, setRange] = useState("7");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);

  const loadAnalytics = useCallback(
    async (silent = false) => {
      if (!silent) {
        setLoading(true);
        setError("");
      } else {
        setRefreshing(true);
      }

      const config = RANGES.find((item) => item.value === range) || RANGES[1];

      try {
        const payload = await getAdminAnalytics({
          startDate: config.startDate,
          endDate: config.endDate,
        });
        setData(payload);
        setError("");
        setUpdatedAt(new Date());
      } catch (err) {
        setData(null);
        if (err?.status === 403) {
          setError("You are not authorized to access performance analytics.");
        } else {
          setError("Unable to load analytics.");
        }
      } finally {
        if (!silent) {
          setLoading(false);
        } else {
          setRefreshing(false);
        }
      }
    },
    [range]
  );

  useEffect(() => {
    loadAnalytics(false);
  }, [loadAnalytics]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      loadAnalytics(true);
    }, REALTIME_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [loadAnalytics]);

  const overview = data?.overview || {};
  const trafficSources = useMemo(() => (data?.trafficSources || []).map((row) => ({ ...row, key: `${row.sourceMedium}-sources` })), [data]);
  const channels = useMemo(() => (data?.channels || []).map((row) => ({ ...row, key: `${row.channel}-channel` })), [data]);
  const countries = useMemo(() => (data?.countries || []).map((row) => ({ ...row, key: `${row.country}-country` })), [data]);
  const cities = useMemo(() => (data?.cities || []).map((row) => ({ ...row, key: `${row.city}-city` })), [data]);
  const topPages = useMemo(() => (data?.topPages || []).map((row) => ({ ...row, key: `${row.path}-page` })), [data]);
  const firstUserSources = useMemo(() => (data?.firstUserSources || []).map((row) => ({ ...row, key: `${row.sourceMedium}-first` })), [data]);
  const usersOverTime = data?.usersOverTime || [];
  const viewsOverTime = data?.viewsOverTime || [];

  return (
    <DashboardLayout
      navigationSections={ADMIN_NAV_SECTIONS}
      roleLabel="Imicungire y'ubwanditsi"
      onLogout={() => {
        logout();
        navigate("/admin/login", { replace: true });
      }}
    >
      <div className="mx-auto max-w-7xl px-3 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-black text-slate-900 sm:text-2xl">
              📊 Google Analytics 4
            </h1>
            <p className="mt-0.5 text-sm text-slate-400">
              GA4 imikorere y'urubuga rwa Rubavu Today
            </p>
            {data && (
              <p className="mt-1 text-[11px] text-slate-400">
                GA4 • {data.timeZone} • {data.startDate} — {data.endDate}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
              {RANGES.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setRange(item.value)}
                  className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
                    range === item.value
                      ? "bg-brand-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => loadAnalytics(false)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-6" aria-label="Loading analytics">
            <div className="h-28 animate-pulse rounded-2xl bg-slate-200" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="h-28 animate-pulse rounded-2xl bg-slate-100" />
              ))}
            </div>
            <p className="py-4 text-center text-sm text-slate-400">Loading analytics...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-10 text-center">
            <p className="text-base font-bold text-amber-800">{error}</p>
            <p className="mt-1 text-sm text-amber-700">GA4 ibara ntiboneka ubu.</p>
            <button
              onClick={() => loadAnalytics(false)}
              className="mt-4 rounded-xl bg-amber-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-amber-800"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <LiveNow realtime={data?.realtime} updatedAt={updatedAt} refreshing={refreshing} />

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <StatCard label="Active Users" value={overview.activeUsers || 0} icon="👥" color="blue" />
              <StatCard label="Total Users" value={overview.totalUsers || 0} icon="🧑" color="slate" />
              <StatCard label="Sessions" value={overview.sessions || 0} icon="↔" color="purple" />
              <StatCard label="Page Views" value={overview.pageViews || 0} icon="👁" color="emerald" />
              <StatCard label="New Users" value={overview.newUsers || 0} icon="✨" color="amber" />
              <StatCard label="Avg. Engagement Time" value={formatDuration(overview.averageEngagementTime)} icon="⏱" color="red" />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Section title="Users over time" subtitle="Active Users by date">
                <TimeChart items={usersOverTime} valueKey="users" colorClass="bg-blue-500" />
              </Section>
              <Section title="Views over time" subtitle="Page Views by date">
                <TimeChart items={viewsOverTime} valueKey="pageViews" colorClass="bg-emerald-500" />
              </Section>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Section title="Traffic Sources" subtitle="Session source / medium">
                <DataTable
                  columns={[
                    { key: "sourceMedium", label: "Source / Medium", render: (row) => <CellText className="truncate font-semibold text-slate-700">{row.sourceMedium}</CellText> },
                    { key: "sessions", label: "Sessions", align: "right", render: (row) => <span className="font-bold text-slate-900">{formatCount(row.sessions)}</span> },
                    { key: "activeUsers", label: "Users", align: "right", render: (row) => <span className="text-slate-600">{formatCount(row.activeUsers)}</span> },
                  ]}
                  rows={trafficSources}
                />
              </Section>
              <Section title="Session Channel Group" subtitle="Default channel grouping">
                <DataTable
                  columns={[
                    { key: "channel", label: "Channel", render: (row) => <CellText className="truncate font-semibold text-slate-700">{row.channel}</CellText> },
                    { key: "sessions", label: "Sessions", align: "right", render: (row) => <span className="font-bold text-slate-900">{formatCount(row.sessions)}</span> },
                  ]}
                  rows={channels}
                />
              </Section>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Section title="Countries" subtitle="Active users by country">
                <DataTable
                  columns={[
                    { key: "country", label: "Country", render: (row) => <CellText className="truncate font-semibold text-slate-700">{row.country}</CellText> },
                    { key: "activeUsers", label: "Active Users", align: "right", render: (row) => <span className="font-bold text-slate-900">{formatCount(row.activeUsers)}</span> },
                  ]}
                  rows={countries}
                />
              </Section>
              <Section title="Cities" subtitle="Active users by city">
                <DataTable
                  columns={[
                    { key: "city", label: "City", render: (row) => <CellText className="truncate font-semibold text-slate-700">{row.city}</CellText> },
                    { key: "activeUsers", label: "Active Users", align: "right", render: (row) => <span className="font-bold text-slate-900">{formatCount(row.activeUsers)}</span> },
                  ]}
                  rows={cities}
                />
              </Section>
            </div>

            <Section title="Top Articles" subtitle="Top 20 pages by page views">
              <DataTable
                columns={[
                  {
                    key: "page",
                    label: "Article / Page",
                    render: (row) => (
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">{row.title || row.path}</p>
                        <PublicPageLink path={row.path} fallback={row.path} />
                      </div>
                    ),
                  },
                  { key: "pageViews", label: "Views", align: "right", render: (row) => <span className="font-bold text-slate-900">{formatCount(row.pageViews)}</span> },
                  { key: "activeUsers", label: "Active Users", align: "right", render: (row) => <span className="text-slate-600">{formatCount(row.activeUsers)}</span> },
                ]}
                rows={topPages}
                emptyText="Nta mibare ibonetse."
              />
            </Section>

            <Section title="First User Source / Medium" subtitle="Top first-touch acquisition sources">
              <DataTable
                columns={[
                  { key: "sourceMedium", label: "Source / Medium", render: (row) => <CellText className="truncate font-semibold text-slate-700">{row.sourceMedium}</CellText> },
                  { key: "activeUsers", label: "Active Users", align: "right", render: (row) => <span className="font-bold text-slate-900">{formatCount(row.activeUsers)}</span> },
                ]}
                rows={firstUserSources}
              />
            </Section>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Performance;