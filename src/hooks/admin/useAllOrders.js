import useSWR from "swr";

async function fetchAllOrders() {
  const res = await fetch("/api/admin/orders");
  const data = await res.json();
  return data.success ? data.orders || [] : [];
}

export function useAllOrders() {
  const { data, isLoading, error, mutate } = useSWR("admin-all-orders", fetchAllOrders, {
    refreshInterval: 60000,
    revalidateOnFocus: false,
    dedupingInterval: 30000,
  });

  const updateOrderStatus = async (orderId, status) => {
    const res = await fetch("/api/admin/orders/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status }),
    });
    const result = await res.json();

    if (result.success) {
      mutate(); // list ko refresh karo taaki naya status dikhe
    }

    return result;
  };

  return { orders: data || [], isLoading, error, refresh: mutate, updateOrderStatus };
}