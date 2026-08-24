import React from "react";
import { NavLink } from "react-router-dom";
import rubavuLogo from "../../Rubavu.jpeg";

function Sidebar({ isOpen, onClose }) {
  const links = [
    { path: "/employee/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/employee/workspace", label: "Workspace", icon: "👥" },
    { path: "/employee/profile", label: "Profile", icon: "👤" },
  ];

  return (
    <>
      
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white min-h-screen md:min-h-[calc(100vh-64px)] p-4 flex flex-col transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static font-serif ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        
        <div className="flex items-center justify-between md:hidden pb-4 mb-2 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <img src={rubavuLogo} alt="Rubavu Logo" className="w-7 h-7 rounded-lg object-cover" />
            <span className="text-sm font-bold tracking-wider text-slate-400 uppercase font-sans">Navigation</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close Sidebar"
          >
            ✕
          </button>
        </div>

        
        <nav className="space-y-1.5 flex-1 font-sans">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition font-semibold text-sm ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <span className="text-base">{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;