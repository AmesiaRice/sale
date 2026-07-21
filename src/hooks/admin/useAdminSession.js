import useSWR from "swr";
import { hasPermission } from "@/lib/admin/permission";

async function fetchAdminSession() {
  try {
    const res = await fetch("/api/admin/session");
    const data = await res.json();
    return data.success ? data.admin : null;
  } catch {
    return null;
  }
}

export function useAdminSession() {
  const { data, isLoading, mutate } = useSWR("admin-session", fetchAdminSession, {
    revalidateOnFocus: false,
  });

  const admin = data || null;

  return {
    admin,
    role: admin?.role || null,
    isLoading,
    isLoggedIn: Boolean(admin),
    can: (permission) => hasPermission(admin?.role, permission),
    refresh: mutate,
  };
}