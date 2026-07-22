import useSWR from "swr";

async function fetchConversations() {
  const res = await fetch("/api/admin/retailer-conversations");
  const data = await res.json();
  return data.success ? data.conversations || [] : [];
}

export function useRetailerConversations() {
  const { data, isLoading, error, mutate } = useSWR(
    "admin-retailer-conversations",
    fetchConversations,
    {
      revalidateOnFocus: false,
      refreshInterval: 60000,
    }
  );

  async function addConversation({ retailerId, retailerName, message, addedBy }) {
    const res = await fetch("/api/admin/retailer-conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ retailerId, retailerName, message, addedBy }),
    });
    const result = await res.json();

    if (result.success) {
      mutate();
    }

    return result;
  }

  return { conversations: data || [], isLoading, error, addConversation };
}
