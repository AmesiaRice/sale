"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Registration() {
  const router = useRouter();
  const [form, setForm] = useState({
    CompanyName: "",
    name: "",
    phone: "",
    email: "",
    password: "",
    Area: "",
    Adress: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      console.log("API Response:", data);

      // Check both HTTP status and success flag
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Registration failed");
      }

      alert("Registration successful");
      router.push("/login");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6">Register</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="CompanyName"
            placeholder="Your Company Name"
            value={form.CompanyName}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-3"
          />
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-3"
          />

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
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-3"
          />

          <input
            type="text"
            name="Area"
            placeholder="Your Area"
            value={form.Area}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-3"
          />

          <input
            type="text"
            name="Adress"
            placeholder="Your Adress"
            value={form.Adress}
            onChange={handleChange}
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
            style={{
              backgroundColor: "var(--color-gold-400)",
              borderColor: "var(--color-gold-400)",
            }}
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          Already have an account? <a href="/login" className="text-blue-600">Login</a>
        </p>
      </div>
    </div>
  );
}