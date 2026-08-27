import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import rubavuLogo from "../../Rubavu.jpeg";

function Navbar() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/employee/login");
  };

  const closeMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-blue-700 text-white shadow-lg relative z-50 font-serif">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">

        <div>
          <Link
            to="/employee/dashboard"
            className="text-xl sm:text-2xl font-bold tracking-tight hover:text-blue-100 transition flex items-center gap-2.5 font-sans"
          >
            <img src={rubavuLogo} alt="Rubavu Logo" className="w-8 h-8 rounded-lg object-cover" />
            <span>Imbonerahamwe y'umukozi</span>
          </Link>
        </div>


        <div className="hidden md:flex items-center gap-6 font-sans">
          <Link
            to="/employee/dashboard"
            className="text-sm font-medium hover:text-yellow-300 transition"
          >
            Imbonerahamwe
          </Link>

          <Link
            to="/employee/workspace"
            className="text-sm font-medium hover:text-yellow-300 transition"
          >
            Inkuru
          </Link>

          <Link
            to="/employee/profile"
            className="text-sm font-medium hover:text-yellow-300 transition"
          >
            Umwirondoro
          </Link>

          <button
            type="button"
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 px-5 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer shadow-sm"
          >
            Sohoka
          </button>
        </div>


        <div className="md:hidden flex items-center font-sans">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white hover:text-yellow-300 focus:outline-none p-2 transition rounded-lg hover:bg-blue-800 cursor-pointer"
            aria-label="Fungura cyangwa ufunge menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>


      {isMobileMenuOpen && (
        <div className="md:hidden bg-blue-800 border-t border-blue-600 absolute w-full left-0 top-full shadow-xl font-sans">
          <div className="px-4 pt-2 pb-4 space-y-1 flex flex-col">
            <Link
              to="/employee/dashboard"
              onClick={closeMenu}
              className="block px-3 py-3 rounded-lg text-base font-medium hover:bg-blue-700 hover:text-yellow-300 transition"
            >
              Imbonerahamwe
            </Link>

            <Link
              to="/employee/workspace"
              onClick={closeMenu}
              className="block px-3 py-3 rounded-lg text-base font-medium hover:bg-blue-700 hover:text-yellow-300 transition"
            >
              Inkuru
            </Link>

            <Link
              to="/employee/profile"
              onClick={closeMenu}
              className="block px-3 py-3 rounded-lg text-base font-medium hover:bg-blue-700 hover:text-yellow-300 transition"
            >
              Umwirondoro
            </Link>

            <button
              type="button"
              onClick={() => {
                closeMenu();
                logout();
              }}
              className="mt-2 w-full text-center block px-3 py-3 bg-red-600 hover:bg-red-700 rounded-xl text-base font-semibold transition shadow-sm cursor-pointer"
            >
              Sohoka
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;