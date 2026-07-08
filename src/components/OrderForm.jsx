"use client";

import { useEffect, useState } from "react";
import { getSkuList } from "@/app/lib/getSkuList";

export default function OrderForm() {
  const [form, setForm] = useState({
    retailerId: "",
    skuName: "",
    quantity: 1,
    rate: "",
    skuId: "",
  });

  const [loading, setLoading] = useState(false);

  const [skuList, setSkuList] = useState([]);
  const [loadingSku, setLoadingSku] = useState(true);

  // Load user from cache/localStorage
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

  // Load SKU List
  useEffect(() => {
    async function loadSkus() {
      try {
        const skus = await getSkuList();
        setSkuList(skus || []);
      } catch (error) {
        console.error("Failed to load SKUs");
      } finally {
        setLoadingSku(false);
      }
    }

    loadSkus();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "quantity"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          createdAt: new Date().toISOString(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to submit order"
        );
      }

      alert("Order submitted successfully!");

      // Reset form except retailer ID
      setForm((prev) => ({
        retailerId: prev.retailerId,
        skuName: "",
        quantity: 1,
        rate: "",
        remarks: "",
      }));
    } catch (error) {
      alert(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "var(--color-gold-50)",
      }}
      className="
        min-h-screen
        flex
        items-center
        justify-center
        p-4
        sm:p-6
      "
    >
      <div
        className="
          w-full
          max-w-xl
          bg-white
          rounded-2xl
          shadow-lg
          p-5
          sm:p-8
        "
      >
        {/* Header */}
        <div className="mb-6">
          <h1
            className="
              text-2xl
              sm:text-3xl
              font-bold
            "
            style={{
              color: "var(--color-gold-700)",
            }}
          >
            Order Form
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Submit your retailer order
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* Retailer ID */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Retailer ID
            </label>

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
          </div>

          {/* SKU Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              SKU Name
            </label>

            <select
              name="skuName"
              value={form.skuName}
              onChange={handleChange}
              required
              disabled={loadingSku}
              className="
                w-full
                rounded-xl
                px-4
                py-3
                text-sm
                outline-none
                border
                border-gray-300
                focus:ring-2
                focus:border-transparent
              "
              style={{
                focusRingColor:
                  "var(--color-gold-400)",
              }}
            >
              <option value="">
                {loadingSku
                  ? "Loading SKUs..."
                  : "Select SKU"}
              </option>

              {skuList.map((sku) => (
                <option key={sku} value={sku}>
                  {sku}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Quantity
            </label>

            <input
              type="number"
              name="quantity"
              min="1"
              value={form.quantity}
              onChange={handleChange}
              required
              className="
                w-full
                border
                border-gray-300
                rounded-xl
                px-4
                py-3
                focus:outline-none
                focus:ring-2
              "
            />
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Rate
            </label>

            <input
              name="rate"
              value={form.rate}
              onChange={handleChange}
              type="number"
              placeholder="Enter rate"
              className="
                w-full
                border
                border-gray-300
                rounded-xl
                px-4
                py-3
                focus:outline-none
                focus:ring-2
                resize-none
              "
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Remarks
            </label>

            <textarea
              name="skuId"
              value={form.skuId}
              onChange={handleChange}
              rows="4"
              placeholder="skuId"
              className="
                w-full
                border
                border-gray-300
                rounded-xl
                px-4
                py-3
                focus:outline-none
                focus:ring-2
                resize-none
              "
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor:
                "var(--color-gold-500)",
            }}
            className="
              w-full
              text-white
              py-3
              rounded-xl
              font-semibold
              transition-all
              duration-300
              hover:scale-[1.01]
              active:scale-[0.98]
              disabled:opacity-60
            "
          >
            {loading
              ? "Submitting..."
              : "Submit Order"}
          </button>
        </form>
      </div>
    </div>
  );
}