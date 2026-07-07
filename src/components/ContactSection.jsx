"use client";

import { useEffect, useState } from "react";
import { getSkuList } from "@/app/lib/getSkuList";

const contactCards = [
  { icon: "📞", label: "Call Us", value: "+91-9" },
  { icon: "✉️", label: "Email Us", value: "info@saifcobasmati.com" },
  { icon: "🕐", label: "Working Hours", value: "24 Hours · Mon–Sun" },
];

export default function ContactSection() {
  const [form, setForm] = useState({
    retailerId: "",
    name: "",
    contact: "",
    sku: "",
  });

  const [loading, setLoading] = useState(false);

   const [skuList, setSkuList] = useState([]);
  const [loadingSku, setLoadingSku] = useState(true);

  useEffect(() => {
    async function loadSkus() {
      const skus = await getSkuList();
      setSkuList(skus);
      setLoadingSku(false);
    }

    loadSkus();
  }, []);

  console.log(skuList)

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      console.log("API Response:", data);

      // Check both HTTP status and success flag
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Enquiry failed");
      }

      alert("Enquiry submitted successfully");

      // Clear form
      setForm({
        retailerId: form.retailerId, // Keep retailerId
        name: "",
        contact: "",
        sku: "",
      });
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  async function loadSession() {
    try {
      const res = await fetch("/api/session");

      const data = await res.json();

      if (data.success) {
        const user = data.user;

        setForm((prev) => ({
          ...prev,
          retailerId:
            user.retailerId ||
            user.retailerID ||
            user.id ||
            "",
        }));
        
      }
    } catch (error) {
      console.error("Failed to load session");
    }
  }

  loadSession();
}, []);

  return (
    <section
      className="px-6 py-8 border-t"
      style={{
        backgroundColor: "var(--color-gold-50)",
        borderColor: "var(--color-gold-200)",
      }}
    >
      <p
        className="text-[11px] tracking-widest font-semibold mb-5"
        style={{ color: "var(--color-gold-400)" }}
      >
        CONTACT US
      </p>

      {/* Contact cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {contactCards.map(({ icon, label, value }) => (
          <div
            key={label}
            className="rounded-lg px-4 py-3 flex items-center gap-3 border"
            style={{
              backgroundColor: "#fff",
              borderColor: "var(--color-gold-200)",
            }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0 border"
              style={{
                backgroundColor: "var(--color-gold-50)",
                borderColor: "var(--color-gold-500)",
              }}
            >
              {icon}
            </div>
            <div>
              <p
                className="text-[10px]"
                style={{ color: "var(--color-gold-400)" }}
              >
                {label}
              </p>
              <p
                className="text-sm font-semibold"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--color-gold-900)",
                }}
              >
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Enquiry form */}
      <div
        className="rounded-lg px-5 py-4 border"
        style={{
          backgroundColor: "#fff",
          borderColor: "var(--color-gold-200)",
        }}
      >
        <p
          className="text-[11px] tracking-widest font-semibold mb-4"
          style={{ color: "var(--color-gold-400)" }}
        >
          QUICK ENQUIRY FORM
        </p>

        {/* IMPORTANT: Use form tag so Enter key works */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3"
        >
            <input
              type="text"
              name="retailerId"
              value={form.retailerId}
              readOnly
              className="
                w-full
                border
                rounded-xl
                px-4
                py-3
                bg-gray-100
                text-gray-600
                cursor-not-allowed
              "
            />
          
          <input
            type="text"
            placeholder="Your Name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
            required
            className="flex-1 rounded-md px-3 py-2 text-sm outline-none border"
            style={{
              backgroundColor: "var(--color-gold-100)",
              borderColor: "var(--color-gold-200)",
              color: "var(--color-gold-900)",
            }}
          />

          <input
            type="text"
            placeholder=" Enter Ph No."
            value={form.contact}
            onChange={(e) =>
              setForm({ ...form, contact: e.target.value })
            }
            required
            className="flex-1 rounded-md px-3 py-2 text-sm outline-none border"
            style={{
              backgroundColor: "var(--color-gold-100)",
              borderColor: "var(--color-gold-200)",
              color: "var(--color-gold-900)",
            }}
          />

          <select
  value={form.sku}
  onChange={(e) =>
    setForm({ ...form, sku: e.target.value })
  }
  required
  disabled={loadingSku}
  className="flex-1 rounded-md px-3 py-2 text-sm outline-none border"
>
  <option value="">
    {loadingSku ? "Loading SKUs..." : "Select SKU"}
  </option>

  {skuList.map((sku) => (
    <option
      key={sku}
      value={sku}
    >
      {sku}
    </option>
  ))}
</select>
          <button
            type="submit"
            disabled={loading}
            className="text-white text-sm font-semibold px-5 py-2 rounded-md whitespace-nowrap transition-colors disabled:opacity-50"
            style={{ backgroundColor: "var(--color-gold-500)" }}
          >
            {loading ? "Sending..." : "Send →"}
          </button>
        </form>
      </div>
    </section>
  );
}