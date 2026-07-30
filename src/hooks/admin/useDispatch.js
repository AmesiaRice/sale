import useSWR from "swr";
import { useAllOrders } from "./useAllOrders";

async function fetchDispatchRows() {
  const res = await fetch("/api/admin/dispatch");
  const data = await res.json();
  return data.success ? data.rows || [] : [];
}

export function useDispatch() {
  const { data, isLoading, mutate } = useSWR("admin-dispatch", fetchDispatchRows, {
    revalidateOnFocus: false,
    refreshInterval: 30000,
  });

  // Order ka apna Status bhi "Delivered" rakhne ke liye — dono jagah sync rahein
  const { updateOrderStatus } = useAllOrders();

  // PDF banana slow hai (Doc -> PDF -> Drive upload -> share, kai second).
  // Isliye ye call allotVehicle/markDelivered ke SUCCESS ke baad, bina await
  // kiye (fire-and-forget) bhejte hain — button turant free ho jaata hai,
  // aur PDF link kuch second baad khud-ba-khud (mutate() se) dikh jaata hai.
  function fireGenerateInvoicePdf(payload) {
    fetch("/api/admin/dispatch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "generateInvoicePdf", data: payload }),
    })
      .then(() => mutate())
      .catch(() => {});
  }

  // order = full order object (orderId, retailerId, items, orderTotal — jo
  // useAllOrders() se pehle se available hai). retailer = { name,
  // companyName, phone, area } — dono PDF invoice banane ke liye chahiye.
  const allotVehicle = async (order, retailer, vehicleNumber, expectedDeliveryAt) => {
    const res = await fetch("/api/admin/dispatch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "allotVehicle",
        data: { orderId: order.orderId, retailerId: order.retailerId, vehicleNumber, expectedDeliveryAt },
      }),
    });
    const result = await res.json();
    if (result.success) {
      mutate();
      fireGenerateInvoicePdf({
        orderId: order.orderId,
        type: "proforma",
        invoiceNo: result.proformaInvoiceNo,
        retailer,
        items: order.items || [],
        orderTotal: order.orderTotal,
        vehicleNumber,
      });
    }
    return result;
  };

  const markDelivered = async (order, retailer, paymentMode) => {
    const res = await fetch("/api/admin/dispatch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "markDelivered", data: { orderId: order.orderId, paymentMode } }),
    });
    const result = await res.json();
    if (result.success) {
      mutate();
      await updateOrderStatus(order.orderId, "Delivered");
      fireGenerateInvoicePdf({
        orderId: order.orderId,
        type: "final",
        invoiceNo: result.finalInvoiceNo,
        retailer,
        items: order.items || [],
        orderTotal: order.orderTotal,
        paymentMode,
      });
    }
    return result;
  };

  return { dispatchRows: data || [], isLoading, allotVehicle, markDelivered, refresh: mutate };
}
