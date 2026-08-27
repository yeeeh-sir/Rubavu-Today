
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, getCurrentUser } from "../../services/api";
import logo from "../../Rubavu.jpeg";

export default function Login() {
  const navigate = useNavigate();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });





  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const token = localStorage.getItem("admin_token");

        if (!token) {
          setCheckingAuth(false);
          return;
        }

        const user = await getCurrentUser();

        console.log("Stored authenticated user:", user);

        if (user && user.role_type === "chief_editor") {
          navigate("/chief-editor/dashboard", { replace: true });
          return;
        }


        localStorage.removeItem("admin_token");
        localStorage.removeItem("user");
      } catch (err) {
        console.error("Authentication check failed:", err);

        localStorage.removeItem("admin_token");
        localStorage.removeItem("user");
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuthentication();
  }, [navigate]);





  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };





  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const email = formData.email.trim();
      const password = formData.password;

      if (!email || !password) {
        throw new Error("Please enter your email and password.");
      }

      console.log("Attempting Chief Editor login:", email);

      const result = await login({
        email,
        password,
      });

      console.log("Login response:", result);

      if (!result) {
        throw new Error("No response received from server.");
      }

      if (!result.user) {
        throw new Error(
          result.message || "User information was not returned by the server."
        );
      }

      if (!result.token) {
        throw new Error(
          result.message || "Authentication token was not returned by the server."
        );
      }

      const user = result.user;

      console.log("Authenticated user:", user);





      const roleType = String(user.role_type || "").toLowerCase();
      const role = String(user.role || "").toLowerCase();
      const position = String(user.position || "").toLowerCase();

      const isChiefEditor =
        roleType === "chief_editor" ||
        role === "chief_editor" ||
        role === "chief editor" ||
        position === "chief_editor" ||
        position === "chief editor";

      if (!isChiefEditor) {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("user");

        throw new Error(
          "Only Chief Editors can login to this portal."
        );
      }





      localStorage.setItem("admin_token", result.token);

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...user,
          role_type: "chief_editor",
        })
      );

      console.log("Chief Editor authentication saved.");


      setFormData({
        email: "",
        password: "",
      });





      navigate("/chief-editor/dashboard", { replace: true });
    } catch (err) {
      console.error("Chief Editor login error:", err);

      let message = "Login failed. Please try again.";

      if (err?.response?.data?.message) {
        message = err.response.data.message;
      } else if (err?.message) {
        message = err.message;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };





  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500"></div>

          <p className="text-sm text-slate-400">
            Birimo kugenzura umutekano...
          </p>
        </div>
      </div>
    );
  }





  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="flex min-h-[90vh] items-center justify-center">
        <div className="w-full max-w-md">



          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-8">



            <div className="mb-8 text-center">
              <img
                src={logo}
                alt="Rubavu Today Logo"
                className="mx-auto h-24 w-24 rounded-full border-4 border-slate-700 object-cover shadow-xl"
              />

              <h1 className="mt-6 text-3xl font-bold text-white">
                Umwanditsi Mukuru
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Injira ucunge Rubavu Today
              </p>
            </div>



            {error && (
              <div className="mb-5 rounded-xl border border-red-800 bg-red-950/50 px-4 py-3">
                <p className="text-sm text-red-300">
                  {error}
                </p>
              </div>
            )}



            <form
              onSubmit={handleLogin}
              className="space-y-5"
            >



              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Imeyili
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="umwanditsi@rubavu.today"
                  autoComplete="email"
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3.5 text-white outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                  required
                />
              </div>



              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Ijambo ry'ibanga
                </label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Andika ijambo ry'ibanga"
                  autoComplete="current-password"
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3.5 text-white outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                  required
                />
              </div>



              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3.5 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>

                    Birimo kwinjira...
                  </>
                ) : (
                  "Injira"
                )}
              </button>
            </form>



            <p className="mt-6 text-center text-xs text-slate-500">
              Rubavu Today • Urubuga rw'Umwanditsi Mukuru
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}