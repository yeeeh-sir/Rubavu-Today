import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { changeMyPassword } from "../../services/api";
import { logout } from "../../services/api";
import { DashboardLayout } from "../../components/dashboard";

const DEPARTMENTS_NAV = [
    {
        label: "Dashboard",
        items: [
            { icon: <span>▦</span>, label: "Imbonerahamwe", path: "/admin/dashboard" },
        ],
    },
];

function ChangePassword() {
    const navigate = useNavigate();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const passwordStrength = useCallback((pw) => {
        if (!pw) return { score: 0, label: "", color: "" };
        let score = 0;
        if (pw.length >= 6) score++;
        if (pw.length >= 10) score++;
        if (/[A-Z]/.test(pw)) score++;
        if (/[0-9]/.test(pw)) score++;
        if (/[^A-Za-z0-9]/.test(pw)) score++;

        if (score <= 2) return { score, label: "Trashya", color: "bg-red-500" };
        if (score <= 3) return { score, label: "Birakenewe", color: "bg-amber-500" };
        return { score, label: "Yemewe", color: "bg-emerald-500" };
    }, []);

    const strength = passwordStrength(newPassword);

    const canSubmit =
        currentPassword.length > 0 &&
        newPassword.length >= 6 &&
        newPassword === confirmPassword;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (newPassword.length < 6) {
            setError("Ijambo ry'ibanga rishobora kuba rigaragara neza (min 6).");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("Ijambo ry'ibanga rihuriije n'iryo washyizeho ntirihuriije.");
            return;
        }

        setLoading(true);
        try {
            await changeMyPassword(currentPassword, newPassword);
            setSuccess("Ijambo ry'ibanga ryahinduwe neza!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            setError(err.message || "Hari ikosa ryabaye. Ongera ugerageze.");
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate("/admin/dashboard", { replace: true });
        }
    };

    return (
        <DashboardLayout
            navigationSections={DEPARTMENTS_NAV}
            roleLabel="Imicungire y'ubwanditsi"
            onLogout={() => { logout(); navigate("/admin/login", { replace: true }); }}
        >
            <div className="mx-auto max-w-2xl px-3 py-6 sm:px-6 lg:px-8">
                {/* Back button */}
                <button
                    onClick={handleBack}
                    className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-slate-800"
                >
                    <span>←</span> Subira inyuma
                </button>

                {/* Page header */}
                <div className="mb-6 flex items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
                        🔒
                    </span>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 sm:text-2xl">
                            Hindura ijambobanga
                        </h1>
                        <p className="mt-0.5 text-sm text-slate-400">
                            Hindura ijambo ry'ibanga ry'akuntu.
                        </p>
                    </div>
                </div>

                {/* Form card */}
                <form
                    onSubmit={handleSubmit}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
                >
                    <div className="space-y-5">
                        {/* Current password */}
                        <div>
                            <label className="mb-1.5 block text-sm font-bold text-slate-700">
                                Ijambo ry'ibanga ryo hano *
                            </label>
                            <div className="relative">
                                <input
                                    type={showCurrent ? "text" : "password"}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Andika ijambo ry'ibanga ryo hano"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrent(!showCurrent)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                                    tabIndex={-1}
                                >
                                    {showCurrent ? "🙈" : "👁️"}
                                </button>
                            </div>
                        </div>

                        {/* New password */}
                        <div>
                            <label className="mb-1.5 block text-sm font-bold text-slate-700">
                                Ijambo ry'ibanga rishya *
                            </label>
                            <div className="relative">
                                <input
                                    type={showNew ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Andika ijambo ry'ibanga rishya (min 6)"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNew(!showNew)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                                    tabIndex={-1}
                                >
                                    {showNew ? "🙈" : "👁️"}
                                </button>
                            </div>
                            {/* Strength indicator */}
                            {newPassword && (
                                <div className="mt-2">
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                                            <div
                                                className={`h-full rounded-full transition-all ${strength.color}`}
                                                style={{ width: `${(strength.score / 5) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-[11px] font-semibold text-slate-500">
                                            {strength.label}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Confirm password */}
                        <div>
                            <label className="mb-1.5 block text-sm font-bold text-slate-700">
                                Emeza ijambo ry'ibanga rishya *
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirm ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Emeza ijambo ry'ibanga rishya"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                                    tabIndex={-1}
                                >
                                    {showConfirm ? "🙈" : "👁️"}
                                </button>
                            </div>
                            {confirmPassword && newPassword !== confirmPassword && (
                                <p className="mt-1 text-xs text-red-500">
                                    Ijambo ry'ibanga ntirihuriije.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Error / Success */}
                    {error && (
                        <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                            ✓ {success}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                        <button
                            type="submit"
                            disabled={!canSubmit || loading}
                            className="rounded-xl bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-brand-200 transition hover:bg-brand-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {loading ? "Birimo guhindura..." : "Bika impinduka"}
                        </button>
                        <button
                            type="button"
                            onClick={handleBack}
                            className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                        >
                            Subira inyuma
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}

export default ChangePassword;
