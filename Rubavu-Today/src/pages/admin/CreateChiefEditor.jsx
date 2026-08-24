
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../Rubavu.jpeg";
import { addChiefEditor } from "../../services/api";

export default function CreateChiefEditor() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setMessageType("");

    
    if (!form.full_name.trim()) {
      setMessage("Full name is required.");
      setMessageType("error");
      return;
    }

    if (!form.email.trim()) {
      setMessage("Email address is required.");
      setMessageType("error");
      return;
    }

    if (!form.password.trim()) {
      setMessage("Password is required.");
      setMessageType("error");
      return;
    }

    if (form.password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim() || null,
        password: form.password,
        status: "active",
      };

      await addChiefEditor(payload);

      setMessage("Chief Editor created successfully.");
      setMessageType("success");

      setForm({
        full_name: "",
        email: "",
        phone: "",
        password: "",
      });

      setTimeout(() => {
        navigate("/admin");
      }, 1000);
    } catch (error) {
      console.error("Create Chief Editor error:", error);

      setMessage(
        error?.message ||
        "Failed to create Chief Editor. Please try again."
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg overflow-hidden">
        
        <div className="bg-blue-600 px-6 py-6 text-white">
          <div className="flex items-center gap-4">
            <img
              src={logo}
              alt="Rubavu Today"
              className="w-14 h-14 rounded-full object-cover border-2 border-white"
            />

            <div>
              <h1 className="text-xl font-bold">
                Create Chief Editor Account
              </h1>

              <p className="text-sm text-blue-100 mt-1">
                Add a new Chief Editor to manage newsroom
                and publication workflows.
              </p>
            </div>
          </div>
        </div>

        
        <div className="p-6">
          
          {message && (
            <div
              className={`mb-5 rounded-xl p-3 text-sm font-medium ${messageType === "success"
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : "bg-red-100 text-red-700 border border-red-200"
                }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-700 mb-2">
                Full Name
              </label>

              <input
                type="text"
                name="full_name"
                placeholder="Enter full name"
                value={form.full_name}
                onChange={handleChange}
                disabled={loading}
                className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-gray-100"
                required
              />
            </div>

            
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-700 mb-2">
                Email Address
              </label>

              <input
                type="email"
                name="email"
                placeholder="Enter email address"
                value={form.email}
                onChange={handleChange}
                disabled={loading}
                className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-gray-100"
                required
              />
            </div>

            
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-700 mb-2">
                Phone Number
                <span className="text-gray-400 normal-case ml-1">
                  (Optional)
                </span>
              </label>

              <input
                type="text"
                name="phone"
                placeholder="Enter phone number"
                value={form.phone}
                onChange={handleChange}
                disabled={loading}
                className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-gray-100"
              />
            </div>

            
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-700 mb-2">
                Password
              </label>

              <input
                type="password"
                name="password"
                placeholder="Enter password"
                value={form.password}
                onChange={handleChange}
                disabled={loading}
                minLength={6}
                className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-gray-100"
                required
              />
            </div>

            
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() =>
                  navigate("/admin")
                }
                disabled={loading}
                className="w-1/3 border border-gray-300 text-gray-700 rounded-xl py-3 text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50 shadow-sm"
              >
                {loading
                  ? "Creating..."
                  : "Create Chief Editor"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
