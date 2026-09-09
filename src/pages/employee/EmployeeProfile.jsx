import React, { useRef, useState } from "react";
import {
  Camera,
  Key,
  LogOut,
  Mail,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  changeMyPassword,
  getProfileImageUrl,
  uploadProfileImage,
} from "../../services/api";
import { useToast } from "../../components/employee/EmployeeUI";
import { errorMessage } from "./employeeHelpers";

const DEPT_COLORS = {
  Amakuru: "bg-blue-100 text-blue-700",
  Ubukungu: "bg-emerald-100 text-emerald-700",
  Imikino: "bg-orange-100 text-orange-700",
  Imyidagaduro: "bg-pink-100 text-pink-700",
  Uburezi: "bg-purple-100 text-purple-700",
};

export default function EmployeeProfile({ onLogout }) {
  const { user, refreshUser, logout: authLogout } = useAuth();
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setProfileLoading(true);
    try {
      await uploadProfileImage(file);
      await refreshUser();
      toast.success("Ifoto yawe yahinduwe neza.");
    } catch (err) {
      toast.error(errorMessage(err, "Ntanabonye gushyiraho ifoto."));
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !currentPassword) {
      toast.error("Injiza amagambo yose y'ibanga.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Ijambo ry'ibanga rigomba kugira amagambo 6 cyangwa byinshi.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Amagambo y'ibanga ntariho.");
      return;
    }
    setPasswordLoading(true);
    try {
      await changeMyPassword(currentPassword, newPassword);
      toast.success("Ijambo ry'ibanga ryahinduwe neza.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(errorMessage(err, "Ntanabonye guhindura ijambo ry'ibanga."));
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authLogout();
    } finally {
      if (onLogout) onLogout();
    }
  };

  const profileImage = getProfileImageUrl(user);
  const userName = user?.full_name || user?.name || "Umukozi";
  const userInitial = String(userName).charAt(0).toUpperCase();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Umwirondoro Wanjye</h2>
        <p className="text-sm text-slate-500">Hindura amakuru yawe kandi ubyungurure ibanga ryawe.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr] xl:grid-cols-[340px_1fr]">
        <div className="flex flex-col gap-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <div className="relative mx-auto mb-4 inline-block">
              {profileImage ? (
                <img src={profileImage} alt={userName} className="h-28 w-28 rounded-3xl object-cover ring-4 ring-blue-100" />
              ) : (
                <span className="flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 text-4xl font-black text-white ring-4 ring-blue-100">
                  {userInitial}
                </span>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={profileLoading}
                className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white shadow-md transition hover:bg-blue-700 disabled:opacity-50"
                aria-label="Hindura ifoto"
              >
                {profileLoading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Camera className="h-4 w-4" />}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">{userName}</h3>
            <p className="mt-1 text-xs text-slate-500">{user?.email || "umukozi@rubavutoday.com"}</p>

            <div className="mt-4 flex flex-col gap-2 text-left">
              {user?.department && (
                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                  <Mail className="h-4 w-4 text-indigo-500" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ishuri / Department</p>
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${DEPT_COLORS[user.department] || "bg-slate-100 text-slate-600"}`}>
                      {user.department}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100"
            >
              <LogOut className="h-4 w-4" /> Sohoka
            </button>
          </div>
        </div>

        <div className="space-y-5">
          <form onSubmit={handleChangePassword} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                <Key className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Guhindura Ijambo ry'Ibanga</h3>
                <p className="text-xs text-slate-500">Shyira ijambo ryawe rya mbere, hanyuma rya kabiri.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-700">Ijambo ry'ibanga rya mbere</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-700">Ijambo ry'ibanga rishya</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-700">Emeza ijambo ry'ibanga rishya</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 ${
                      confirmPassword && confirmPassword !== newPassword
                        ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                        : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                    }`}
                  />
                  {confirmPassword && confirmPassword !== newPassword && (
                    <p className="mt-1.5 text-xs font-medium text-red-600">Amagambo y'ibanga ntariho.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button type="submit" disabled={passwordLoading} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
                {passwordLoading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Key className="h-4 w-4" />}
                Hindura Ijambo ry'Ibanga
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}