"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAdminSession } from "@/hooks/admin/useAdminSession";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Tag,
  Mail,
  PackagePlus,
  LogOut,
} from "lucide-react";

const allLinks = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard, permission: "overview" },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag, permission: "orders" },
  { label: "Retailers", href: "/admin/retailers", icon: Users, permission: "retailers" },
  { label: "Discounts", href: "/admin/discounts", icon: Tag, permission: "discounts" },
  { label: "Enquiries", href: "/admin/enquiries", icon: Mail, permission: "enquiries" },
  { label: "Place Order", href: "/admin/place-order", icon: PackagePlus, permission: "place_order_on_behalf" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, can, refresh } = useAdminSession();

  const visibleLinks = allLinks.filter((link) => can(link.permission));

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    await refresh();
    router.push("/admin/login");
  };

  const isLinkActive = (href) =>
    href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="hidden md:flex w-60 shrink-0 flex-col p-4 h-screen sticky top-0"
        style={{ backgroundColor: "var(--color-gold-900)" }}
      >
        <div className="mb-8 px-2">
          <p
            className="text-sm font-bold"
            style={{ color: "var(--color-gold-400)", fontFamily: "var(--font-display)" }}
          >
            SAIFCO Admin
          </p>
          {admin && (
            <p className="text-[11px] mt-1" style={{ color: "var(--color-gold-400)", opacity: 0.6 }}>
              {admin.name} · {admin.role}
            </p>
          )}
        </div>

        <nav className="flex-1 flex flex-col gap-1">
          {visibleLinks.map(({ label, href, icon: Icon }) => {
            const isActive = isLinkActive(href);
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
                style={{
                  backgroundColor: isActive ? "var(--color-gold-500)" : "transparent",
                  color: isActive ? "#fff" : "var(--color-gold-400)",
                }}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm mt-4"
          style={{ color: "var(--color-gold-400)" }}
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-stretch overflow-x-auto"
        style={{
          backgroundColor: "var(--color-gold-900)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {visibleLinks.map(({ label, href, icon: Icon }) => {
          const isActive = isLinkActive(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 min-w-[64px] flex flex-col items-center justify-center gap-1 py-2"
              style={{ color: isActive ? "var(--color-gold-500)" : "var(--color-gold-400)" }}
            >
              <Icon size={20} />
              <span className="text-[10px] leading-none whitespace-nowrap">{label}</span>
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex-1 min-w-[64px] flex flex-col items-center justify-center gap-1 py-2"
          style={{ color: "var(--color-gold-400)" }}
        >
          <LogOut size={20} />
          <span className="text-[10px] leading-none">Logout</span>
        </button>
      </nav>
    </>
  );
}