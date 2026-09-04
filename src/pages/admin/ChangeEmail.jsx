import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { changeMyEmail, getStoredUser, logout } from "../../services/api";
import { DashboardLayout } from "../../components/dashboard";

const DEPARTMENTS_NAV = [
    {
        label: "Dashboard",
        items: [
            { icon: <span>▦</span>, label: "Imbonerahamwe", path: "/admin/dashboard" },
        ],
    },
];

function ChangeEmail() {
    const navigate = useNavigate();
    const storedUser = getStoredUser();

    const [currentEmail, setCurrentEmail] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (storedUser?.email) {
            setCurrentEmail(storedUser.email);
        }
    }, [storedUser]);

    const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

    const canSubmit =
        isValidEmail(newEmail) &&
        password.length > 0 &&
        newEmail.toLowerCase() !== currentEmail.toLowerCase();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!isValidEmail(newEmail)) {
            setError("Imeriyo ntabwo ari yo imeriyo yemewe.");
            return;
        }
        if (newEmail.toLowerCase() === currentEmail.toLowerCase()) {
            setError("Imeriyo nshya ntigishobora kuba iri yo imeriyo yo hano.");
            return;
        }

        setLoading(true);
        try {
            await changeMyEmail(newEmail, password);
            setSuccess("Imeriyo yahinduwe neza!");
            setNewEmail("");
            setPassword("");
            // Refresh stored user
            if (storedUser) {
                const updated = { ...storedUser, email: newEmail };
                localStorage.setItem("admin_user", JSON.stringify(updated));
                localStorage.setItem("user", JSON.stringify(updated));
            }
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
                        ✉️
                    </span>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 sm:text-2xl">
                            Hindura imeyili
                        </h1>
                        <p className="mt-0.5 text-sm text-slate-400">
                            Hindura imeyili y'akuntu.
                        </p>
                    </div>
                </div>

                {/* Current email display */}
                {currentEmail && (
                    <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Imeriyo yo hano
                        </p>
                        <p className="mt-1.5 text-base font-bold text-slate-800">
                            {currentEmail}
                        </p>
                    </div>
                )}

                {/* Form card */}
                <form
                    onSubmit={handleSubmit}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
                >
                    <div className="space-y-5">
                        {/* New email */}
                        <div>
                            <label className="mb-1.5 block text-sm font-bold text-slate-700">
                                Imeriyo nshya *
                            </label>
                            <input
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                placeholder="example@email.com"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
                                required
                            />
                            {newEmail && !isValidEmail(newEmail) && (
                                <p className="mt-1 text-xs text-red-500">
                                    Imeriyo ntabwo ari yo imeriyo yemewe.
                                </p>
                            )}
                            {newEmail && isValidEmail(newEmail) && newEmail.toLowerCase() === currentEmail.toLowerCase() && (
                                <p className="mt-1 text-xs text-red-500">
                                    Imeriyo nshya ntigishobora kuba iri yo imeriyo yo hano.
                                </p>
                            )}
                        </div>

                        {/* Password confirmation */}
                        <div>
                            <label className="mb-1.5 block text-sm font-bold text-slate-700">
                                Ijambo ry'ibanga *
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Andika ijambo ry'ibanga"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                                    tabIndex={-1}
                                >
                                    {showPassword ? "🙈" : "👁️"}
                                </button>
                            </div>
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

export default ChangeEmail;
