import React from "react";

function StatCard({ label, value, icon, color = "blue", change, changeLabel }) {
  const colorMap = {
    blue: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100" },
    amber: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100" },
    red: { bg: "bg-red-50", text: "text-red-600", border: "border-red-100" },
    purple: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-100" },
    slate: { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-100" },
  };

  const c = colorMap[color] || colorMap.blue;

  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {change !== undefined && (
            <div className="mt-2 flex items-center gap-1.5">
              <span className={`text-xs font-semibold ${Number(change) >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                {Number(change) >= 0 ? "+" : ""}{change}%
              </span>
              {changeLabel && (
                <span className="text-xs text-slate-400">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${c.bg} ${c.text}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

export default StatCard;
