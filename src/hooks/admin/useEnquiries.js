import useSWR from "swr";

async function fetchEnquiries() {
  const res = await fetch("/api/admin/enquiries");
  const data = await res.json();
  return data.success ? data.enquiries || [] : [];
}

export function useEnquiries() {
  const { data, isLoading, error } = useSWR("admin-enquiries", fetchEnquiries, {
    revalidateOnFocus: false,
    refreshInterval: 60000,
  });

  return { enquiries: data || [], isLoading, error };
}