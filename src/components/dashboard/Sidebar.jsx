import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../Rubavu.jpeg";

const SIDEBAR_WIDTH_EXPANDED = 260;
const SIDEBAR_WIDTH_COLLAPSED = 72;

function Sidebar({ navigationSections, roleLabel, collapsed: controlledCollapsed, onToggleCollapse, onLogout }) {
  const { user } = useAuth();
  const location = useLocation();
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const collapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;
  const toggleCollapse = onToggleCollapse || (() => setInternalCollapsed((p) => !p));

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const userName = user?.full_name || user?.name || user?.email || "User";
  const userInitial = userName.charAt(0).toUpperCase();
  const userRole = user?.role || "employee";

  const profilePath =
    userRole === "admin" ? "/admin/profile" :
    userRole === "chief_editor" ? "/chief-editor/profile" :
    "/employee/profile";

  const sidebarWidth = collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;

  const SidebarContent = ({ isMobile = false }) => (
    <div className="flex h-full flex-col bg-slate-950 text-white">
      <div className={`flex shrink-0 items-center gap-3 border-b border-white/5 ${collapsed && !isMobile ? "justify-center px-2 py-4" : "px-4 py-4"}`}>
        <img
          src={logo}
          alt="Rubavu Today"
          className={`shrink-0 rounded-lg object-cover ring-1 ring-white/10 transition-all ${collapsed && !isMobile ? "h-9 w-9" : "h-9 w-9"}`}
        />
        {(!collapsed || isMobile) && (
          <div className="min-w-0 flex-1 animate-fade-in">
            <h1 className="truncate text-sm font-bold text-white">Rubavu Today</h1>
            <p className="truncate text-[10px] font-medium text-slate-400">{roleLabel}</p>
          </div>
        )}
        {!isMobile && (
          <button
            onClick={toggleCollapse}
            className="hidden lg:flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-white/10 hover:text-white"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg className={`h-4 w-4 transition-transform ${collapsed ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        {isMobile && (
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-md p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
            aria-label="Close menu"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-2.5 py-3 scrollbar-thin">
        {navigationSections.map((section, sIdx) => (
          <div key={sIdx} className="mb-1">
            {section.label && (!collapsed || isMobile) && (
              <p className="mb-1.5 px-2.5 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                {section.label}
              </p>
            )}
            {section.label && collapsed && !isMobile && (
              <div className="mx-auto my-3 h-px w-6 bg-white/10" />
            )}
            {section.items.map((item) => {
              const isActive = item.path ? location.pathname === item.path || location.pathname.startsWith(item.path + "/") : false;
              return (
                <NavLink
                  key={item.path || item.label}
                  to={item.path}
                  onClick={() => { if (isMobile) setMobileOpen(false); if (item.onClick) item.onClick(); }}
                  title={collapsed && !isMobile ? item.label : undefined}
                  className={`mb-0.5 flex items-center gap-2.5 rounded-lg text-sm font-medium transition ${
                    collapsed && !isMobile ? "justify-center px-2 py-2.5" : "px-3 py-2.5"
                  } ${
                    isActive
                      ? "bg-brand-600 text-white shadow-sm"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center ${isActive ? "text-white" : "text-slate-400"}`}>
                    {item.icon}
                  </span>
                  {(!collapsed || isMobile) && (
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  )}
                  {(!collapsed || isMobile) && item.badge !== undefined && item.badge !== null && (
                    <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      isActive ? "bg-white/20 text-white" : "bg-white/5 text-slate-400"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {collapsed && !isMobile && item.badge !== undefined && item.badge !== null && (
                    <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-amber-400" />
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      <div className={`shrink-0 border-t border-white/5 p-3 ${collapsed && !isMobile ? "px-2" : ""}`}>
        <NavLink
          to={profilePath}
          onClick={() => { if (isMobile) setMobileOpen(false); }}
          className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white ${collapsed && !isMobile ? "justify-center px-2" : ""}`}
          title={collapsed && !isMobile ? "Profile" : undefined}
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
            {userInitial}
          </div>
          {(!collapsed || isMobile) && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">{userName}</p>
              <p className="truncate text-[10px] text-slate-500">{roleLabel}</p>
            </div>
          )}
        </NavLink>
        {onLogout && (
          <button
            onClick={() => { if (isMobile) setMobileOpen(false); onLogout(); }}
            className={`mt-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-red-500/10 hover:text-red-400 ${collapsed && !isMobile ? "justify-center px-2" : ""}`}
            title={collapsed && !isMobile ? "Sohoka" : undefined}
          >
            <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {(!collapsed || isMobile) && <span>Sohoka</span>}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-3.5 z-40 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-white shadow-lg lg:hidden"
        aria-label="Open navigation"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ width: window.innerWidth >= 1024 ? sidebarWidth : "min(280px, 85vw)" }}
      >
        <SidebarContent isMobile={mobileOpen && window.innerWidth < 1024} />
      </aside>

      <div className="hidden lg:block shrink-0" style={{ width: sidebarWidth }} />
    </>
  );
}

export default Sidebar;
