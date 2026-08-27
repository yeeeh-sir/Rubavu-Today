import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_ROOT } from "../../services/api";
import { DashboardLayout, FormField } from "../../components/dashboard";
import { ArrowLeft } from "lucide-react";

const API_BASE = API_ROOT;

function getAuthHeaders() {
  const token = localStorage.getItem("admin_token");
  if (!token) {
    console.warn("No authentication token found.");
    return {};
  }
  return { Authorization: `Bearer ${token}` };
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return await response.json();
  }
  const text = await response.text();
  return { error: text || `Request failed with status ${response.status}` };
}

async function createEmployee(employeeData) {
  const response = await fetch(`${API_BASE}/api/employees`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(employeeData),
  });
  const data = await parseResponse(response);
  if (!response.ok) {
    throw new Error(data.error || data.message || `Failed to create employee (${response.status})`);
  }
  return data;
}

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

export default function CreateEmployee({ onLogout }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({ full_name: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    const fullName = form.full_name.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();
    const password = form.password;

    if (!fullName) { setMessage("Please enter the employee's full name."); setMessageType("error"); return; }
    if (!email) { setMessage("Please enter an email address."); setMessageType("error"); return; }
    if (!password) { setMessage("Please enter a password."); setMessageType("error"); return; }
    if (password.length < 6) { setMessage("Password must contain at least 6 characters."); setMessageType("error"); return; }

    const token = localStorage.getItem("admin_token");
    if (!token) { setMessage("You are not authenticated. Please log in again."); setMessageType("error"); return; }

    try {
      setLoading(true);
      const payload = { full_name: fullName, email, phone: phone || null, role: "reporter", password };
      const result = await createEmployee(payload);
      setMessage(result.message || "Employee created successfully.");
      setMessageType("success");
      setForm({ full_name: "", email: "", phone: "", password: "" });
      setTimeout(() => navigate("/admin"), 1200);
    } catch (error) {
      setMessage(error.message || "Unable to create employee.");
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
            <h1 className="text-xl font-bold text-slate-900">Create Employee Account</h1>
            <p className="mt-1 text-sm text-slate-500">Add a new staff member to the Rubavu Today system.</p>
          </div>

          <div className="p-5 sm:p-6">

            {message && (
              <div className={`mb-5 rounded-xl border p-4 text-sm font-medium ${
                messageType === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"
              }`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <FormField label="Full Name" required>
                <input type="text" name="full_name" placeholder="Enter employee full name" value={form.full_name} onChange={handleChange} className="form-input" required disabled={loading} />
              </FormField>

              <FormField label="Email Address" required>
                <input type="email" name="email" placeholder="employee@example.com" value={form.email} onChange={handleChange} className="form-input" required disabled={loading} />
              </FormField>

              <FormField label="Phone Number" description="Optional">
                <input type="text" name="phone" placeholder="Phone number" value={form.phone} onChange={handleChange} className="form-input" disabled={loading} />
              </FormField>

              <FormField label="Password" required>
                <input type="password" name="password" placeholder="Enter password" value={form.password} onChange={handleChange} className="form-input" required minLength={6} disabled={loading} />
                <p className="mt-1.5 text-xs text-slate-400">Must contain at least 6 characters.</p>
              </FormField>

              <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row">
                <button type="submit" disabled={loading} className="btn-primary flex-1">
                  {loading ? "Creating Employee..." : "Create Employee"}
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
