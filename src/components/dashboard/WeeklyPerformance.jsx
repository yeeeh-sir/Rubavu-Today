import React, { useEffect, useState } from "react";
import { TrendingUp, Award, AlertTriangle } from "lucide-react";
import { getMyPerformance } from "../../services/api";

const SHORT_LABELS = ["Kumwe", "Mbere", "Kabiri", "Gatatu", "Kane", "Gatanu", "Gatandatu"];

export default function WeeklyPerformance() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const report = await getMyPerformance();
        if (active) setData(report);
      } catch (err) {
        if (active) setError(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
        Icyumweru impamvu yagwaye gupakururwa.
      </div>
    );
  }

  if (!data) {
    return (
      <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2">
        <div className="h-28 animate-pulse rounded-2xl bg-slate-100" />
        <div className="h-28 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }

  const totals = data.totals || {};
  const days = Array.isArray(data.days) ? data.days : [];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">
              Imikorere muri iki cyumweru
            </h3>
            <p className="text-xs text-slate-400">
              {data.range?.start} — {data.range?.end}
            </p>
          </div>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${totals.completionRate >= 100
            ? "bg-emerald-100 text-emerald-700"
            : totals.completionRate >= 75
              ? "bg-blue-100 text-blue-700"
              : "bg-amber-100 text-amber-700"
            }`}
        >
          {totals.completionRate}%
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Zahereranwe</p>
          <p className="mt-1 text-lg font-black text-slate-900">{totals.expected}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Zakorwa</p>
          <p className="mt-1 text-lg font-black text-slate-900">{totals.completed}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Iminsi yarangijwe</p>
          <p className="mt-1 text-lg font-black text-emerald-600">{totals.reachedDays}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Iminsi usigaye</p>
          <p className="mt-1 text-lg font-black text-amber-600">{totals.missedDays}</p>
        </div>
      </div>

      {days.length > 0 && (
        <div className="mt-6">
          <div className="flex items-end justify-between gap-2">
            {days.map((day) => {
              const value = Number(day.completed) || 0;
              const isFuture = day.isFuture;
              const height = Math.min(100, (value / 3) * 100);
              return (
                <div key={day.date} className="flex flex-1 flex-col items-center gap-1.5">
                  <span className={`text-xs font-bold ${day.reached ? "text-emerald-600" : "text-slate-400"}`}>
                    {value}
                  </span>
                  <div className="flex h-24 w-full max-w-[26px] items-end rounded-md bg-slate-100">
                    <div
                      className={`w-full rounded-md ${day.reached
                        ? "bg-emerald-400"
                        : isFuture
                          ? "bg-slate-200"
                          : value > 0
                            ? "bg-amber-400"
                            : "bg-slate-200"
                        }`}
                      style={{ height: `${isFuture ? 6 : Math.max(height, 6)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400">
                    {SHORT_LABELS[day.weekday] || day.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {data.bestDay && (
          <div className="flex items-center gap-2.5 rounded-2xl bg-emerald-50 p-3">
            <Award className="h-4 w-4 shrink-0 text-emerald-600" />
            <p className="text-xs text-emerald-800">
              <span className="font-bold">Umunsi mwiza:</span> {data.bestDay.date} — {data.bestDay.completed} inkuru
            </p>
          </div>
        )}
        {data.lowestDay && (
          <div className="flex items-center gap-2.5 rounded-2xl bg-amber-50 p-3">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
            <p className="text-xs text-amber-800">
              <span className="font-bold">Umunsi ureba hasi:</span> {data.lowestDay.date} — {data.lowestDay.completed} inkuru
            </p>
          </div>
        )}
      </div>
    </div>
  );
}