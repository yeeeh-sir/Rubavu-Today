import React from "react";
import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Bell,
  FileText,
  Images,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  PenSquare,
  UserRound,
  X,
} from "lucide-react";
import { useNotifications } from "../../context/NotificationsContext";
import logo from "../../Rubavu.jpeg";

const NAV_ITEMS = [
  { to: "/employee/dashboard", label: "Imbonerahamwe", icon: LayoutDashboard },
  { to: "/employee/create", label: "Kora Inkuru", icon: PenSquare },
  { to: "/employee/articles", label: "Inkuru Zanjye", icon: FileText },
  { to: "/employee/media", label: "Amafoto", icon: Images },
  { to: "/employee/notifications", label: "Amanotisi", icon: Bell, unread: true },
  { to: "/employee/statistics", label: "Imibare", icon: BarChart3 },
  { to: "/employee/profile", label: "Umwirondoro", icon: UserRound },
];

export default function EmployeeSidebar({ mobileOpen, onClose, onLogout }) {
  const { unreadCount } = useNotifications();

  const content = (
    <div className="flex h-full flex-col bg-slate-950 text-white">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-5">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Rubavu Today" className="h-10 w-10 rounded-xl object-cover ring-2 ring-white/10" />
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-white">Rubavu Today</p>
            <p className="text-[11px] font-medium text-slate-400">Umukozi Portal</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden"
          aria-label="Funga menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Imibare y'umwuga</p>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-950/40"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.unread && unreadCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-black text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-400 transition hover:bg-white/5 hover:text-white"
        >
          <LifeBuoy className="h-[18px] w-[18px] shrink-0" />
          Ubufasha & Inkunga
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-400 transition hover:bg-red-500/15 hover:text-red-400"
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          Sohoka
        </button>
      </div>
    </div>
  );

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-slate-950 transition-transform duration-300 lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {content}
      </aside>
    </>
  );
}