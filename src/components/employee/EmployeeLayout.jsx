import React, { useState } from "react";
import { NotificationsProvider } from "../../context/NotificationsContext";
import { EmployeeUIProvider } from "./EmployeeUI";
import EmployeeNavbar from "./EmployeeNavbar";
import EmployeeSidebar from "./EmployeeSidebar";

export default function EmployeeLayout({ children, onLogout }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    setMobileOpen(false);
    if (onLogout) onLogout();
  };

  return (
    <NotificationsProvider>
      <EmployeeUIProvider>
        <div className="flex min-h-screen bg-slate-100 text-slate-900">
          <EmployeeSidebar
            mobileOpen={mobileOpen}
            onClose={() => setMobileOpen(false)}
            onLogout={handleLogout}
          />
          <div className="flex min-w-0 flex-1 flex-col">
            <EmployeeNavbar
              onOpenSidebar={() => setMobileOpen(true)}
              onLogout={handleLogout}
            />
            <main className="min-w-0 flex-1 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.1),_transparent_40%)]">
              <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</div>
            </main>
          </div>
        </div>
      </EmployeeUIProvider>
    </NotificationsProvider>
  );
}