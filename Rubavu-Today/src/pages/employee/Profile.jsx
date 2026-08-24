import React from "react";
import { getStoredUser } from "../../services/api";
import rubavuLogo from "../../Rubavu.jpeg";

function Profile() {
  const user = getStoredUser();

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-3xl mx-auto w-full font-serif">
      <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 border border-slate-200">
        <div className="flex items-center space-x-3 mb-6">
          <img src={rubavuLogo} alt="Rubavu Logo" className="w-10 h-10 rounded-xl object-cover shrink-0 shadow-sm border border-slate-200" />
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-sans">
            User Profile
          </h1>
        </div>

        <div className="space-y-5 text-sm font-sans">
          <div className="border-b border-slate-100 pb-4">
            <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Full Name
            </span>
            <p className="font-semibold text-slate-800 mt-1 font-serif text-base">
              {user?.full_name || "N/A"}
            </p>
          </div>

          <div className="border-b border-slate-100 pb-4">
            <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Email Address
            </span>
            <p className="font-semibold text-slate-800 mt-1 font-serif text-base">
              {user?.email || "N/A"}
            </p>
          </div>

          <div className="border-b border-slate-100 pb-4">
            <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Role
            </span>
            <p className="font-semibold text-blue-600 mt-1 font-serif text-base">
              {user?.role || "N/A"}
            </p>
          </div>

          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Account Status
            </span>
            <span className="inline-block mt-1.5 bg-green-100 text-green-800 font-semibold px-3 py-1 rounded-full text-xs">
              {user?.status || "Active"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;