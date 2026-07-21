"use client";

import { useMemo } from "react";
import { useAllOrders } from "@/hooks/admin/useAllOrders";

export default function RetailerDetailPanel({ retailerId }) {
  const { orders, isLoading } = useAllOrders();

  const retailerOrders = useMemo(
    () => orders.filter((o) => o.retailerId === retailerId),
    [orders, retailerId]
  );

  const totalSpend = retailerOrders.reduce((sum, o) => sum + (o.orderTotal || 0), 0);

  if (isLoading) {
    return <p className="p-6 text-sm text-gray-400">Loading...</p>;
  }

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-2xl font-bold" style={{ color: "var(--color-gold-800)" }}>
        Retailer: {retailerId}
      </h1>

      <div className="grid grid-cols-2 gap-4 max-w-md">
        <div className="bg-white rounded-xl p-4 border" style={{ borderColor: "var(--color-gold-200)" }}>
          <p className="text-xs text-gray-500">Total Orders</p>
          <p className="text-xl font-bold" style={{ color: "var(--color-gold-800)" }}>{retailerOrders.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border" style={{ borderColor: "var(--color-gold-200)" }}>
          <p className="text-xs text-gray-500">Total Spend</p>
          <p className="text-xl font-bold" style={{ color: "var(--color-gold-800)" }}>
            ₹{Math.round(totalSpend).toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {retailerOrders.map((order) => (
          <div key={order.orderId} className="bg-white rounded-xl border p-4" style={{ borderColor: "var(--color-gold-200)" }}>
            <div className="flex justify-between text-sm">
              <p className="font-medium">{order.orderId}</p>
              <p className="font-semibold">₹{Math.round(order.orderTotal || 0).toLocaleString("en-IN")}</p>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN") : "N/A"} · {order.items?.length || 0} items
            </p>
          </div>
        ))}
        {retailerOrders.length === 0 && (
          <p className="text-sm text-gray-400">No orders from this retailer yet.</p>
        )}
      </div>
    </div>
  );
}