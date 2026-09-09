import React, { useCallback, useEffect, useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  ClipboardList,
  Loader2,
  MessageSquare,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../../services/api";
import { useNotifications } from "../../context/NotificationsContext";
import { EmployeeStatusBadge } from "../../components/employee/EmployeeUI";
import { CardSkeleton } from "../../components/employee/EmployeeUI";
import { useToast } from "../../components/employee/EmployeeUI";
import { errorMessage } from "./employeeHelpers";

const TYPE_META = {
  submitted: { icon: ClipboardList, bg: "bg-amber-100 text-amber-600" },
  approved: { icon: ThumbsUp, bg: "bg-emerald-100 text-emerald-600" },
  rejected: { icon: ThumbsDown, bg: "bg-red-100 text-red-600" },
  feedback: { icon: MessageSquare, bg: "bg-sky-100 text-sky-600" },
};

function typeLabel(type) {
  const map = {
    submitted: "Yatanzwe",
    approved: "Yemejwe",
    rejected: "Yanzwe",
    feedback: "Igitekerezo",
  };
  return map[type] || "Amanotisi";
}

export default function EmployeeNotifications() {
  const { refresh, setCount } = useNotifications();
  const toast = useToast();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [markingAll, setMarkingAll] = useState(false);
  const [readIds, setReadIds] = useState(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
      const unread = Array.isArray(data)
        ? data.filter((n) => !n.read_flag).length
        : 0;
      setCount(unread);
    } catch (err) {
      setError(errorMessage(err, "Ntanabonye guheruka amanotisi."));
    } finally {
      setLoading(false);
    }
  }, [setCount]);

  useEffect(() => {
    load();
  }, [load]);

  const markRead = async (id) => {
    if (readIds.has(id)) return;
    setReadIds((prev) => new Set(prev).add(id));
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read_flag: 1 } : n))
    );
    refresh();
    try {
      await markNotificationRead(id);
    } catch (err) {
      // silent - count refresh will resolve it
    }
  };

  const markAll = async () => {
    if (markingAll) return;
    setMarkingAll(true);
    setNotifications((prev) => prev.map((n) => ({ ...n, read_flag: 1 })));
    setCount(0);
    try {
      await markAllNotificationsRead();
    } catch (err) {
      toast.error(errorMessage(err, "Ntanabonye gushyira byose nk'ibisowe."));
    } finally {
      setMarkingAll(false);
    }
  };

  const filtered = filter === "unread"
    ? notifications.filter((n) => !n.read_flag)
    : notifications;

  const unreadCount = notifications.filter((n) => !n.read_flag).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Amanotisi</h2>
          <p className="text-sm text-slate-500">
            {unreadCount > 0
              ? `${unreadCount} udasomwe`
              : "Nta manotisi adasomwe"}
          </p>
        </div>
        <button
          onClick={markAll}
          disabled={markingAll || unreadCount === 0}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {markingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCheck className="h-4 w-4" />}
          Soma zose
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {[
          { value: "all", label: `Zose (${notifications.length})` },
          { value: "unread", label: `Zidasomwe (${unreadCount})` },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              filter === tab.value
                ? "bg-blue-600 text-white shadow-sm"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3, 4, 5].map((i) => <CardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <Bell className="h-10 w-10 text-slate-300" />
          <h3 className="mt-4 text-base font-semibold text-slate-800">Nta manotisi</h3>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            {filter === "unread"
              ? "Wafashe neza — amanotisi yose yaragiye asomwa."
              : "Amanotisi yawe azagaragara hano iyo inkuru yawe igera ku mubikorwa mumihanda."}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((n) => {
            const meta = TYPE_META[n.type] || TYPE_META.feedback;
            const Icon = meta.icon;
            const isUnread = !n.read_flag;
            return (
              <div
                key={n.id}
                onClick={() => markRead(n.id)}
                className={`cursor-pointer rounded-2xl border bg-white p-4 transition hover:shadow-sm ${
                  isUnread ? "border-blue-200 ring-1 ring-blue-100" : "border-slate-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${meta.bg}`}>
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${meta.bg}`}>
                        {typeLabel(n.type)}
                      </span>
                      {isUnread && (
                        <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Nshya
                        </span>
                      )}
                      <span className="ml-auto text-[11px] text-slate-400">{formatTime(n.created_at)}</span>
                    </div>
                    <h3 className="mt-1.5 text-sm font-bold text-slate-900">{n.title}</h3>
                    {n.message && <p className="mt-1 text-sm leading-6 text-slate-600">{n.message}</p>}
                    {n.post_id && (
                      <div className="mt-2.5 flex flex-wrap items-center gap-2">
                        <EmployeeStatusBadge
                          status={n.type === "approved" ? "approved" : n.type === "rejected" ? "rejected" : "pending"}
                          size="xs"
                        />
                        <Link
                          to={`/employee/articles?highlight=${n.post_id}`}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700"
                        >
                          Reba inkuru <span className="text-blue-400">→</span>
                        </Link>
                      </div>
                    )}
                  </div>
                  {isUnread && (
                    <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                      <Check className="h-2.5 w-2.5" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatTime(value) {
  const date = value ? new Date(value) : null;
  return date && !isNaN(date.getTime())
    ? date.toLocaleString("rw-RW", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";
}