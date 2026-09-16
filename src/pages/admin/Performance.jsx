import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminDailyPerformance, getAdminWeeklyPerformance, logout } from "../../services/api";
import { DashboardLayout, StatCard } from "../../components/dashboard";
import { ADMIN_NAV_SECTIONS } from "./adminNav";

const DAY_LABELS = ["Kumwe", "Mbere", "Kabiri", "Gatatu", "Kane", "Gatanu", "Gatandatu"];
const ROLE_LABELS = { all: "Bose", employee: "Abakozi", chief_editor: "Abanditsi Bakuru" };

const PERIODS = [
  { value: "current", label: "Icyumweru kiki" },
  { value: "previous", label: "Icyumweru gishize" },
  { value: "month", label: "Uku kwezi" },
  { value: "custom", label: "Custom" },
];

function toDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function mondayOf(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dow = (d.getDay() + 6) % 7;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - dow);
}

function sundayOf(date) {
  const monday = mondayOf(date);
  return new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);
}

function addDays(date, days) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function periodRange(period, from, to) {
  const today = new Date();
  if (period === "previous") {
    const end = sundayOf(addDays(today, -7));
    const start = addDays(mondayOf(addDays(today, -7)), -7);
    return { start: toDateStr(start), end: toDateStr(end) };
  }
  if (period === "month") {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    return { start: toDateStr(start), end: toDateStr(today) };
  }
  if (period === "custom") {
    if (from && to) return { start: from, end: to };
    return { start: null, end: null };
  }
  return { start: null, end: null };
}

function levelInfo(rate) {
  if (rate >= 100)
    return { label: "Excellent", cls: "bg-emerald-100 text-emerald-700" };
  if (rate >= 90)
    return { label: "Very Good", cls: "bg-blue-100 text-blue-700" };
  if (rate >= 75) return { label: "Good", cls: "bg-sky-100 text-sky-700" };
  if (rate >= 50)
    return { label: "Needs Improvement", cls: "bg-amber-100 text-amber-700" };
  return { label: "Low Performance", cls: "bg-red-100 text-red-700" };
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function formatRemaining(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function getStatusBadge(status) {
  const map = {
    "NOT STARTED": "bg-slate-100 text-slate-600",
    "IN PROGRESS": "bg-amber-100 text-amber-700",
    "TARGET COMPLETED": "bg-emerald-100 text-emerald-700",
    "TARGET EXCEEDED": "bg-blue-100 text-blue-700",
  };
  return map[status] || "bg-slate-100 text-slate-600";
}

function PerformanceBarChart({ days, dayTotals, max }) {
  const safeMax = Math.max(max, 1);
  return (
    <div className="flex items-end justify-between gap-2 overflow-x-auto pb-1">
      {days.map((day) => {
        const value = dayTotals[day.date] || 0;
        const height = Math.max(4, Math.round((value / safeMax) * 100));
        return (
          <div key={day.date} className="flex min-w-[34px] flex-1 flex-col items-center gap-1.5">
            <span className="text-xs font-bold text-slate-600">{value}</span>
            <div className="flex h-32 w-full max-w-[30px] items-end rounded-md bg-slate-100">
              <div
                className={`w-full rounded-md ${value >= 10 ? "bg-emerald-400" : "bg-blue-400"}`}
                style={{ height: `${Math.min(height, 100)}%` }}
              />
            </div>
            <span className="text-[10px] font-semibold text-slate-400">
              {DAY_LABELS[day.weekday] || day.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function Performance() {
  const navigate = useNavigate();
  const [role, setRole] = useState("all");
  const [period, setPeriod] = useState("current");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [data, setData] = useState(null);
  const [dailyData, setDailyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDaily, setLoadingDaily] = useState(true);
  const [error, setError] = useState("");
  const [nowMs, setNowMs] = useState(Date.now());
  const midnightRefreshLock = useRef(false);

  const loadDailyData = useCallback(async () => {
    try {
      setLoadingDaily(true);
      const payload = await getAdminDailyPerformance({ role });
      setDailyData(payload);
    } catch (err) {
      console.error("Failed to load admin daily performance:", err);
    } finally {
      setLoadingDaily(false);
    }
  }, [role]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const { start, end } = periodRange(period, from, to);
        const payload = await getAdminWeeklyPerformance({ role, start, end });
        if (active) {
          setData(payload);
          setError("");
        }
      } catch (err) {
        if (active) setError(err?.message || "Failed to load performance report.");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [role, period, from, to]);

  useEffect(() => {
    loadDailyData();
  }, [loadDailyData]);

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const serverTime = dailyData?.serverTime ? new Date(dailyData.serverTime).getTime() : Date.now();
  const serverOffset = serverTime - Date.now();
  const correctedNow = nowMs + serverOffset;
  const nextMidnightMs = dailyData?.nextMidnight ? new Date(dailyData.nextMidnight).getTime() : 0;
  const remainingMs = nextMidnightMs ? Math.max(0, nextMidnightMs - correctedNow) : 0;

  useEffect(() => {
    if (nextMidnightMs && remainingMs === 0 && !midnightRefreshLock.current) {
      midnightRefreshLock.current = true;
      loadDailyData();
      const resetTimer = window.setTimeout(() => {
        midnightRefreshLock.current = false;
      }, 2000);
      return () => window.clearTimeout(resetTimer);
    }
  }, [remainingMs, nextMidnightMs, loadDailyData]);

  const report = useMemo(() => data?.report || [], [data]);
  const days = data?.days || [];
  const dayTotals = data?.dayTotals || {};
  const summary = data?.summary || {};
  const liveSummary = dailyData?.summary || {};
  const livePeople = dailyData?.people || [];
  const maxDay = Math.max(1, ...Object.values(dayTotals).map(Number));

  const csv = useMemo(() => {
    const headers = ["Name", "Role", "Department", "Total", "Expected", "Completion Rate", "Reached Days", "Missed Days", "Extra"];
    const rows = report.map((row) => [
      row.name || "",
      ROLE_LABELS[row.roleType] || row.roleType || "",
      row.department || "",
      row.totals.completed,
      row.totals.expected,
      `${row.totals.completionRate}%`,
      row.totals.reachedDays,
      row.totals.missedDays,
      row.totals.extra,
    ]);
    return [headers, ...rows]
      .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
  }, [report]);

  const downloadCSV = () => {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "rubavu-today-performance.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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
            <h1 className="text-xl font-black text-slate-900 sm:text-2xl">Imikorere y'abakozi</h1>
            <p className="mt-0.5 text-sm text-slate-400">
              Ibipimo by' imirimo y'umunsi (inkuru 3) by'abakozi n'abanditsi bakuru.
            </p>
          </div>
          <button
            onClick={downloadCSV}
            className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-brand-200 transition hover:bg-brand-700"
          >
            📥 Kuramo raporo ya CSV
          </button>
        </div>

        <div className="mb-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-600">Umwanya</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500"
            >
              <option value="all">Bose</option>
              <option value="employee">Abakozi</option>
              <option value="chief_editor">Abanditsi Bakuru</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-600">Igihe</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500"
            >
              {PERIODS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          {period === "custom" && (
            <>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-600">Kuva (itariki)</label>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-600">Kugeza (itariki)</label>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500"
                />
              </div>
            </>
          )}
        </div>

        {!loadingDaily && dailyData && (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-black text-slate-900">LIVE Daily Performance</h2>
                <p className="text-xs text-slate-500">{dailyData?.range?.date || "Uyu munsi"} • Africa/Kigali</p>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
                <span>Time left: </span>
                <span className="font-mono text-slate-900">{formatRemaining(remainingMs)}</span>
              </div>
            </div>

            <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
              <StatCard label="Total Employees" value={liveSummary.totalEmployees || 0} icon="👥" color="blue" />
              <StatCard label="Total Chief Editors" value={liveSummary.totalChiefEditors || 0} icon="🧑‍💼" color="purple" />
              <StatCard label="Reached Target" value={liveSummary.reachedTarget || 0} icon="✅" color="emerald" />
              <StatCard label="Still In Progress" value={liveSummary.inProgress || 0} icon="⏳" color="amber" />
              <StatCard label="Exceeded Target" value={liveSummary.exceededTarget || 0} icon="🏆" color="blue" />
              <StatCard label="Requiring Attention" value={liveSummary.needsAttention || 0} icon="⚠️" color="red" />
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-bold">Name</th>
                      <th className="px-2 py-3 font-bold">Role</th>
                      <th className="px-2 py-3 text-center font-bold">Target</th>
                      <th className="px-2 py-3 text-center font-bold">Completed</th>
                      <th className="px-2 py-3 text-center font-bold">Remaining</th>
                      <th className="px-2 py-3 text-center font-bold">Extra</th>
                      <th className="px-2 py-3 text-center font-bold">Completion</th>
                      <th className="px-2 py-3 text-center font-bold">Status</th>
                      <th className="px-2 py-3 text-center font-bold">Time Left</th>
                    </tr>
                  </thead>
                  <tbody>
                    {livePeople.map((person) => (
                      <tr key={`${person.roleType}-${person.id}`} className="border-b border-slate-100 last:border-0">
                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-800">{person.name}</p>
                          <p className="text-xs text-slate-400">{person.email || "-"}</p>
                        </td>
                        <td className="px-2 py-3">
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                            {person.roleType === "chief_editor" ? "Chief Editor" : "Employee"}
                          </span>
                        </td>
                        <td className="px-2 py-3 text-center font-bold text-slate-800">{person.target}</td>
                        <td className="px-2 py-3 text-center font-bold text-slate-800">{person.completed}</td>
                        <td className="px-2 py-3 text-center text-slate-600">{person.remaining}</td>
                        <td className="px-2 py-3 text-center text-amber-600 font-bold">{person.extra}</td>
                        <td className="px-2 py-3 text-center">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${levelInfo(person.completionRate).cls}`}>
                            {person.completionRate}%
                          </span>
                        </td>
                        <td className="px-2 py-3 text-center">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${getStatusBadge(person.status)}`}>
                            {person.status}
                          </span>
                        </td>
                        <td className="px-2 py-3 text-center font-mono text-sm text-slate-700">
                          {formatRemaining(Math.max(0, (nextMidnightMs || 0) - correctedNow))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <p className="py-10 text-center text-sm text-slate-400">Birimo gutwara...</p>
        ) : error ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Inkuru zose zakorwa" value={summary.totalCompleted || 0} icon="📰" color="blue" />
              <StatCard label="Ipimo riri hagati" value={`${summary.averageCompletionRate || 0}%`} icon="📊" color="emerald" />
              <StatCard label="Uwarushishoza" value={summary.best?.name || "-"} icon="🏆" color="amber" />
              <StatCard label="Ukeneye kumenyeshwa" value={summary.lowest?.name || "-"} icon="📌" color="red" />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-black text-slate-900">
                  Inkuru zose zakorwa ku munsi
                </h2>
                <span className="text-xs text-slate-400">
                  {data?.range?.start} — {data?.range?.end}
                </span>
              </div>
              <PerformanceBarChart days={days} dayTotals={dayTotals} max={maxDay} />
              {report.length === 0 && (
                <p className="mt-4 text-center text-sm text-slate-400">
                  Nta muntu uri kwandikwa muri iki gihe.
                </p>
              )}
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-bold">Umukozi</th>
                      <th className="px-2 py-3 font-bold">Umwanya</th>
                      {days.map((day) => (
                        <th key={day.date} className="px-2 py-3 text-center font-bold">
                          {DAY_LABELS[day.weekday] || day.label}
                        </th>
                      ))}
                      <th className="px-2 py-3 text-center font-bold">Total</th>
                      <th className="px-2 py-3 text-center font-bold">Igenwa</th>
                      <th className="px-2 py-3 text-center font-bold">%</th>
                      <th className="px-2 py-3 text-center font-bold">Yarangijwe</th>
                      <th className="px-2 py-3 text-center font-bold">Izinjira</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.map((row) => {
                      const level = levelInfo(row.totals.completionRate);
                      const byDate = {};
                      for (const day of row.days) byDate[day.date] = day;
                      return (
                        <tr key={`${row.roleType}-${row.userId}`} className="border-b border-slate-100 last:border-0">
                          <td className="px-4 py-3">
                            <p className="font-bold text-slate-800">{row.name}</p>
                            <p className="text-xs text-slate-400">
                              {row.department || row.email}
                            </p>
                          </td>
                          <td className="px-2 py-3">
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                              {ROLE_LABELS[row.roleType] || row.roleType}
                            </span>
                          </td>
                          {days.map((day) => {
                            const rec = byDate[day.date];
                            return (
                              <td key={day.date} className="px-2 py-3 text-center">
                                <span
                                  className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${rec?.reached
                                    ? "bg-emerald-100 text-emerald-700"
                                    : rec && rec.completed > 0
                                      ? "bg-amber-100 text-amber-700"
                                      : "bg-slate-100 text-slate-400"
                                    }`}
                                >
                                  {rec?.completed || 0}
                                </span>
                              </td>
                            );
                          })}
                          <td className="px-2 py-3 text-center font-black text-slate-800">{row.totals.completed}</td>
                          <td className="px-2 py-3 text-center text-slate-500">{row.totals.expected}</td>
                          <td className="px-2 py-3 text-center">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${level.cls}`}>
                              {row.totals.completionRate}%
                            </span>
                          </td>
                          <td className="px-2 py-3 text-center text-slate-600">
                            {row.totals.reachedDays} / {row.totals.missedDays}
                          </td>
                          <td className="px-2 py-3 text-center font-bold text-amber-600">{row.totals.extra}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Performance;