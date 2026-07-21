"use client";

import { useMemo } from "react";
import { ShoppingBag, IndianRupee, Users } from "lucide-react";
import { useAllOrders } from "@/hooks/admin/useAllOrders";
import StatCard from "./StatCard";
import RecentOrdersList from "./RecentOrdersList";

export default function OverviewDashboard() {
  const { orders, isLoading } = useAllOrders();

  const stats = useMemo(() => {
    const uniqueOrderIds = new Set(orders.map((o) => o.orderId));
    const totalRevenue = orders.reduce((sum, o) => sum + (o.orderTotal || 0), 0) / (uniqueOrderIds.size || 1) * uniqueOrderIds.size;
    // orderTotal already per-order (not per-row), so sum once per unique order:
    const revenue = orders.reduce((sum, o) => sum + (o.orderTotal || 0), 0);
    const uniqueRetailers = new Set(orders.map((o) => o.retailerId));

    return {
      totalOrders: uniqueOrderIds.size,
      totalRevenue: revenue,
      activeRetailers: uniqueRetailers.size,
    };
  }, [orders]);

  if (isLoading) {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="h-8 w-40 bg-gray-200 rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-2xl" />
        ))}
      </div>
      <div className="h-64 bg-gray-200 rounded-2xl" />
    </div>
  );
}

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: "var(--color-gold-800)" }}>
        Overview
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Orders" value={stats.totalOrders} icon={ShoppingBag} />
        <StatCard
          label="Total Revenue"
          value={`₹${Math.round(stats.totalRevenue).toLocaleString("en-IN")}`}
          icon={IndianRupee}
        />
        <StatCard label="Active Retailers" value={stats.activeRetailers} icon={Users} />
      </div>

      <RecentOrdersList orders={orders} />
    </div>
  );
}