import React, { useState } from "react";
import { login } from "../../services/api";

const AdminLogin = ({ onLogin }) => {
  const [email, setEmail] = useState(
    ""
  );

  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [mode, setMode] = useState("login");
  const [resetToken, setResetToken] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  
  
  

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setStatus("");

    try {
      
      
      
      
      
      

      const response = await login(
        email.trim(),
        password
      );

      const user = response?.user || response;

      if (!user) {
        throw new Error(
          "Invalid server response."
        );
      }

      
      
      

      const role =
        user.role_type ||
        user.role ||
        user.account_type;

      if (String(role).toLowerCase() !== "admin") {
        throw new Error(
          "This account does not have administrator access."
        );
      }

      
      
      

      if (typeof onLogin === "function") {
        onLogin(user);
      } else {
        console.warn(
          "AdminLogin: onLogin callback was not provided."
        );
      }

    } catch (error) {
      console.error(
        "Admin login error:",
        error
      );

      setStatus(
        error?.message ||
        "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  
  
  

  const handleForgot = async (e) => {
    e.preventDefault();

    setLoading(true);
    setStatus("");

    try {
      setStatus(
        "Password reset is not available in this deployment."
      );

      setMode("login");
    } finally {
      setLoading(false);
    }
  };

  
  
  

  const handleReset = async (e) => {
    e.preventDefault();

    setLoading(true);
    setStatus("");

    try {
      setStatus(
        "Password reset is not available in this deployment."
      );

      setMode("login");
    } finally {
      setLoading(false);
    }
  };

  
  
  

  const changeMode = (newMode) => {
    setStatus("");
    setMode(newMode);

    setShowPassword(false);
    setShowNewPassword(false);
  };

  
  
  

  const EyeIcon = ({ visible }) => {
    if (visible) {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-5 w-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7Z"
          />

          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
          />
        </svg>
      );
    }

    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-5 w-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.98 8.223A10.477 10.477 0 0 0 2.458 12C3.732 16.057 7.523 19 12 19c1.648 0 3.197-.378 4.578-1.051"
        />

        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.228 6.228A10.45 10.45 0 0 1 12 5c4.478 0 8.268 2.943 9.542 7a10.5 10.5 0 0 1-4.132 5.411"
        />

        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.228 6.228 3 3m3.228 3.228 12.544 12.544M9.88 9.88a3 3 0 0 0 4.24 4.24"
        />
      </svg>
    );
  };

  
  
  

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100 px-4 py-8">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">

        

        <div className="mb-6">
          <h1 className="mb-2 text-3xl font-bold text-slate-900">
            Admin Login
          </h1>

          <p className="text-sm text-slate-500">
            Sign in to the Rubavu Today administration panel.
          </p>
        </div>

        

        {mode === "login" && (
          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >

            

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Email
              </span>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="Enter your email"
                autoComplete="username"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                required
              />
            </label>

            

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Password
              </span>

              <div className="relative mt-2">

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-12 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (previous) =>
                        !previous
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  <EyeIcon
                    visible={showPassword}
                  />
                </button>

              </div>
            </label>

            

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Signing in..."
                : "Sign In"}
            </button>

            

            <button
              type="button"
              onClick={() =>
                changeMode("forgot")
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Forgot password?
            </button>

          </form>
        )}

        

        {mode === "forgot" && (
          <form
            onSubmit={handleForgot}
            className="space-y-5"
          >

            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Forgot Password
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Enter your admin email to create a reset token.
              </p>
            </div>

            

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Admin Email
              </span>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="Enter your admin email"
                autoComplete="email"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                required
              />
            </label>

            

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Creating token..."
                : "Request Reset Token"}
            </button>

            

            <button
              type="button"
              onClick={() =>
                changeMode("login")
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Back to login
            </button>

          </form>
        )}

        

        {mode === "reset" && (
          <form
            onSubmit={handleReset}
            className="space-y-5"
          >

            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Reset Password
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Enter your reset token and new password.
              </p>
            </div>

            

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Reset Token
              </span>

              <input
                value={resetToken}
                onChange={(e) =>
                  setResetToken(e.target.value)
                }
                placeholder="Enter reset token"
                autoComplete="off"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                required
              />
            </label>

            

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                New Password
              </span>

              <div className="relative mt-2">

                <input
                  type={
                    showNewPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-12 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowNewPassword(
                      (previous) =>
                        !previous
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  aria-label={
                    showNewPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  <EyeIcon
                    visible={
                      showNewPassword
                    }
                  />
                </button>

              </div>
            </label>

            

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Resetting..."
                : "Reset Password"}
            </button>

            

            <button
              type="button"
              onClick={() =>
                changeMode("login")
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Back to login
            </button>

          </form>
        )}

        

        {status && (
          <div className="mt-5 rounded-xl bg-red-50 p-4">
            <p className="text-sm text-red-600">
              {status}
            </p>
          </div>
        )}

      </div>
    </main>
  );
};

export default AdminLogin;