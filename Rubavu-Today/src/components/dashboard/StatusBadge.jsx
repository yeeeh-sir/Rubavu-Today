import React from "react";

function StatusBadge({ status, size = "sm" }) {
  const normalized = String(status || "pending").toLowerCase();

  const config = {
    approved: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
      label: "Approved",
    },
    pending: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      dot: "bg-amber-500",
      label: "Pending",
    },
    rejected: {
      bg: "bg-red-50",
      text: "text-red-700",
      dot: "bg-red-500",
      label: "Rejected",
    },
    active: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
      label: "Active",
    },
    inactive: {
      bg: "bg-slate-100",
      text: "text-slate-600",
      dot: "bg-slate-400",
      label: "Inactive",
    },
  };

  const c = config[normalized] || config.pending;

  const sizeClasses = {
    xs: "px-1.5 py-0.5 text-[10px]",
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${c.bg} ${c.text} ${sizeClasses[size] || sizeClasses.sm}`}>
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

export default StatusBadge;
