"use client";

import { useState } from "react";

export default function OrderForm({ onSearch, onClear, isSearchActive }) {
  const [orderId, setOrderId] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (orderId.trim()) onSearch(orderId.trim());
  };

  const handleClear = () => {
    setOrderId("");
    onClear();
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
      <input
        type="text"
        value={orderId}
        onChange={(e) => setOrderId(e.target.value)}
        placeholder="Search by Order ID..."
        className="border rounded px-3 py-1.5 text-sm flex-1"
      />
      <button
        type="submit"
        className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded"
      >
        Search
      </button>
      {isSearchActive && (
        <button
          type="button"
          onClick={handleClear}
          className="px-3 py-1.5 bg-gray-200 text-sm rounded"
        >
          Clear
        </button>
      )}
    </form>
  );
}