"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const registrationSchema = z.object({
  CompanyName: z.string().min(1, "Company name is required"),
  name: z.string().min(1, "Full name is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  Area: z.string().optional(),
  Adress: z.string().optional(),
  password: z.string().min(1, "Password is required"),
});

const fields = [
  { name: "CompanyName", type: "text", placeholder: "Your Company Name" },
  { name: "name", type: "text", placeholder: "Full Name" },
  { name: "phone", type: "text", placeholder: "Phone Number" },
  { name: "email", type: "email", placeholder: "Email" },
  { name: "Area", type: "text", placeholder: "Your Area" },
  { name: "Adress", type: "text", placeholder: "Your Address" },
  { name: "password", type: "password", placeholder: "Password" },
];

export default function Registration() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(registrationSchema),
  });

  const onSubmit = async (data) => {
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Registration failed");
      }

      alert("Registration successful");
      router.push("/login");
    } catch (error) {
      setError("root", { message: error.message });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6">Register</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {fields.map(({ name, type, placeholder }) => (
            <div key={name}>
              <input
                type={type}
                placeholder={placeholder}
                {...register(name)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
              />
              {errors[name] && (
                <p className="text-red-500 text-xs mt-1">{errors[name].message}</p>
              )}
            </div>
          ))}

          {errors.root && (
            <p className="text-red-500 text-sm text-center">{errors.root.message}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              backgroundColor: "var(--color-gold-400)",
              borderColor: "var(--color-gold-400)",
              opacity: isSubmitting ? 0.7 : 1,
              cursor: isSubmitting ? "not-allowed" : "pointer",
            }}
            className="w-full text-white py-3 rounded-lg font-semibold"
          >
            {isSubmitting ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          Already have an account? <a href="/login" className="text-blue-600">Login</a>
        </p>
      </div>
    </div>
  );
}