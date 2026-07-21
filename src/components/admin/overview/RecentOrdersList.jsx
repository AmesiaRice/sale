export default function RecentOrdersList({ orders }) {
  const recent = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10);

  return (
    <div className="bg-white rounded-2xl border" style={{ borderColor: "var(--color-gold-200)" }}>
      <p className="text-sm font-semibold px-5 py-4 border-b" style={{ borderColor: "var(--color-gold-100)" }}>
        Recent Orders
      </p>
      <div className="divide-y" style={{ borderColor: "var(--color-gold-100)" }}>
        {recent.map((order) => (
          <div key={order.orderId} className="flex items-center justify-between px-5 py-3 text-sm">
            <div>
              <p className="font-medium">{order.orderId}</p>
              <p className="text-xs text-gray-500">{order.retailerId}</p>
            </div>
            <p className="font-semibold">₹{Math.round(order.orderTotal || 0).toLocaleString("en-IN")}</p>
          </div>
        ))}
        {recent.length === 0 && (
          <p className="px-5 py-6 text-sm text-center text-gray-400">No orders yet.</p>
        )}
      </div>
    </div>
  );
}