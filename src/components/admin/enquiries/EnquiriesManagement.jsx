"use client";

import { useState, useMemo } from "react";
import { useEnquiries } from "@/hooks/admin/useEnquiries";

export default function EnquiriesManagement() {
  const { enquiries, isLoading } = useEnquiries();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return enquiries;
    const q = search.toLowerCase();
    return enquiries.filter(
      (e) =>
        e.name?.toLowerCase().includes(q) ||
        e.contact?.toLowerCase().includes(q) ||
        e.sku?.toLowerCase().includes(q)
    );
  }, [enquiries, search]);

  if (isLoading) {
    return <p className="p-6 text-sm text-gray-400">Loading enquiries...</p>;
  }

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-2xl font-bold" style={{ color: "var(--color-gold-800)" }}>
        Enquiries
      </h1>

      <input
        type="text"
        placeholder="Search by name, phone, or SKU..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border rounded-lg px-3 py-2 text-sm w-full max-w-md"
        style={{ borderColor: "var(--color-gold-200)" }}
      />

      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "var(--color-gold-200)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: "var(--color-gold-50)" }}>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--color-gold-700)" }}>Name</th>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--color-gold-700)" }}>Phone</th>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--color-gold-700)" }}>SKU Interested</th>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--color-gold-700)" }}>Retailer ID</th>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--color-gold-700)" }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((enq) => (
              <tr key={enq.rowIndex} className="border-t" style={{ borderColor: "var(--color-gold-100)" }}>
                <td className="px-4 py-3 font-medium">{enq.name}</td>
                <td className="px-4 py-3">{enq.contact}</td>
                <td className="px-4 py-3">{enq.sku}</td>
                <td className="px-4 py-3 text-gray-500">{enq.retailerId}</td>
                <td className="px-4 py-3 text-gray-500">
                  {enq.timestamp ? new Date(enq.timestamp).toLocaleString("en-IN") : "N/A"}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-gray-400 py-8">
                  No enquiries found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}