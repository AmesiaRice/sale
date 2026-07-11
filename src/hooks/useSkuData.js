import useSWR from "swr";
import { getSkuLines } from "@/data/skus";

const SWR_KEY = "sku-lines";

export function useSkuData() {
  const { data, error, isLoading, mutate } = useSWR(SWR_KEY, getSkuLines, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    refreshInterval: 30000,
    dedupingInterval: 5000,
    keepPreviousData: true,
  });

  return {
    skuLines: data || [],
    isLoading,
    error,
    refresh: mutate,
  };
}