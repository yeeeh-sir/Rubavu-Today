import React from "react";
import Sidebar from "./Sidebar";

function DashboardLayout({ children, navigationSections, roleLabel, onLogout }) {
  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900">
      <Sidebar navigationSections={navigationSections} roleLabel={roleLabel} onLogout={onLogout} />
      <div className="min-w-0 flex-1 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_38%)]">
        <div className="min-h-full bg-white/30 backdrop-blur-[1px]">{children}</div>
      </div>
    </div>
  );
}

export default DashboardLayout;
