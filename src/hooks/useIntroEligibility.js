import useSWR from "swr";

async function fetchUsedIntroIds(retailerId) {
  if (!retailerId) return [];
  try {
    const res = await fetch(`/api/intro-eligibility?retailerId=${encodeURIComponent(retailerId)}`);
    const data = await res.json();
    return data.success ? data.usedIntroIds || [] : [];
  } catch {
    return [];
  }
}

export function useIntroEligibility(retailerId) {
  const { data, isLoading, mutate } = useSWR(
    retailerId ? ["intro-eligibility", retailerId] : null,
    () => fetchUsedIntroIds(retailerId),
    { revalidateOnFocus: false }
  );

  const usedIntroIds = data || [];
  const isEligible = (introId) => !usedIntroIds.includes(String(introId));

  return { isEligible, usedIntroIds, loading: isLoading, refresh: mutate }; // 👈 refresh add kiya
}