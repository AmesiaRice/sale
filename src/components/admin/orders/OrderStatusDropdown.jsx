"use client";

import { useState } from "react";
import { STATUS_OPTIONS, getStatusColors } from "@/lib/orderStatus";

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

  const colors = getStatusColors(status);

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