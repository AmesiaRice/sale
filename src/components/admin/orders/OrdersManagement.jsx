"use client";

import { useState, useMemo } from "react";
import { useAllOrders } from "@/hooks/admin/useAllOrders";
import OrderStatusDropdown from "./OrderStatusDropdown";

export default function OrdersManagement() {
  const { orders, isLoading, updateOrderStatus } = useAllOrders();
  const [search, setSearch] = useState("");
  const [retailerFilter, setRetailerFilter] = useState("");

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch = search
        ? order.orderId.toLowerCase().includes(search.toLowerCase())
        : true;
      const matchesRetailer = retailerFilter
        ? order.retailerId.toLowerCase().includes(retailerFilter.toLowerCase())
        : true;
      return matchesSearch && matchesRetailer;
    });
  }, [orders, search, retailerFilter]);

  if (isLoading) {
    return <p className="p-6 text-sm text-gray-400">Loading orders...</p>;
  }

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-2xl font-bold" style={{ color: "var(--color-gold-800)" }}>
        Orders Management
      </h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search Order ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
          style={{ borderColor: "var(--color-gold-200)" }}
        />
        <input
          type="text"
          placeholder="Filter by Retailer ID..."
          value={retailerFilter}
          onChange={(e) => setRetailerFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
          style={{ borderColor: "var(--color-gold-200)" }}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "var(--color-gold-200)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: "var(--color-gold-50)" }}>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--color-gold-700)" }}>Order ID</th>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--color-gold-700)" }}>Retailer</th>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--color-gold-700)" }}>Date</th>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--color-gold-700)" }}>Items</th>
              <th className="text-right px-4 py-3 font-semibold" style={{ color: "var(--color-gold-700)" }}>Total</th>
              <th className="text-center px-4 py-3 font-semibold" style={{ color: "var(--color-gold-700)" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.orderId} className="border-t" style={{ borderColor: "var(--color-gold-100)" }}>
                <td className="px-4 py-3 font-medium">{order.orderId}</td>
                <td className="px-4 py-3">{order.retailerId}</td>
                <td className="px-4 py-3 text-gray-500">
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN") : "N/A"}
                </td>
                <td className="px-4 py-3">{order.items?.length || 0}</td>
                <td className="px-4 py-3 text-right font-semibold">
                  ₹{Math.round(order.orderTotal || 0).toLocaleString("en-IN")}
                </td>
                <td className="px-4 py-3 text-center">
                  <OrderStatusDropdown
                    orderId={order.orderId}
                    currentStatus={order.status}
                    onUpdate={updateOrderStatus}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredOrders.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">No orders found.</p>
        )}
      </div>
    </div>
  );
}