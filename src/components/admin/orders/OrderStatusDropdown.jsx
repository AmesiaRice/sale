"use client";

import { useState } from "react";

const STATUS_OPTIONS = ["Pending", "Processing", "Shipped", "Delivered"];

const STATUS_COLORS = {
  Pending: { bg: "#FEF3C7", text: "#92400E" },
  Processing: { bg: "#DBEAFE", text: "#1E40AF" },
  Shipped: { bg: "#E0E7FF", text: "#4338CA" },
  Delivered: { bg: "#D1FAE5", text: "#065F46" },
};

export default function OrderStatusDropdown({ orderId, currentStatus, onUpdate }) {
  const [status, setStatus] = useState(currentStatus || "Pending");
  const [saving, setSaving] = useState(false);

  const handleChange = async (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setSaving(true);
    await onUpdate(orderId, newStatus);
    setSaving(false);
  };

  const colors = STATUS_COLORS[status] || STATUS_COLORS.Pending;

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={saving}
      className="text-xs font-semibold px-3 py-1.5 rounded-full border-0 outline-none cursor-pointer"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {STATUS_OPTIONS.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}