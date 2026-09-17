import React, { useCallback, useEffect, useState } from "react";
import { getAdminVisitorAnalytics } from "../../services/api";

const RANGES = [
    { value: "today", label: "Uyu munsi" },
    { value: "yesterday", label: "Ejo" },
    { value: "last7", label: "Iminsi 7 ishize" },
    { value: "last30", label: "Iminsi 30 ishize" },
    { value: "last90", label: "Iminsi 90 ishize" },
];

function Stat({ icon, label, value }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold text-slate-500">{icon} {label}</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{value === null ? "-" : Number(value || 0).toLocaleString()}</p>
            <p className="mt-1 text-[11px] text-slate-400">GA4 active users</p>
        </div>
    );
}

function formatChartDate(value) {
    const raw = String(value || "");
    if (/^\d{8}$/.test(raw)) return `${raw.slice(4, 6)}/${raw.slice(6, 8)}`;
    return raw.slice(5);
}

export default function VisitorAnalytics() {
    const [preset, setPreset] = useState("today");
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            setData(await getAdminVisitorAnalytics(preset));
        } catch (err) {
            setData(null);
            console.error("Google Analytics request failed:", {
                status: err?.status,
                code: err?.response?.data?.code,
                diagnostic: err?.response?.data?.diagnostic,
                message: err?.message,
            });
            setError(err?.message || "Google Analytics ntiboneka ubu.");
        } finally {
            setLoading(false);
        }
    }, [preset]);

    useEffect(() => { load(); }, [load]);

    const daily = data?.dailyVisitors || [];
    const maxVisitors = Math.max(1, ...daily.map((item) => Number(item.visitors) || 0));

    return (
        <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h2 className="text-lg font-black text-slate-900">👥 Abasura Urubuga</h2>
                    <p className="mt-1 text-sm text-slate-500">Imibare y'abasuye Rubavu Today</p>
                    {data && <p className="mt-1 text-[11px] text-slate-400">GA4 active users • {data.timeZone} • {data.startDate} — {data.endDate}</p>}
                </div>
                <div className="flex gap-2">
                    <select value={preset} onChange={(event) => setPreset(event.target.value)} className="form-select min-w-0 sm:w-44" aria-label="Analytics date range">
                        {RANGES.map((range) => <option key={range.value} value={range.value}>{range.label}</option>)}
                    </select>
                    <button type="button" onClick={load} className="btn-secondary shrink-0 px-3" disabled={loading} aria-label="Refresh analytics">↻</button>
                </div>
            </div>

            {loading ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Loading analytics">
                    {[1, 2, 3, 4].map((item) => <div key={item} className="h-28 animate-pulse rounded-2xl bg-slate-100" />)}
                </div>
            ) : error ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    <p className="font-bold">{error}</p>
                    <button type="button" onClick={load} className="mt-3 rounded-lg bg-amber-700 px-3 py-2 text-xs font-bold text-white">Ongera ugerageze</button>
                </div>
            ) : (
                <>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <Stat icon="👥" label="Abasura uyu munsi" value={data.visitorsToday} />
                        <Stat icon="📅" label="Abasura muri iki cyumweru" value={data.visitorsThisWeek} />
                        <Stat icon="📆" label="Abasura muri uku kwezi" value={data.visitorsThisMonth} />
                        <Stat icon="📊" label="Impuzandengo y'abasura ku munsi" value={data.averageVisitorsPerDay} />
                    </div>
                    <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <h3 className="text-sm font-black text-slate-900">Abasura buri munsi</h3>
                        {daily.length === 0 ? (
                            <p className="py-10 text-center text-sm text-slate-500">Nta mibare ya GA4 ibonetse muri iki gihe.</p>
                        ) : (
                            <div className="mt-4 flex h-48 items-end gap-1 overflow-x-auto pb-6" role="img" aria-label="Daily GA4 active users chart">
                                {daily.map((item) => {
                                    const height = Math.max(4, Math.round((item.visitors / maxVisitors) * 100));
                                    return <div key={item.date} className="group flex h-full min-w-7 flex-1 flex-col justify-end" title={`${formatChartDate(item.date)}: ${item.visitors.toLocaleString()} active users`}><div className="rounded-t-md bg-brand-500 transition group-hover:bg-brand-700" style={{ height: `${height}%` }} /><span className="mt-2 -rotate-45 origin-top-left whitespace-nowrap text-[9px] text-slate-500">{formatChartDate(item.date)}</span></div>;
                                })}
                            </div>
                        )}
                    </div>
                </>
            )}
        </section>
    );
}
