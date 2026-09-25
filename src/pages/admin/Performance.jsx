import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAdminDailyPerformance,
  getAdminWeeklyPerformance,
  logout,
} from "../../services/api";
import { DashboardLayout, StatCard } from "../../components/dashboard";
import { ADMIN_NAV_SECTIONS } from "./adminNav";

const KIGALI_OFFSET_MS = 2 * 60 * 60 * 1000;

const RANGES = [
  { value: "today", label: "Today", days: 0 },
  { value: "7", label: "7 Days", days: 6 },
  { value: "28", label: "28 Days", days: 27 },
  { value: "90", label: "90 Days", days: 89 },
];

const ROLES = [
  { value: "all", label: "All" },
  { value: "employee", label: "Employees" },
  { value: "chief_editor", label: "Chief Editors" },
];

const REFRESH_INTERVAL_MS = 60000;

function kigaliToday() {
  return new Date(Date.now() + KIGALI_OFFSET_MS).toISOString().slice(0, 10);
}

function shiftDays(dateStr, amount) {
  const date = new Date(`${dateStr}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

function formatCount(value) {
  const number = Number(value || 0);
  if (!isFinite(number)) return "0";
  return number.toLocaleString();
}

function formatTick(value) {
  const raw = String(value || "");
  if (/^\d{8}$/.test(raw)) return `${raw.slice(4, 6)}/${raw.slice(6, 8)}`;
  return raw.slice(5);
}

function rateTone(rate) {
  if (rate >= 100) return "bg-emerald-500";
  if (rate >= 75) return "bg-blue-500";
  if (rate >= 50) return "bg-amber-500";
  if (rate > 0) return "bg-orange-500";
  return "bg-slate-300";
}

const STATUS_LABELS = {
  NOT_STARTED: { text: "Not Started", className: "bg-slate-100 text-slate-600" },
  IN_PROGRESS: { text: "Completed", className: "bg-amber-100 text-amber-700" },
  TARGET_COMPLETED: { text: "Submitted", className: "bg-emerald-100 text-emerald-700" },
  TARGET_EXCEEDED: { text: "Approved", className: "bg-blue-100 text-blue-700" },
};

function roleLabel(roleType) {
  return roleType === "chief_editor" ? "Chief Editor" : "Employee";
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

function TimeChart({ items }) {
  if (!items || items.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">No data available.</p>;
  }

  const max = Math.max(1, ...items.map((item) => Number(item.value) || 0));

  return (
    <div className="mt-2 flex h-44 items-end gap-1 overflow-x-auto pb-5" role="img">
      {items.map((item, index) => {
        const value = Number(item.value) || 0;
        const height = Math.max(3, Math.round((value / max) * 100));
        return (
          <div
            key={item.date}
            className="group flex h-full min-w-6 flex-1 flex-col justify-end"
            title={`${item.date}: ${formatCount(value)}`}
          >
            <div
              className="w-full rounded-t-md bg-brand-500 transition group-hover:opacity-80"
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

function ProgressBar({ rate }) {
  const value = Math.max(0, Math.min(Number(rate) || 0, 100));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className={`h-full rounded-full ${rateTone(value)}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function PersonRow({ person }) {
  return (
    <li className="px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-900">{person.name}</p>
          <p className="truncate text-xs text-slate-400">
            {roleLabel(person.roleType)}
            {person.department ? ` • ${person.department}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
          <span className="tabular-nums">
            {formatCount(person.completed)} / {formatCount(person.target)}
          </span>
          <span className="w-12 text-right tabular-nums text-slate-900">
            {person.completionRate}%
          </span>
        </div>
      </div>
      <div className="mt-2">
        <ProgressBar rate={person.completionRate} />
      </div>
    </li>
  );
}

function DailyTable({ people }) {
  if (!people || people.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">No employees found.</p>;
  }

  return (
    <ul className="divide-y divide-slate-100">
      {people.map((person) => (
        <PersonRow key={`${person.roleType}-${person.id}`} person={person} />
      ))}
    </ul>
  );
}

function ReportTable({ report }) {
  if (!report || report.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">No data available.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
            <th className="px-3 py-2 font-bold">Employee</th>
            <th className="px-3 py-2 font-bold">Department</th>
            <th className="px-3 py-2 text-right font-bold">Completed</th>
            <th className="px-3 py-2 text-right font-bold">Expected</th>
            <th className="px-3 py-2 text-right font-bold">Extra</th>
            <th className="px-3 py-2 text-right font-bold">Missed</th>
            <th className="px-3 py-2 text-right font-bold">Rate</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {report.map((row) => (
            <tr key={`${row.roleType}-${row.userId}`}>
              <td className="px-3 py-2.5">
                <p className="font-bold text-slate-900">{row.name}</p>
                <p className="text-xs text-slate-400">{roleLabel(row.roleType)}</p>
              </td>
              <td className="px-3 py-2.5 text-xs text-slate-500">
                {row.department || "—"}
              </td>
              <td className="px-3 py-2.5 text-right tabular-nums text-slate-900">
                {formatCount(row.totals.completed)}
              </td>
              <td className="px-3 py-2.5 text-right tabular-nums text-slate-500">
                {formatCount(row.totals.expected)}
              </td>
              <td className="px-3 py-2.5 text-right tabular-nums text-slate-500">
                {formatCount(row.totals.extra)}
              </td>
              <td className="px-3 py-2.5 text-right tabular-nums text-amber-600">
                {formatCount(row.totals.missedDays)}
              </td>
              <td className="px-3 py-2.5">
                <div className="flex items-center justify-end gap-2">
                  <div className="w-20">
                    <ProgressBar rate={row.totals.completionRate} />
                  </div>
                  <span className="w-11 text-right tabular-nums font-bold text-slate-900">
                    {row.totals.completionRate}%
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StandoutCard({ title, person, tone }) {
  if (!person) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{title}</p>
        <p className="mt-2 text-sm text-slate-400">No data.</p>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${tone}`}>
      <p className="text-xs font-bold uppercase tracking-wide opacity-70">{title}</p>
      <p className="mt-1.5 truncate text-base font-black">{person.name}</p>
      <p className="mt-0.5 text-xs opacity-80">{roleLabel(person.roleType)}</p>
      <p className="mt-2 text-sm font-bold tabular-nums">
        {formatCount(person.completed)} / {formatCount(person.expected)} •{" "}
        {person.completionRate}%
      </p>
    </div>
  );
}

export default function Performance() {
  const navigate = useNavigate();
  const [range, setRange] = useState("today");
  const [role, setRole] = useState("all");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);

  const config = RANGES.find((item) => item.value === range) || RANGES[0];

  const loadPerformance = useCallback(
    async (silent = false) => {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
        setError("");
      }

      try {
        let payload;
        if (config.days === 0) {
          payload = await getAdminDailyPerformance({ role });
        } else {
          const end = kigaliToday();
          payload = await getAdminWeeklyPerformance({
            role,
            start: shiftDays(end, -config.days),
            end,
          });
        }
        setData(payload);
        setError("");
        setUpdatedAt(new Date());
      } catch (err) {
        setData(null);
        const body = err?.response?.data;
        console.error("[performance] Worker performance request failed", {
          status: err?.status,
          message: err?.message,
        });
        if (err?.status === 403) {
          setError("You are not authorized to access performance analytics.");
        } else {
          setError(
            body?.error || "Employee performance is unavailable. Please try again."
          );
        }
      } finally {
        if (silent) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [config.days, role]
  );

  useEffect(() => {
    loadPerformance(false);
  }, [loadPerformance]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      loadPerformance(true);
    }, REFRESH_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [loadPerformance]);

  const summary = data?.summary || {};
  const rangeLabel = data?.range
    ? `${data.range.start} — ${data.range.end}`
    : "";

  const chartItems = useMemo(() => {
    if (config.days === 0 || !Array.isArray(data?.days)) return [];
    const totals = data.dayTotals || {};
    return data.days.map((day) => ({ date: day.date, value: totals[day.date] || 0 }));
  }, [data, config.days]);

  const sortedPeople = useMemo(() => {
    const people = Array.isArray(data?.people) ? data.people : [];
    return [...people].sort(
      (a, b) =>
        (b.completionRate || 0) - (a.completionRate || 0) ||
        a.name.localeCompare(b.name)
    );
  }, [data]);

  const sortedReport = useMemo(() => {
    const report = Array.isArray(data?.report) ? data.report : [];
    return [...report].sort(
      (a, b) =>
        (b.totals?.completionRate || 0) - (a.totals?.completionRate || 0) ||
        a.name.localeCompare(b.name)
    );
  }, [data]);

  return (
    <DashboardLayout
      title="Admin"
      navigationSections={ADMIN_NAV_SECTIONS}
      roleLabel="Admin"
      onLogout={() => {
        logout();
        navigate("/admin/login", { replace: true });
      }}
    >
      <div className="mx-auto max-w-7xl px-3 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-black text-slate-900 sm:text-2xl">
              📊 Employee Performance
            </h1>
            <p className="mt-0.5 text-sm text-slate-400">
              View employee and chief editor performance.
            </p>
            {rangeLabel && (
              <p className="mt-1 text-[11px] text-slate-400">
                {rangeLabel}
                {data?.range?.today ? ` • Today: ${data.range.today}` : ""}
                {updatedAt ? ` • ${updatedAt.toLocaleTimeString()}` : ""}
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
              onClick={() => loadPerformance(false)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        <div className="mb-5 flex flex-wrap items-center gap-2">
          {ROLES.map((item) => (
            <button
              key={item.value}
              onClick={() => setRole(item.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                role === item.value
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-6" aria-label="Loading performance">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="h-28 animate-pulse rounded-2xl bg-slate-100" />
              ))}
            </div>
            <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
            <p className="py-4 text-center text-sm text-slate-400">
              Loading performance...
            </p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-10 text-center">
            <p className="text-base font-bold text-amber-800">{error}</p>
            <button
              onClick={() => loadPerformance(false)}
              className="mt-4 rounded-xl bg-amber-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-amber-800"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {config.days === 0 ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                  <StatCard
                    label="Employees"
                    value={summary.totalEmployees || 0}
                    icon="🧑‍💻"
                    color="blue"
                  />
                  <StatCard
                    label="Chief Editors"
                    value={summary.totalChiefEditors || 0}
                    icon="🗞️"
                    color="purple"
                  />
                  <StatCard
                    label="Submitted"
                    value={summary.reachedTarget || 0}
                    icon="✅"
                    color="emerald"
                  />
                  <StatCard
                    label="Approved"
                    value={summary.exceededTarget || 0}
                    icon="🚀"
                    color="slate"
                  />
                  <StatCard
                    label="Completed"
                    value={summary.inProgress || 0}
                    icon="⏳"
                    color="amber"
                  />
                  <StatCard
                    label="Not Started"
                    value={summary.needsAttention || 0}
                    icon="⚠️"
                    color="red"
                  />
                </div>

                <Section
                  title="Daily Performance"
                  subtitle="Summary for today (target: 3 per day)"
                >
                  <DailyTable people={sortedPeople} />
                </Section>
              </>
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  <StatCard
                    label="Total Completed"
                    value={summary.totalCompleted || 0}
                    icon="🧑‍💻"
                    color="blue"
                  />
                  <StatCard
                    label="Daily Average"
                    value={summary.averagePerDay || 0}
                    icon="📈"
                    color="emerald"
                  />
                  <StatCard
                    label="Average Rate"
                    value={`${summary.averageCompletionRate || 0}%`}
                    icon="🎯"
                    color="purple"
                  />
                  <StatCard
                    label="Employees Counted"
                    value={summary.countedUsers || 0}
                    icon="👥"
                    color="slate"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <StandoutCard
                    title="Top Performer"
                    person={summary.best}
                    tone="border-emerald-200 bg-emerald-50 text-emerald-900"
                  />
                  <StandoutCard
                    title="Lowest Performer"
                    person={summary.lowest}
                    tone="border-amber-200 bg-amber-50 text-amber-900"
                  />
                </div>

                <Section
                  title="Daily Summary"
                  subtitle={`Summary of all activity • ${rangeLabel}`}
                >
                  <TimeChart items={chartItems} />
                </Section>

                <Section
                  title="Employee Performance"
                  subtitle="Summary of all activity in this period"
                >
                  <ReportTable report={sortedReport} />
                </Section>
              </>
            )}

            <p className="text-center text-[11px] text-slate-400">
              All times are in Rwanda time (UTC+2)
              {refreshing ? " • refreshing…" : ""}
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
