"use client";

import { useState } from "react";

function getRedirectPath() {
  const params = new URLSearchParams(window.location.search);
  const next = params.get("callbackUrl") || "/";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export default function Login() {
  const [form, setForm] = useState({
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      window.location.assign(getRedirectPath());
    } catch (error) {
      alert(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6">Login</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-3"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-3"
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: "var(--color-gold-400)",
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
            className="w-full text-white py-3 rounded-lg font-semibold"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          Don't have an account? <a href="/registration" className="text-blue-600">Register</a>
        </p>
      </div>
    </div>
  );
}
