import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../Rubavu.jpeg";
import { API_ROOT } from "../../services/api";

const API_BASE = API_ROOT;




function getAuthHeaders() {
  const token = localStorage.getItem("admin_token");

  if (!token) {
    console.warn("No authentication token found.");
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}





async function parseResponse(response) {
  const contentType =
    response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return await response.json();
  }

  const text = await response.text();

  return {
    error:
      text ||
      `Request failed with status ${response.status}`,
  };
}





async function createEmployee(employeeData) {
  const response = await fetch(
    `${API_BASE}/api/employees`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(employeeData),
    }
  );

  const data = await parseResponse(response);

  console.log(
    "Create employee response:",
    data
  );

  if (!response.ok) {
    throw new Error(
      data.error ||
        data.message ||
        `Failed to create employee (${response.status})`
    );
  }

  return data;
}





export default function CreateEmployee() {
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

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  
  
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setMessageType("");

    const fullName =
      form.full_name.trim();

    const email =
      form.email.trim();

    const phone =
      form.phone.trim();

    const password =
      form.password;

    
    
    

    if (!fullName) {
      setMessage(
        "Please enter the employee's full name."
      );
      setMessageType("error");
      return;
    }

    if (!email) {
      setMessage(
        "Please enter an email address."
      );
      setMessageType("error");
      return;
    }

    if (!password) {
      setMessage(
        "Please enter a password."
      );
      setMessageType("error");
      return;
    }

    if (password.length < 6) {
      setMessage(
        "Password must contain at least 6 characters."
      );
      setMessageType("error");
      return;
    }

    
    
    

    const token =
      localStorage.getItem(
        "admin_token"
      );

    if (!token) {
      setMessage(
        "You are not authenticated. Please log in again before creating an employee."
      );
      setMessageType("error");
      return;
    }

    
    
    

    try {
      setLoading(true);

      












      const payload = {
        full_name: fullName,
        email: email,
        phone: phone || null,
        role: "reporter",
        password: password,
      };

      console.log(
        "Creating employee:",
        {
          ...payload,
          password: "********",
        }
      );

      const result =
        await createEmployee(
          payload
        );

      console.log(
        "Employee created successfully:",
        result
      );

      
      
      

      setMessage(
        result.message ||
          "Employee created successfully."
      );

      setMessageType("success");

      
      
      

      setForm({
        full_name: "",
        email: "",
        phone: "",
        password: "",
      });

      
      
      

      setTimeout(() => {
        navigate("/admin");
      }, 1200);

    } catch (error) {
      console.error(
        "Create employee error:",
        error
      );

      setMessage(
        error.message ||
          "Unable to create employee."
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  
  
  

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:py-10">

      <div className="mx-auto max-w-3xl">

        

        <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">

            <div className="flex min-w-0 items-center gap-3">

              <img
                src={logo}
                alt="Rubavu Today"
                className="h-12 w-12 shrink-0 rounded-full border border-slate-200 object-cover shadow-sm"
              />

              <div className="min-w-0">

                <h1 className="truncate text-xl font-bold text-gray-900 sm:text-2xl">
                  Create Employee Account
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Add a new staff member to
                  the Rubavu Today system.
                </p>

              </div>

            </div>

          </div>

        </div>

        

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="p-5 sm:p-6">

            

            {message && (
              <div
                className={`mb-5 rounded-xl border p-4 text-sm font-medium ${
                  messageType === "success"
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {message}
              </div>
            )}

            

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              

              <div>

                <label className="mb-2 block text-xs font-semibold uppercase text-gray-700">
                  Full Name
                </label>

                <input
                  type="text"
                  name="full_name"
                  placeholder="Enter employee full name"
                  value={form.full_name}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                  disabled={loading}
                />

              </div>

              

              <div>

                <label className="mb-2 block text-xs font-semibold uppercase text-gray-700">
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  placeholder="employee@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                  disabled={loading}
                />

              </div>

              

              <div>

                <label className="mb-2 block text-xs font-semibold uppercase text-gray-700">

                  Phone Number

                  <span className="ml-1 normal-case font-normal text-gray-400">
                    (Optional)
                  </span>

                </label>

                <input
                  type="text"
                  name="phone"
                  placeholder="Phone number"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  disabled={loading}
                />

              </div>

              

              <div>

                <label className="mb-2 block text-xs font-semibold uppercase text-gray-700">
                  Password
                </label>

                <input
                  type="password"
                  name="password"
                  placeholder="Enter password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                  minLength={6}
                  disabled={loading}
                />

                <p className="mt-2 text-xs text-gray-500">
                  Password must contain at
                  least 6 characters.
                </p>

              </div>

              

              <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row">

                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? "Creating Employee..."
                    : "Create Employee"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/admin")
                  }
                  disabled={loading}
                  className="rounded-xl bg-gray-100 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-200 disabled:opacity-50 sm:w-32"
                >
                  Cancel
                </button>

              </div>

            </form>

          </div>

        </div>

      </div>

    </div>
  );
}
