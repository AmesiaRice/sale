import useSWR from "swr";

async function fetchDiscounts(type) {
  const res = await fetch(`/api/admin/discounts?type=${type}`);
  const data = await res.json();
  return data.success ? data.rows || [] : [];
}

export function useDiscountsAdmin(type) {
  const { data, isLoading, mutate } = useSWR(["admin-discounts", type], () => fetchDiscounts(type), {
    revalidateOnFocus: false,
  });

  const createDiscount = async (formData) => {
    const res = await fetch("/api/admin/discounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, action: "create", data: formData }),
    });
    const result = await res.json();
    if (result.success) mutate();
    return result;
  };

  const setStatus = async (id, statusColumnKey, status) => {
    const res = await fetch("/api/admin/discounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, action: "setStatus", data: { id, status } }),
    });
    const result = await res.json();
    if (result.success) mutate();
    return result;
  };

  return { rows: data || [], isLoading, createDiscount, setStatus, refresh: mutate };
}