import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Clock, Target, CheckCircle2, CalendarClock } from "lucide-react";
import { getDailyTaskState } from "../../services/api";

const pad = (n) => String(n).padStart(2, "0");

function formatRemaining(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function skeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="h-40 animate-pulse rounded-3xl bg-slate-100" />
      <div className="h-40 animate-pulse rounded-3xl bg-slate-100" />
    </div>
  );
}

export default function DailyTaskCard({ writePath = "/employee/create" }) {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(true);
  const [now, setNow] = useState(Date.now());
  const expiredFor = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const load = useCallback(async (silent) => {
    if (!silent) setLoading(true);
    try {
      const data = await getDailyTaskState();
      setState(data);
      if (data?.newlyCompleted && data?.cycle?.id) {
        const key = `rt_daily_popup_${data.cycle.id}`;
        if (!sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, "1");
          setShowPopup(true);
        }
      }
    } catch (err) {
      console.error("Failed to load daily task state:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(false);
  }, [load]);

  const cycleId = state?.cycle?.id;
  useEffect(() => {
    if (cycleId != null) {
      setBannerDismissed(!!sessionStorage.getItem(`rt_daily_banner_${cycleId}`));
    }
  }, [cycleId]);

  const dismissBanner = useCallback(() => {
    if (cycleId != null) {
      sessionStorage.setItem(`rt_daily_banner_${cycleId}`, "1");
      setBannerDismissed(true);
    }
  }, [cycleId]);

  const serverOffset = state?.serverTime
    ? new Date(state.serverTime).getTime() - Date.now()
    : 0;
  const adjustedNow = now + serverOffset;
  const endMs = state?.cycle?.end ? new Date(state.cycle.end).getTime() : 0;
  const remainingMs = Math.max(0, endMs - adjustedNow);

  useEffect(() => {
    if (remainingMs === 0 && endMs !== 0 && expiredFor.current !== endMs) {
      expiredFor.current = endMs;
      load(true);
    }
  }, [remainingMs, endMs, load]);

  if (loading && !state) return skeleton();

  if (!state) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
        Igikorwa cy'umunsi nticyabasha gupakurwa.
      </div>
    );
  }

  const { cycle, tasks } = state;
  const completed = Number(cycle?.completed) || 0;
  const target = Number(cycle?.target) || 3;
  const remaining = Math.max(0, target - completed);
  const progress = target > 0 ? Math.min(100, Math.round((completed / target) * 100)) : 0;
  const done = completed >= target;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-800 p-6 text-white shadow-lg">
      <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl" />

      {done && !bannerDismissed && (
        <div className="relative mb-4">
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-500/20 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-300" />
              <div>
                <p className="text-sm font-bold text-emerald-200">Igikorwa cy'umunsi cyarangijwe!</p>
                <p className="text-xs text-emerald-300/80">
                  Murakoze gukora inkuru {completed} muri iki gihe.
                </p>
              </div>
            </div>
            <button
              onClick={dismissBanner}
              className="rounded-lg px-2 py-1 text-xs font-semibold text-emerald-200 hover:bg-white/10"
            >
              Reka
            </button>
          </div>
        </div>
      )}

      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-9 w-9 text-emerald-600" />
            </div>
            <h3 className="text-lg font-black text-slate-900">
              Igikorwa cy'umunsi cyarangijwe!
            </h3>
            <p className="mt-1.5 text-sm leading-6 text-slate-500">
              Murakoze! Murangije igikorwa cy'umunsi. Komeza igikorwa kiri imbere.
            </p>
            <button
              onClick={() => setShowPopup(false)}
              className="mt-5 w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800"
            >
              Niboneye
            </button>
          </div>
        </div>
      )}

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-2xl">
            <Target className="h-7 w-7 text-emerald-300" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-200">
              Igikorwa cy'umunsi
            </p>
            <h3 className="mt-1 text-xl font-black sm:text-2xl">
              Inkuru {target} kuri 24h
            </h3>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-blue-100">
              <CalendarClock className="h-3.5 w-3.5" />
              {cycle?.startDay} — {cycle?.endDay}
            </p>
          </div>
        </div>

        <div className="w-full lg:w-auto">
          <div className="flex items-center gap-2 text-sm text-blue-100">
            <Clock className="h-4 w-4" />
            <span>Isaha isigaye:</span>
            <span className="font-mono text-2xl font-black tabular-nums text-white">
              {formatRemaining(remainingMs)}
            </span>
          </div>
        </div>
      </div>

      <div className="relative mt-6">
        <div className="mb-2 flex items-center justify-between text-xs text-blue-100">
          <span>
            Zikorewe: {completed} / {target}
          </span>
          <span className="font-bold text-white">{Math.min(progress, 100)}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-white/15">
          <div
            className={`h-full rounded-full transition-all duration-700 ${done ? "bg-emerald-400" : "bg-gradient-to-r from-sky-400 to-blue-400"
              }`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      <div className="relative mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl bg-white/10 p-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-blue-200">Igenwa</p>
          <p className="mt-1 text-lg font-black">{target}</p>
        </div>
        <div className="rounded-2xl bg-white/10 p-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-blue-200">Zakorewe</p>
          <p className={`mt-1 text-lg font-black ${done ? "text-emerald-300" : ""}`}>{completed}</p>
        </div>
        <div className="rounded-2xl bg-white/10 p-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-blue-200">Zasigaye</p>
          <p className="mt-1 text-lg font-black">{remaining}</p>
        </div>
        <div className="rounded-2xl bg-white/10 p-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-blue-200">Izinjira</p>
          <p className={`mt-1 text-lg font-black ${Number(cycle?.extra) > 0 ? "text-amber-300" : "text-slate-300"}`}>
            {Number(cycle?.extra) || 0}
          </p>
        </div>
      </div>

      {tasks && tasks.length > 0 && (
        <div className="relative mt-5 rounded-2xl bg-white/10 p-4">
          <p className="text-xs font-black uppercase tracking-wide text-blue-200">
            Ibikorwa by'uyu munsi
          </p>
          <ul className="mt-2 space-y-2">
            {tasks.map((task) => (
              <li key={task.key} className="flex items-center gap-2.5">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${task.status === "completed"
                      ? "bg-emerald-400 text-emerald-950"
                      : "bg-white/15 text-blue-100"
                    }`}
                >
                  {task.status === "completed" ? "\u2713" : "\u2022"}
                </span>
                <span className={`text-sm ${task.status === "completed" ? "text-emerald-200 line-through" : "text-white"}`}>
                  {task.title}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="relative mt-5">
        <Link
          to={writePath}
          className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-blue-50"
        >
          Andika inkuru
          <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  );
}