import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addChiefEditor } from "../../services/api";
import { DashboardLayout, FormField } from "../../components/dashboard";
import { ArrowLeft } from "lucide-react";

const adminNav = [
  {
    label: "Admin",
    items: [
      { icon: <span>▦</span>, label: "Dashboard", path: "/admin/dashboard" },
      { icon: <span>👤</span>, label: "New Employee", path: "/admin/create-employee" },
      { icon: <span>🛡️</span>, label: "New Chief Editor", path: "/admin/create-chief-editor" },
    ],
  },
];

export default function CreateChiefEditor({ onLogout }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({ full_name: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    if (!form.full_name.trim()) { setMessage("Full name is required."); setMessageType("error"); return; }
    if (!form.email.trim()) { setMessage("Email address is required."); setMessageType("error"); return; }
    if (!form.password.trim()) { setMessage("Password is required."); setMessageType("error"); return; }
    if (form.password.length < 6) { setMessage("Password must be at least 6 characters."); setMessageType("error"); return; }

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
      setForm({ full_name: "", email: "", phone: "", password: "" });
      navigate("/admin/dashboard");
    } catch (error) {
      setMessage(error?.message || "Failed to create Chief Editor. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout navigationSections={adminNav} roleLabel="Admin" onLogout={onLogout}>
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">

        <button onClick={() => navigate("/admin/dashboard")} className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="card overflow-hidden">
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <h1 className="text-xl font-bold text-slate-900">Create Chief Editor Account</h1>
            <p className="mt-1 text-sm text-slate-500">Add a new Chief Editor to manage newsroom and publication workflows.</p>
          </div>

          <div className="p-5 sm:p-6">

            {message && (
              <div className={`mb-5 rounded-xl border p-4 text-sm font-medium ${messageType === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"
                }`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <FormField label="Full Name" required>
                <input type="text" name="full_name" placeholder="Enter full name" value={form.full_name} onChange={handleChange} disabled={loading} className="form-input" required />
              </FormField>

              <FormField label="Email Address" required>
                <input type="email" name="email" placeholder="Enter email address" value={form.email} onChange={handleChange} disabled={loading} className="form-input" required />
              </FormField>

              <FormField label="Phone Number" description="Optional">
                <input type="text" name="phone" placeholder="Enter phone number" value={form.phone} onChange={handleChange} disabled={loading} className="form-input" />
              </FormField>

              <FormField label="Password" required>
                <input type="password" name="password" placeholder="Enter password" value={form.password} onChange={handleChange} disabled={loading} minLength={6} className="form-input" required />
              </FormField>

              <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row">
                <button type="submit" disabled={loading} className="btn-primary flex-1">
                  {loading ? "Creating..." : "Create Chief Editor"}
                </button>
                <button type="button" onClick={() => navigate("/admin/dashboard")} disabled={loading} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
