import React from "react";
import Sidebar from "./Sidebar";

function DashboardLayout({ children, navigationSections, roleLabel, onLogout }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar navigationSections={navigationSections} roleLabel={roleLabel} onLogout={onLogout} />
      <div className="min-w-0 flex-1">
        {children}
      </div>
    </div>
  );
}

export default DashboardLayout;
