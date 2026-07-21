"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRetailersList } from "@/hooks/admin/useRetailersList";
import { useAllOrders } from "@/hooks/admin/useAllOrders";

export default function RetailersManagement() {
  const { retailers, isLoading } = useRetailersList();
  const { orders } = useAllOrders();
  const [search, setSearch] = useState("");

  const orderCountByRetailer = useMemo(() => {
    const map = {};
    orders.forEach((order) => {
      map[order.retailerId] = (map[order.retailerId] || 0) + 1;
    });
    return map;
  }, [orders]);

  const filteredRetailers = useMemo(() => {
    if (!search) return retailers;
    const q = search.toLowerCase();
    return retailers.filter(
      (r) =>
        r.name?.toLowerCase().includes(q) ||
        r.companyName?.toLowerCase().includes(q) ||
        r.phone?.toLowerCase().includes(q)
    );
  }, [retailers, search]);

  if (isLoading) {
    return <p className="p-6 text-sm text-gray-400">Loading retailers...</p>;
  }

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-2xl font-bold" style={{ color: "var(--color-gold-800)" }}>
        Retailers Management
      </h1>

      <input
        type="text"
        placeholder="Search by name, company, or phone..."
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
              <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--color-gold-700)" }}>Company</th>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--color-gold-700)" }}>Phone</th>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--color-gold-700)" }}>Area</th>
              <th className="text-center px-4 py-3 font-semibold" style={{ color: "var(--color-gold-700)" }}>Orders</th>
              <th className="text-right px-4 py-3 font-semibold" style={{ color: "var(--color-gold-700)" }}></th>
            </tr>
          </thead>
          <tbody>
            {filteredRetailers.map((retailer, idx) => (
              <tr key={retailer.phone || idx} className="border-t" style={{ borderColor: "var(--color-gold-100)" }}>
                <td className="px-4 py-3 font-medium">{retailer.name}</td>
                <td className="px-4 py-3">{retailer.companyName}</td>
                <td className="px-4 py-3">{retailer.phone}</td>
                <td className="px-4 py-3">{retailer.area}</td>
                <td className="px-4 py-3 text-center">
                  {orderCountByRetailer[retailer.retailerId] || orderCountByRetailer[retailer.phone] || 0}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/retailers/${retailer.retailerId || retailer.phone}`}
                    className="text-xs font-semibold"
                    style={{ color: "var(--color-gold-600)" }}
                  >
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredRetailers.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">No retailers found.</p>
        )}
      </div>
    </div>
  );
}