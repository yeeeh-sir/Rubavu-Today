import React, {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  Loader2,
  X,
} from "lucide-react";

const ToastContext = createContext(null);

export function EmployeeUIProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback(({ type = "info", message }) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5200);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = {
    toast: {
      success: (message) => push({ type: "success", message }),
      error: (message) => push({ type: "error", message }),
      info: (message) => push({ type: "info", message }),
    },
    dismiss,
  };

  const toastStyles = {
    success: {
      icon: <CheckCircle2 className="h-[18px] w-[18px] shrink-0 text-emerald-500" />,
      classes: "border-emerald-200 bg-emerald-50 text-emerald-800",
    },
    error: {
      icon: <AlertCircle className="h-[18px] w-[18px] shrink-0 text-red-500" />,
      classes: "border-red-200 bg-red-50 text-red-800",
    },
    info: {
      icon: <Info className="h-[18px] w-[18px] shrink-0 text-sky-500" />,
      classes: "border-sky-200 bg-sky-50 text-sky-800",
    },
  };

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed right-4 top-4 z-[150] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2">
        {toasts.map((toast) => {
          const style = toastStyles[toast.type] || toastStyles.info;
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-2.5 rounded-xl border px-4 py-3 shadow-lg animate-slide-in ${style.classes}`}
            >
              {style.icon}
              <p className="min-w-0 flex-1 text-sm font-medium leading-5">{toast.message}</p>
              <button
                onClick={() => dismiss(toast.id)}
                className="shrink-0 opacity-60 transition hover:opacity-100"
                aria-label="Funga"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside EmployeeUIProvider");
  }
  return context.toast;
}

export function EmployeeStatusBadge({ status, size = "sm" }) {
  const normalized = String(status || "pending").toLowerCase();

  const config = {
    draft: { bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-400", label: "Draft" },
    pending: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", label: "Pending" },
    approved: { bg: "bg-sky-50", text: "text-sky-700", dot: "bg-sky-500", label: "Approved" },
    published: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", label: "Published" },
    rejected: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500", label: "Rejected" },
    active: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", label: "Active" },
  };

  const c = config[normalized] || config.pending;

  const sizeClasses = {
    xs: "px-1.5 py-0.5 text-[10px]",
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${c.bg} ${c.text} ${sizeClasses[size] || sizeClasses.sm}`}>
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

export function ConfirmModal({
  open,
  title = "Emeza igikorwa",
  description,
  confirmText = "Emeza",
  cancelText = "Reka",
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl animate-slide-up">
        <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${danger ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-600"}`}>
          {danger ? <AlertCircle className="h-6 w-6" /> : <Info className="h-6 w-6" />}
        </div>
        <h3 className="text-center text-lg font-bold text-slate-900">{title}</h3>
        {description && (
          <p className="mt-2 text-center text-sm leading-6 text-slate-500">{description}</p>
        )}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition disabled:opacity-50 ${danger ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {loading && <Loader2 className="mr-1.5 inline h-4 w-4 animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export function EmployeeStatCard({ label, value, icon, accent = "blue", hint }) {
  const accents = {
    blue: { iconBg: "bg-blue-50", iconText: "text-blue-600", ring: "hover:border-blue-200" },
    emerald: { iconBg: "bg-emerald-50", iconText: "text-emerald-600", ring: "hover:border-emerald-200" },
    amber: { iconBg: "bg-amber-50", iconText: "text-amber-600", ring: "hover:border-amber-200" },
    red: { iconBg: "bg-red-50", iconText: "text-red-600", ring: "hover:border-red-200" },
    purple: { iconBg: "bg-purple-50", iconText: "text-purple-600", ring: "hover:border-purple-200" },
    slate: { iconBg: "bg-slate-50", iconText: "text-slate-600", ring: "hover:border-slate-300" },
  };

  const a = accents[accent] || accents.blue;

  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition ${a.ring}`}>
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-black text-slate-900">{typeof value === "number" ? value.toLocaleString() : value}</p>
          {hint && <p className="mt-1.5 text-xs text-slate-400">{hint}</p>}
        </div>
        {icon && (
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${a.iconBg} ${a.iconText}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200/70 ${className}`} />;
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-3 h-7 w-16" />
        </div>
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
    </div>
  );
}