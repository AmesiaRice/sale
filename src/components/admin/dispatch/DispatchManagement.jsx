"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useAllOrders } from "@/hooks/admin/useAllOrders";
import { useDispatch } from "@/hooks/admin/useDispatch";
import { useRetailersList } from "@/hooks/admin/useRetailersList";

const TABS = [
  { key: "pending", label: "Pending" },
  { key: "vehicle-allotted", label: "Vehicle Allotted" },
  { key: "delivered", label: "Delivered" },
];

const PAYMENT_MODES = ["Cash", "UPI", "Bank Transfer", "Cheque", "Credit"];

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function isSameCalendarDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// Delivered tab ke "Today" / date-range filter ke liye — DeliveredAt ko
// diye gaye filter ke against check karta hai.
function matchesDeliveredFilter(deliveredAt, filter) {
  if (!filter || filter.mode === "all") return true;
  if (!deliveredAt) return false;

  const date = new Date(deliveredAt);
  if (isNaN(date.getTime())) return false;

  if (filter.mode === "today") {
    return isSameCalendarDay(date, new Date());
  }

  if (filter.mode === "range") {
    if (filter.from) {
      const from = new Date(filter.from);
      from.setHours(0, 0, 0, 0);
      if (date < from) return false;
    }
    if (filter.to) {
      const to = new Date(filter.to);
      to.setHours(23, 59, 59, 999);
      if (date > to) return false;
    }
    return true;
  }

  return true;
}

export default function DispatchManagement() {
  const [activeTab, setActiveTab] = useState("pending");
  const { orders, isLoading: ordersLoading } = useAllOrders();
  const { dispatchRows, isLoading: dispatchLoading, allotVehicle, markDelivered } = useDispatch();
  const { retailers } = useRetailersList();

  const [vehicleInputs, setVehicleInputs] = useState({});
  const [deliveryInputs, setDeliveryInputs] = useState({});
  const [paymentInputs, setPaymentInputs] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [deliveredFilter, setDeliveredFilter] = useState({ mode: "all", from: "", to: "" });

  const dispatchByOrderId = useMemo(() => {
    const map = {};
    dispatchRows.forEach((row) => {
      if (row.OrderId) map[row.OrderId] = row;
    });
    return map;
  }, [dispatchRows]);

  const retailerById = useMemo(() => {
    const map = {};
    retailers.forEach((r) => {
      if (r.retailerId) map[r.retailerId] = r;
    });
    return map;
  }, [retailers]);

  const pendingOrders = useMemo(
    () => orders.filter((o) => o.status !== "Cancelled" && !dispatchByOrderId[o.orderId]),
    [orders, dispatchByOrderId]
  );

  const vehicleAllottedOrders = useMemo(
    () => orders.filter((o) => dispatchByOrderId[o.orderId]?.DispatchStatus === "Vehicle Allotted"),
    [orders, dispatchByOrderId]
  );

  const deliveredOrders = useMemo(
    () =>
      orders.filter(
        (o) =>
          dispatchByOrderId[o.orderId]?.DispatchStatus === "Delivered" &&
          matchesDeliveredFilter(dispatchByOrderId[o.orderId]?.DeliveredAt, deliveredFilter)
      ),
    [orders, dispatchByOrderId, deliveredFilter]
  );

  const handleAllotVehicle = async (order) => {
    const vehicleNumber = (vehicleInputs[order.orderId] || "").trim();
    const expectedDeliveryAt = deliveryInputs[order.orderId] || "";
    if (!vehicleNumber) {
      alert("Vehicle number daalein.");
      return;
    }
    if (!expectedDeliveryAt) {
      alert("Expected delivery date aur time daalein.");
      return;
    }
    setSavingId(order.orderId);
    const result = await allotVehicle(order, retailerById[order.retailerId], vehicleNumber, expectedDeliveryAt);
    setSavingId(null);
    if (!result.success) alert(result.message || "Failed to allot vehicle");
  };

  const handleMarkDelivered = async (order) => {
    const paymentMode = paymentInputs[order.orderId] || "";
    if (!paymentMode) {
      alert("Payment mode select karein.");
      return;
    }
    setSavingId(order.orderId);
    const result = await markDelivered(order, retailerById[order.retailerId], paymentMode);
    setSavingId(null);
    if (!result.success) alert(result.message || "Failed to mark delivered");
  };

  const isLoading = ordersLoading || dispatchLoading;

  return (
    <div className="p-4 md:p-6 space-y-5">
      <h1 className="text-xl md:text-2xl font-bold" style={{ color: "var(--color-gold-800)" }}>
        Dispatch
      </h1>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="px-4 py-2 rounded-full text-sm font-semibold cursor-pointer"
            style={{
              backgroundColor: activeTab === tab.key ? "var(--color-gold-500)" : "var(--color-gold-100)",
              color: activeTab === tab.key ? "#fff" : "var(--color-gold-700)",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : (
        <>
          {activeTab === "pending" && (
            <PendingTab
              orders={pendingOrders}
              retailerById={retailerById}
              vehicleInputs={vehicleInputs}
              setVehicleInputs={setVehicleInputs}
              deliveryInputs={deliveryInputs}
              setDeliveryInputs={setDeliveryInputs}
              savingId={savingId}
              onAllotVehicle={handleAllotVehicle}
            />
          )}

          {activeTab === "vehicle-allotted" && (
            <VehicleAllottedTab
              orders={vehicleAllottedOrders}
              dispatchByOrderId={dispatchByOrderId}
              retailerById={retailerById}
              paymentInputs={paymentInputs}
              setPaymentInputs={setPaymentInputs}
              savingId={savingId}
              onMarkDelivered={handleMarkDelivered}
              paymentModes={PAYMENT_MODES}
            />
          )}

          {activeTab === "delivered" && (
            <>
              <DeliveredFilterBar filter={deliveredFilter} setFilter={setDeliveredFilter} />
              <DeliveredTab orders={deliveredOrders} dispatchByOrderId={dispatchByOrderId} retailerById={retailerById} />
            </>
          )}
        </>
      )}
    </div>
  );
}

function EmptyState({ text }) {
  return <p className="text-center text-sm text-gray-400 py-8">{text}</p>;
}

// Delivered tab ke upar "Today" aur date-range filter — DeliveredAt ke
// against filter karta hai (kitne order kis din/range mein deliver hue).
function DeliveredFilterBar({ filter, setFilter }) {
  const isToday = filter.mode === "today";
  const isRange = filter.mode === "range";
  const isAll = filter.mode === "all";

  return (
    <div className="bg-white rounded-2xl border p-3 flex flex-wrap items-center gap-2" style={{ borderColor: "var(--color-gold-200)" }}>
      <button
        onClick={() => setFilter({ mode: "all", from: "", to: "" })}
        className="px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer"
        style={{
          backgroundColor: isAll ? "var(--color-gold-500)" : "var(--color-gold-100)",
          color: isAll ? "#fff" : "var(--color-gold-700)",
        }}
      >
        All
      </button>
      <button
        onClick={() => setFilter({ mode: "today", from: "", to: "" })}
        className="px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer"
        style={{
          backgroundColor: isToday ? "var(--color-gold-500)" : "var(--color-gold-100)",
          color: isToday ? "#fff" : "var(--color-gold-700)",
        }}
      >
        Today
      </button>

      <div className="flex items-center gap-2 flex-wrap">
        <label className="text-xs text-gray-500">From</label>
        <input
          type="date"
          value={filter.from}
          onChange={(e) => setFilter((prev) => ({ mode: "range", from: e.target.value, to: prev.to }))}
          className="border rounded-lg px-2 py-1 text-xs"
          style={{ borderColor: "var(--color-gold-200)" }}
        />
        <label className="text-xs text-gray-500">To</label>
        <input
          type="date"
          value={filter.to}
          onChange={(e) => setFilter((prev) => ({ mode: "range", from: prev.from, to: e.target.value }))}
          className="border rounded-lg px-2 py-1 text-xs"
          style={{ borderColor: "var(--color-gold-200)" }}
        />
      </div>

      {isRange && (filter.from || filter.to) && (
        <button
          onClick={() => setFilter({ mode: "all", from: "", to: "" })}
          className="text-xs font-semibold hover:underline cursor-pointer"
          style={{ color: "var(--color-gold-600)" }}
        >
          Clear
        </button>
      )}
    </div>
  );
}

// Retailer ka naam + company + phone (call karne ke liye tel: link) + delivery
// address — teeno tabs mein isi se dikhaya jaata hai, taaki pata ho kahan/kise
// deliver karna hai.
function RetailerInfo({ retailer, fallbackId }) {
  if (!retailer) return <p className="text-sm">{fallbackId}</p>;

  return (
    <div className="min-w-0">
      <p className="font-medium truncate">
        {retailer.name}
        {retailer.companyName ? ` · ${retailer.companyName}` : ""}
      </p>
      {retailer.phone && (
        <a href={`tel:${retailer.phone}`} className="text-xs hover:underline" style={{ color: "var(--color-gold-600)" }}>
          📞 {retailer.phone}
        </a>
      )}
      {retailer.area && <p className="text-xs text-gray-500">📍 {retailer.area}</p>}
    </div>
  );
}

function PendingTab({ orders, retailerById, vehicleInputs, setVehicleInputs, deliveryInputs, setDeliveryInputs, savingId, onAllotVehicle }) {
  if (orders.length === 0) return <EmptyState text="Koi pending order nahi hai." />;

  return (
    <>
      {/* Mobile card list */}
      <div className="space-y-3 md:hidden">
        {orders.map((order) => (
          <div key={order.orderId} className="bg-white rounded-2xl border p-4 space-y-3" style={{ borderColor: "var(--color-gold-200)" }}>
            <div className="min-w-0 space-y-1">
              <p className="text-xs text-gray-400">{order.orderId}</p>
              <RetailerInfo retailer={retailerById[order.retailerId]} fallbackId={order.retailerId} />
            </div>
            <input
              type="text"
              placeholder="Vehicle Number"
              value={vehicleInputs[order.orderId] || ""}
              onChange={(e) => setVehicleInputs((prev) => ({ ...prev, [order.orderId]: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              style={{ borderColor: "var(--color-gold-200)" }}
            />
            <div>
              <label className="text-[10px] uppercase tracking-wide text-gray-400">Expected Delivery</label>
              <input
                type="datetime-local"
                value={deliveryInputs[order.orderId] || ""}
                onChange={(e) => setDeliveryInputs((prev) => ({ ...prev, [order.orderId]: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                style={{ borderColor: "var(--color-gold-200)" }}
              />
            </div>
            <button
              onClick={() => onAllotVehicle(order)}
              disabled={savingId === order.orderId}
              className="w-full text-xs font-semibold px-3 py-2 rounded-lg text-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: "var(--color-gold-500)" }}
            >
              {savingId === order.orderId ? "Saving..." : "Allot Vehicle"}
            </button>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "var(--color-gold-200)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: "var(--color-gold-50)" }}>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--color-gold-700)" }}>Order ID</th>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--color-gold-700)" }}>Retailer &amp; Delivery Address</th>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--color-gold-700)" }}>Vehicle Number</th>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--color-gold-700)" }}>Expected Delivery</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.orderId} className="border-t" style={{ borderColor: "var(--color-gold-100)" }}>
                <td className="px-4 py-3 font-medium">{order.orderId}</td>
                <td className="px-4 py-3">
                  <RetailerInfo retailer={retailerById[order.retailerId]} fallbackId={order.retailerId} />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    placeholder="Vehicle Number"
                    value={vehicleInputs[order.orderId] || ""}
                    onChange={(e) => setVehicleInputs((prev) => ({ ...prev, [order.orderId]: e.target.value }))}
                    className="border rounded-lg px-3 py-1.5 text-sm w-40"
                    style={{ borderColor: "var(--color-gold-200)" }}
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="datetime-local"
                    value={deliveryInputs[order.orderId] || ""}
                    onChange={(e) => setDeliveryInputs((prev) => ({ ...prev, [order.orderId]: e.target.value }))}
                    className="border rounded-lg px-3 py-1.5 text-sm"
                    style={{ borderColor: "var(--color-gold-200)" }}
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => onAllotVehicle(order)}
                    disabled={savingId === order.orderId}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ backgroundColor: "var(--color-gold-500)" }}
                  >
                    {savingId === order.orderId ? "Saving..." : "Allot Vehicle"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function VehicleAllottedTab({ orders, dispatchByOrderId, retailerById, paymentInputs, setPaymentInputs, savingId, onMarkDelivered, paymentModes }) {
  if (orders.length === 0) return <EmptyState text="Koi order 'Vehicle Allotted' stage mein nahi hai." />;

  return (
    <>
      {/* Mobile card list */}
      <div className="space-y-3 md:hidden">
        {orders.map((order) => {
          const dispatch = dispatchByOrderId[order.orderId];
          return (
            <div key={order.orderId} className="bg-white rounded-2xl border p-4 space-y-3" style={{ borderColor: "var(--color-gold-200)" }}>
              <div className="min-w-0 space-y-1">
                <p className="text-xs text-gray-400">{order.orderId}</p>
                <RetailerInfo retailer={retailerById[order.retailerId]} fallbackId={order.retailerId} />
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-gray-600">
                <div><span className="text-gray-400">Vehicle: </span>{dispatch?.VehicleNumber || "—"}</div>
                <div><span className="text-gray-400">Delivery ETA: </span>{formatDateTime(dispatch?.ExpectedDeliveryAt)}</div>
                <div className="col-span-2"><span className="text-gray-400">Vehicle Allotted On: </span>{formatDateTime(dispatch?.VehicleAllottedAt)}</div>
                <div className="col-span-2 flex items-center gap-3">
                  <Link href={`/admin/dispatch/invoice/${order.orderId}/proforma`} target="_blank" className="font-semibold" style={{ color: "var(--color-gold-600)" }}>
                    Proforma Invoice →
                  </Link>
                  {dispatch?.ProformaInvoicePdfLink && (
                    <a href={dispatch.ProformaInvoicePdfLink} target="_blank" rel="noopener noreferrer" className="font-semibold" style={{ color: "var(--color-gold-600)" }}>
                      PDF ↗
                    </a>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={paymentInputs[order.orderId] || ""}
                  onChange={(e) => setPaymentInputs((prev) => ({ ...prev, [order.orderId]: e.target.value }))}
                  className="flex-1 border rounded-lg px-3 py-2 text-sm cursor-pointer"
                  style={{ borderColor: "var(--color-gold-200)" }}
                >
                  <option value="">Payment Mode...</option>
                  {paymentModes.map((mode) => (
                    <option key={mode} value={mode}>{mode}</option>
                  ))}
                </select>
                <button
                  onClick={() => onMarkDelivered(order)}
                  disabled={savingId === order.orderId}
                  className="text-xs font-semibold px-3 py-2 rounded-lg text-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 shrink-0"
                  style={{ backgroundColor: "var(--color-gold-700)" }}
                >
                  {savingId === order.orderId ? "Saving..." : "Mark Delivered"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "var(--color-gold-200)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: "var(--color-gold-50)" }}>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--color-gold-700)" }}>Order ID</th>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--color-gold-700)" }}>Retailer &amp; Delivery Address</th>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--color-gold-700)" }}>Vehicle</th>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--color-gold-700)" }}>Delivery ETA</th>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--color-gold-700)" }}>Vehicle Allotted On</th>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--color-gold-700)" }}>Proforma Invoice</th>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--color-gold-700)" }}>Payment Mode</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const dispatch = dispatchByOrderId[order.orderId];
              return (
                <tr key={order.orderId} className="border-t" style={{ borderColor: "var(--color-gold-100)" }}>
                  <td className="px-4 py-3 font-medium">{order.orderId}</td>
                  <td className="px-4 py-3">
                    <RetailerInfo retailer={retailerById[order.retailerId]} fallbackId={order.retailerId} />
                  </td>
                  <td className="px-4 py-3">{dispatch?.VehicleNumber || "—"}</td>
                  <td className="px-4 py-3">{formatDateTime(dispatch?.ExpectedDeliveryAt)}</td>
                  <td className="px-4 py-3">{formatDateTime(dispatch?.VehicleAllottedAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={`/admin/dispatch/invoice/${order.orderId}/proforma`} target="_blank" className="font-semibold" style={{ color: "var(--color-gold-600)" }}>
                        {dispatch?.ProformaInvoiceNo || "View"} →
                      </Link>
                      {dispatch?.ProformaInvoicePdfLink && (
                        <a href={dispatch.ProformaInvoicePdfLink} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold" style={{ color: "var(--color-gold-600)" }}>
                          PDF ↗
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={paymentInputs[order.orderId] || ""}
                      onChange={(e) => setPaymentInputs((prev) => ({ ...prev, [order.orderId]: e.target.value }))}
                      className="border rounded-lg px-3 py-1.5 text-sm cursor-pointer"
                      style={{ borderColor: "var(--color-gold-200)" }}
                    >
                      <option value="">Select...</option>
                      {paymentModes.map((mode) => (
                        <option key={mode} value={mode}>{mode}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onMarkDelivered(order)}
                      disabled={savingId === order.orderId}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                      style={{ backgroundColor: "var(--color-gold-700)" }}
                    >
                      {savingId === order.orderId ? "Saving..." : "Mark Delivered"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

function DeliveredTab({ orders, dispatchByOrderId, retailerById }) {
  if (orders.length === 0) return <EmptyState text="Abhi tak koi order deliver nahi hua." />;

  return (
    <>
      {/* Mobile card list */}
      <div className="space-y-3 md:hidden">
        {orders.map((order) => {
          const dispatch = dispatchByOrderId[order.orderId];
          return (
            <div key={order.orderId} className="bg-white rounded-2xl border p-4 space-y-3" style={{ borderColor: "var(--color-gold-200)" }}>
              <div className="min-w-0 space-y-1">
                <p className="text-xs text-gray-400">{order.orderId}</p>
                <RetailerInfo retailer={retailerById[order.retailerId]} fallbackId={order.retailerId} />
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-gray-600">
                <div><span className="text-gray-400">Vehicle: </span>{dispatch?.VehicleNumber || "—"}</div>
                <div><span className="text-gray-400">Payment: </span>{dispatch?.PaymentMode || "—"}</div>
                <div className="col-span-2"><span className="text-gray-400">Vehicle Allotted On: </span>{formatDateTime(dispatch?.VehicleAllottedAt)}</div>
                <div className="col-span-2"><span className="text-gray-400">Delivered On: </span>{formatDateTime(dispatch?.DeliveredAt)}</div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Link href={`/admin/dispatch/invoice/${order.orderId}/proforma`} target="_blank" className="font-semibold" style={{ color: "var(--color-gold-600)" }}>
                    Proforma ({dispatch?.ProformaInvoiceNo || "View"}) →
                  </Link>
                  {dispatch?.ProformaInvoicePdfLink && (
                    <a href={dispatch.ProformaInvoicePdfLink} target="_blank" rel="noopener noreferrer" className="font-semibold" style={{ color: "var(--color-gold-600)" }}>
                      PDF ↗
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Link href={`/admin/dispatch/invoice/${order.orderId}/final`} target="_blank" className="font-semibold" style={{ color: "var(--color-gold-600)" }}>
                    Final Invoice ({dispatch?.FinalInvoiceNo || "View"}) →
                  </Link>
                  {dispatch?.FinalInvoicePdfLink && (
                    <a href={dispatch.FinalInvoicePdfLink} target="_blank" rel="noopener noreferrer" className="font-semibold" style={{ color: "var(--color-gold-600)" }}>
                      PDF ↗
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "var(--color-gold-200)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: "var(--color-gold-50)" }}>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--color-gold-700)" }}>Order ID</th>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--color-gold-700)" }}>Retailer &amp; Delivery Address</th>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--color-gold-700)" }}>Vehicle</th>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--color-gold-700)" }}>Payment Mode</th>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--color-gold-700)" }}>Vehicle Allotted On</th>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--color-gold-700)" }}>Delivered On</th>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--color-gold-700)" }}>Proforma Invoice</th>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--color-gold-700)" }}>Final Invoice</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const dispatch = dispatchByOrderId[order.orderId];
              return (
                <tr key={order.orderId} className="border-t" style={{ borderColor: "var(--color-gold-100)" }}>
                  <td className="px-4 py-3 font-medium">{order.orderId}</td>
                  <td className="px-4 py-3">
                    <RetailerInfo retailer={retailerById[order.retailerId]} fallbackId={order.retailerId} />
                  </td>
                  <td className="px-4 py-3">{dispatch?.VehicleNumber || "—"}</td>
                  <td className="px-4 py-3">{dispatch?.PaymentMode || "—"}</td>
                  <td className="px-4 py-3">{formatDateTime(dispatch?.VehicleAllottedAt)}</td>
                  <td className="px-4 py-3">{formatDateTime(dispatch?.DeliveredAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={`/admin/dispatch/invoice/${order.orderId}/proforma`} target="_blank" className="font-semibold" style={{ color: "var(--color-gold-600)" }}>
                        {dispatch?.ProformaInvoiceNo || "View"} →
                      </Link>
                      {dispatch?.ProformaInvoicePdfLink && (
                        <a href={dispatch.ProformaInvoicePdfLink} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold" style={{ color: "var(--color-gold-600)" }}>
                          PDF ↗
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={`/admin/dispatch/invoice/${order.orderId}/final`} target="_blank" className="font-semibold" style={{ color: "var(--color-gold-600)" }}>
                        {dispatch?.FinalInvoiceNo || "View"} →
                      </Link>
                      {dispatch?.FinalInvoicePdfLink && (
                        <a href={dispatch.FinalInvoicePdfLink} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold" style={{ color: "var(--color-gold-600)" }}>
                          PDF ↗
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
