import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  UserRound,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationsContext";
import { getProfileImageUrl } from "../../services/api";
import logo from "../../Rubavu.jpeg";

const TITLE_MAP = [
  { path: "/employee/dashboard", title: "Imbonerahamwe y'Umukozi" },
  { path: "/employee/create", title: "Kora Inkuru" },
  { path: "/employee/articles", title: "Inkuru Zanjye" },
  { path: "/employee/media", title: "Amafoto" },
  { path: "/employee/notifications", title: "Amanotisi" },
  { path: "/employee/statistics", title: "Imibare y'ubwanditsi" },
  { path: "/employee/profile", title: "Umwirondoro" },
];

function getPageTitle(pathname) {
  const match = TITLE_MAP.find((entry) => pathname.startsWith(entry.path));
  return match ? match.title : "Imbonerahamwe y'Umukozi";
}

export default function EmployeeNavbar({ onOpenSidebar, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();

  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const userName = user?.full_name || user?.name || user?.email || "Umukozi";
  const userInitial = String(userName).charAt(0).toUpperCase();
  const profileImage = getProfileImageUrl(user);

  const submitSearch = (e) => {
    e.preventDefault();
    const term = search.trim();
    navigate(term ? `/employee/articles?q=${encodeURIComponent(term)}` : "/employee/articles");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <button
          onClick={onOpenSidebar}
          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 lg:hidden"
          aria-label="Fungura sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link to="/employee/dashboard" className="flex shrink-0 items-center gap-2.5">
          <img src={logo} alt="Rubavu Today" className="h-9 w-9 rounded-lg object-cover ring-1 ring-slate-200" />
          <span className="hidden text-sm font-black uppercase tracking-wide text-slate-900 sm:block">Rubavu Today</span>
        </Link>

        <div className="mx-2 hidden h-7 w-px bg-slate-200 sm:block" />

        <h1 className="hidden truncate text-base font-bold text-slate-800 sm:block">{getPageTitle(location.pathname)}</h1>

        <form onSubmit={submitSearch} className="ml-auto hidden min-w-0 flex-1 justify-end md:flex md:max-w-xs">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Shakisha inkuru..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-2 md:ml-2">
          <form onSubmit={submitSearch} className="md:hidden">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Shakisha..."
                className="w-28 rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500 sm:w-40"
              />
            </div>
          </form>

          <Link
            to="/employee/notifications"
            className="relative rounded-xl p-2 text-slate-500 transition hover:bg-slate-100"
            aria-label="Amanotisi"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-black text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-slate-100"
            >
              {profileImage ? (
                <img src={profileImage} alt={userName} className="h-8 w-8 rounded-full object-cover ring-2 ring-blue-600" />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">
                  {userInitial}
                </span>
              )}
              <span className="hidden max-w-28 truncate text-sm font-semibold text-slate-700 lg:block">{userName}</span>
              <ChevronDown className={`hidden h-4 w-4 text-slate-400 transition lg:block ${menuOpen ? "rotate-180" : ""}`} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 max-h-[calc(100dvh-4rem)] w-56 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl animate-slide-up">
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="truncate text-sm font-bold text-slate-900">{userName}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{user?.email || "umukozi@rubavutoday.com"}</p>
                </div>
                <Link
                  to="/employee/profile"
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <UserRound className="h-4 w-4 text-slate-400" />
                  Umwirondoro
                </Link>
                <button
                  onClick={onLogout}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sohoka
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}