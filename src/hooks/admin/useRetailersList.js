import useSWR from "swr";

async function fetchRetailers() {
  const res = await fetch("/api/admin/retailers");
  const data = await res.json();
  return data.success ? data.retailers || [] : [];
}

export function useRetailersList() {
  const { data, isLoading, error } = useSWR("admin-retailers", fetchRetailers, {
    revalidateOnFocus: false,
  });

  return { retailers: data || [], isLoading, error };
}