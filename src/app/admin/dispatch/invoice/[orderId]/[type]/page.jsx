"use client";

import { useParams } from "next/navigation";
import { useMemo } from "react";
import { useAllOrders } from "@/hooks/admin/useAllOrders";
import { useDispatch } from "@/hooks/admin/useDispatch";
import { useRetailersList } from "@/hooks/admin/useRetailersList";
import { Printer } from "lucide-react";

export default function InvoicePage() {
  const params = useParams();
  const orderId = decodeURIComponent(params.orderId);
  const type = params.type === "final" ? "final" : "proforma";

  const { orders, isLoading: ordersLoading } = useAllOrders();
  const { dispatchRows, isLoading: dispatchLoading } = useDispatch();
  const { retailers } = useRetailersList();

  const order = useMemo(() => orders.find((o) => o.orderId === orderId), [orders, orderId]);
  const dispatch = useMemo(() => dispatchRows.find((r) => r.OrderId === orderId), [dispatchRows, orderId]);
  const retailer = useMemo(
    () => retailers.find((r) => r.retailerId === order?.retailerId),
    [retailers, order]
  );

  if (ordersLoading || dispatchLoading) {
    return <p className="p-6 text-sm text-gray-400">Loading...</p>;
  }

  if (!order) {
    return <p className="p-6 text-sm" style={{ color: "#8A2A1F" }}>Order not found.</p>;
  }

  const invoiceNo = type === "final" ? dispatch?.FinalInvoiceNo : dispatch?.ProformaInvoiceNo;
  const invoiceDate = type === "final" ? dispatch?.DeliveredAt : dispatch?.VehicleAllottedAt;
  const items = order.items || [];
  const grandTotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto p-6 sm:p-10">
        {/* Print button — print:hidden so it doesn't show up in the printed output */}
        <div className="flex justify-end mb-6 print:hidden">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg text-white cursor-pointer"
            style={{ backgroundColor: "var(--color-gold-500)" }}
          >
            <Printer size={16} />
            Print / Save as PDF
          </button>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between border-b pb-6 mb-6" style={{ borderColor: "#E8E1D4" }}>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#2A2118", fontFamily: "var(--font-display)" }}>
              Saifco Basmati Rice
            </h1>
            <p className="text-xs text-gray-500 mt-1">Amasia Multigrain Pvt. Ltd. · Haryana, India</p>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-bold uppercase tracking-wide" style={{ color: "var(--color-gold-700)" }}>
              {type === "final" ? "Tax Invoice" : "Proforma Invoice"}
            </h2>
            <p className="text-sm text-gray-600 mt-1">{invoiceNo || "—"}</p>
            <p className="text-xs text-gray-400">
              {invoiceDate ? new Date(invoiceDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
            </p>
          </div>
        </div>

        {/* Bill To + Order/Vehicle info */}
        <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">Bill To</p>
            <p className="font-semibold" style={{ color: "#2A2118" }}>{retailer?.name || order.retailerId}</p>
            {retailer?.companyName && <p className="text-gray-600">{retailer.companyName}</p>}
            {retailer?.phone && <p className="text-gray-600">{retailer.phone}</p>}
            {retailer?.area && <p className="text-gray-600">{retailer.area}</p>}
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">Order Details</p>
            <p className="text-gray-600">Order ID: {order.orderId}</p>
            {dispatch?.VehicleNumber && <p className="text-gray-600">Vehicle Number: {dispatch.VehicleNumber}</p>}
            {type === "final" && dispatch?.PaymentMode && (
              <p className="text-gray-600">Payment Mode: {dispatch.PaymentMode}</p>
            )}
          </div>
        </div>

        {/* Items table */}
        <table className="w-full text-sm mb-8">
          <thead>
            <tr className="border-b-2" style={{ borderColor: "#2A2118" }}>
              <th className="text-left py-2 font-semibold" style={{ color: "#2A2118" }}>SKU</th>
              <th className="text-left py-2 font-semibold" style={{ color: "#2A2118" }}>Pack Size</th>
              <th className="text-right py-2 font-semibold" style={{ color: "#2A2118" }}>Qty</th>
              <th className="text-right py-2 font-semibold" style={{ color: "#2A2118" }}>Rate</th>
              <th className="text-right py-2 font-semibold" style={{ color: "#2A2118" }}>Discount</th>
              <th className="text-right py-2 font-semibold" style={{ color: "#2A2118" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const qty = Number(item.quantity) || 0;
              const amount = Number(item.amount) || 0;
              const rate = qty > 0 ? amount / qty : 0;
              return (
                <tr key={idx} className="border-b" style={{ borderColor: "#E8E1D4" }}>
                  <td className="py-2">{item.skuName}</td>
                  <td className="py-2">{item.packSize}</td>
                  <td className="py-2 text-right">{qty}</td>
                  <td className="py-2 text-right">₹{rate.toFixed(2)}</td>
                  <td className="py-2 text-right">
                    {item.discountPerBag > 0 ? `−₹${item.discountPerBag}/bag` : "—"}
                  </td>
                  <td className="py-2 text-right">₹{amount.toLocaleString("en-IN")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Total */}
        <div className="flex justify-end mb-10">
          <div className="w-56">
            <div className="flex justify-between py-2 border-t-2 text-base font-bold" style={{ borderColor: "#2A2118", color: "#2A2118" }}>
              <span>Grand Total</span>
              <span>₹{grandTotal.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400">
          {type === "final" ? "Thank you for your business." : "This is a Proforma Invoice — not a demand for payment."}
        </p>
      </div>
    </div>
  );
}
