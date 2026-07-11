import useSWR from "swr";

async function fetchRetailerId() {
  try {
    const res = await fetch("/api/session");
    const data = await res.json();
    if (data.success) {
      const user = data.user;
      return user.retailerId || user.retailerID || user.id || "";
    }
    return "";
  } catch {
    return "";
  }
}

// SWR se cache hota hai — Cart, ProductCard, ProductDetailPage sab ek hi
// fetch share karenge, baar-baar /api/session call nahi hoga.
export function useRetailerId() {
  const { data, isLoading } = useSWR("retailer-id", fetchRetailerId, {
    revalidateOnFocus: false,
  });
  return { retailerId: data || "", isLoading };
}