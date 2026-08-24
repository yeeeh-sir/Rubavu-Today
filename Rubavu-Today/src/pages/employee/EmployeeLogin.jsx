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
    <main className="min-h-screen flex items-center justify-center bg-slate-100 px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-10 transition-all">

        
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-red-600 shadow-md mb-4 bg-slate-50 flex items-center justify-center">
            <img
              src={logo}
              alt="Rubavu Today"
              className="w-full h-full object-cover"
            />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Rubavu Today
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            {isLogin ? "Employee Portal - Sign In" : "Create Employee Account"}
          </p>
        </div>

        
        {error && (
          <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 p-4 text-red-700 text-sm text-center font-medium animate-fadeIn">
            {error}
          </div>
        )}

        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
              <input
                type="email"
                className="w-full border border-slate-300 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
                placeholder="employee@rubavu.today"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              {isLogin && (
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline transition"
                >
                  Forgot Password?
                </Link>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                className="w-full border border-slate-300 rounded-xl pl-11 pr-12 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none transition cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
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
            className="w-full mt-2 bg-slate-900 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-slate-800 active:scale-[0.99] transition duration-150 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>{isLogin ? "Signing In..." : "Creating Account..."}</span>
              </>
            ) : (
              <span>{isLogin ? "Sign In" : "Sign Up"}</span>
            )}
          </button>
        </form>

        
      </div>
    </main>
  );
}

export default AuthPage;