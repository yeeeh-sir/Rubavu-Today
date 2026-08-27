import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { login as loginApi } from "../../services/api";
import logo from "../../Rubavu.jpeg";

function AuthPage() {
  const [isLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await loginApi({ email, password });

      if (data?.user?.role_type !== "employee") {
        throw new Error("Only employees can login to this portal.");
      }

      if (data && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      navigate("/employee/dashboard");
    } catch (err) {
      console.error("Auth Error:", err);
      const serverError =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message;

      setError(
        serverError && !serverError.includes("HTTP")
          ? serverError
          : isLogin
            ? "Invalid email or password. Please try again."
            : "Failed to create account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="flex min-h-[90vh] items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-8">


          <div className="mb-8 text-center">
            <div className="mx-auto h-24 w-24 overflow-hidden rounded-full border-4 border-slate-700 bg-slate-800 shadow-xl">
              <img
                src={logo}
                alt="Rubavu Today"
                className="h-full w-full object-cover"
              />
            </div>

            <h1 className="mt-6 text-3xl font-bold text-white">
              Umukozi
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              {isLogin ? "Injira ucunge Rubavu Today" : "Fungura konti y'umukozi"}
            </p>
          </div>


          {error && (
            <div className="mb-5 rounded-xl border border-red-800 bg-red-950/50 px-4 py-3 text-red-300 text-sm">
              {error}
            </div>
          )}


          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Imeyili
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-4 h-5 w-5 text-slate-500" />
                <input
                  type="email"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3.5 pl-11 text-white placeholder:text-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="employee@rubavu.today"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-slate-300">
                  Ijambo ry'ibanga
                </label>
                {isLogin && (
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-blue-400 transition hover:text-blue-300 hover:underline"
                  >
                    Wibagiwe ijambo ry'ibanga?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-4 h-5 w-5 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3.5 pl-11 pr-12 text-white placeholder:text-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:bg-slate-700 hover:text-white focus:outline-none"
                  aria-label={showPassword ? "Hisha ijambo ry'ibanga" : "Erekana ijambo ry'ibanga"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>{isLogin ? "Birimo kwinjira..." : "Konti irimo gufungurwa..."}</span>
                </>
              ) : (
                <span>{isLogin ? "Injira" : "Fungura konti"}</span>
              )}
            </button>
          </form>


        </div>
      </div>
    </main>
  );
}

export default AuthPage;