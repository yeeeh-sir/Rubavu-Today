import React, { useState } from "react";
import { login } from "../../services/api";
import { useLanguage } from "../../context/LanguageContext";
import logo from "../../Rubavu.jpeg";

const AdminLogin = ({ onLogin }) => {
  const { t } = useLanguage();
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
        t("invalidCredentials")
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
    <main className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="flex min-h-[90vh] items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-8">



          <div className="mb-8 text-center">
            <img
              src={logo}
              alt="Rubavu Today Logo"
              className="mx-auto h-24 w-24 rounded-full border-4 border-slate-700 object-cover shadow-xl"
            />

            <h1 className="mt-6 text-3xl font-bold text-white">
              {t("loginTitle")}
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              {t("loginSubtitle")}
            </p>
          </div>



          {mode === "login" && (
            <form
              onSubmit={handleLogin}
              className="space-y-5"
            >



              <label className="block">
                <span className="text-sm font-medium text-slate-300">
                  {t("email")}
                </span>

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder={t("emailPlaceholder")}
                  autoComplete="username"
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3.5 text-white outline-none placeholder:text-slate-500 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </label>



              <label className="block">
                <span className="text-sm font-medium text-slate-300">
                  {t("password")}
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
                    placeholder={t("passwordPlaceholder")}
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3.5 text-white outline-none placeholder:text-slate-500 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:bg-slate-700 hover:text-white"
                    aria-label={
                      showPassword
                        ? "Hisha ijambo ry'ibanga"
                        : "Erekana ijambo ry'ibanga"
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
                className="w-full rounded-xl bg-blue-600 px-4 py-3.5 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? t("loggingIn")
                  : t("login")}
              </button>



              <button
                type="button"
                onClick={() =>
                  changeMode("forgot")
                }
                className="w-full rounded-xl border border-slate-700 px-4 py-3 font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                Wibagiwe ijambo ry'ibanga?
              </button>

            </form>
          )}



          {mode === "forgot" && (
            <form
              onSubmit={handleForgot}
              className="space-y-5"
            >

              <div>
                <h2 className="text-xl font-semibold text-white">
                  Wibagiwe ijambo ry'ibanga
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Andika imeyili y'umuyobozi kugira ngo ubone kode yo gusubizamo.
                </p>
              </div>



              <label className="block">
                <span className="text-sm font-medium text-slate-300">
                  Imeyili y'umuyobozi
                </span>

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="Andika imeyili y'umuyobozi"
                  autoComplete="email"
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3.5 text-white outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </label>



              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 px-4 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Kode irimo gutegurwa..."
                  : "Saba kode yo gusubizamo"}
              </button>



              <button
                type="button"
                onClick={() =>
                  changeMode("login")
                }
                className="w-full rounded-xl border border-slate-700 px-4 py-3 font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                Subira ku kwinjira
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
                  Hindura ijambo ry'ibanga
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Andika kode n'ijambo ry'ibanga rishya.
                </p>
              </div>



              <label className="block">
                <span className="text-sm font-medium text-slate-300">
                  Kode yo gusubizamo
                </span>

                <input
                  value={resetToken}
                  onChange={(e) =>
                    setResetToken(e.target.value)
                  }
                  placeholder="Andika kode yo gusubizamo"
                  autoComplete="off"
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3.5 text-white outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </label>



              <label className="block">
                <span className="text-sm font-medium text-slate-300">
                  Ijambo ry'ibanga rishya
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
                    placeholder="Andika ijambo ry'ibanga rishya"
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3.5 text-white outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:bg-slate-700 hover:text-white"
                    aria-label={
                      showNewPassword
                        ? "Hisha ijambo ry'ibanga"
                        : "Erekana ijambo ry'ibanga"
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
                className="w-full rounded-xl bg-blue-600 px-4 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Birimo guhindura..."
                  : "Hindura ijambo ry'ibanga"}
              </button>



              <button
                type="button"
                onClick={() =>
                  changeMode("login")
                }
                className="w-full rounded-xl border border-slate-700 px-4 py-3 font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                Subira ku kwinjira
              </button>

            </form>
          )}



          {status && (
            <div className="mt-5 rounded-xl border border-red-800 bg-red-950/50 p-4">
              <p className="text-sm text-red-300">
                {status}
              </p>
            </div>
          )}

        </div>
      </div>
    </main>
  );
};

export default AdminLogin;