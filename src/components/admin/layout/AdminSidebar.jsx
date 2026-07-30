"use client";

import { useState } from "react";
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
  Truck,
  LogOut,
  Grid2X2,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const allLinks = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard, permission: "overview" },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag, permission: "orders" },
  { label: "Retailers", href: "/admin/retailers", icon: Users, permission: "retailers" },
  { label: "Discounts", href: "/admin/discounts", icon: Tag, permission: "discounts" },
  { label: "Enquiries", href: "/admin/enquiries", icon: Mail, permission: "enquiries" },
  { label: "Place Order", href: "/admin/place-order", icon: PackagePlus, permission: "place_order_on_behalf" },
  { label: "Dispatch", href: "/admin/dispatch", icon: Truck, permission: "dispatch" },
];

// Mobile bottom bar me sirf itne hi tabs directly dikhenge, baki "More" me
const MOBILE_PRIMARY_COUNT = 4;

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, can, refresh } = useAdminSession();
  const [moreOpen, setMoreOpen] = useState(false);

  const visibleLinks = allLinks.filter((link) => can(link.permission));

  const primaryLinks = visibleLinks.slice(0, MOBILE_PRIMARY_COUNT);
  const overflowLinks = visibleLinks.slice(MOBILE_PRIMARY_COUNT);

  const isLinkActive = (href) =>
    href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);

  const isMoreActive = overflowLinks.some((link) => isLinkActive(link.href));

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    await refresh();
    setMoreOpen(false);
    router.push("/admin/login");
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="hidden md:flex w-60 shrink-0 flex-col p-4 h-screen sticky top-0 print:hidden"
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

      {/* Mobile "More" Bottom Sheet */}
      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMoreOpen(false)}
              className="md:hidden fixed inset-0 z-[60] bg-black/40"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
              className="md:hidden fixed bottom-0 left-0 right-0 z-[61] rounded-t-3xl pb-[env(safe-area-inset-bottom)]"
              style={{ backgroundColor: "var(--color-gold-900)" }}
            >
              <div className="flex items-center justify-between px-5 pt-4 pb-2">
                <p
                  className="text-sm font-semibold tracking-wide"
                  style={{ color: "var(--color-gold-400)" }}
                >
                  More Options
                </p>
                <button
                  onClick={() => setMoreOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "var(--color-gold-800)" }}
                >
                  <X size={16} style={{ color: "var(--color-gold-400)" }} />
                </button>
              </div>

              <div className="px-3 pb-5 pt-1 space-y-1">
                {overflowLinks.map(({ label, href, icon: Icon }) => {
                  const isActive = isLinkActive(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMoreOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl transition-colors"
                      style={{
                        backgroundColor: isActive ? "var(--color-gold-800)" : "transparent",
                      }}
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: "var(--color-gold-800)" }}
                      >
                        <Icon size={17} style={{ color: "var(--color-gold-400)" }} />
                      </div>
                      <span className="text-sm font-medium" style={{ color: "var(--color-gold-400)" }}>
                        {label}
                      </span>
                    </Link>
                  );
                })}

                {/* Logout hamesha "More" ke andar */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors"
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "var(--color-gold-800)" }}
                  >
                    <LogOut size={17} style={{ color: "var(--color-gold-400)" }} />
                  </div>
                  <span className="text-sm font-medium" style={{ color: "var(--color-gold-400)" }}>
                    Logout
                  </span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Nav Bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t pb-[env(safe-area-inset-bottom)] print:hidden"
        style={{
          backgroundColor: "var(--color-gold-900)",
          borderColor: "var(--color-gold-800)",
        }}
        aria-label="Admin navigation"
      >
        <div className="flex items-stretch justify-around h-16">
          {primaryLinks.map(({ label, href, icon: Icon }) => {
            const isActive = isLinkActive(href);
            return (
              <Link
                key={href}
                href={href}
                className="relative flex flex-1 flex-col items-center justify-center gap-0.5 min-w-0 px-1 transition-opacity"
                style={{
                  color: "var(--color-gold-400)",
                  opacity: isActive ? 1 : 0.55,
                }}
              >
                <Icon size={22} strokeWidth={isActive ? 2.25 : 1.75} aria-hidden />
                <span
                  className={`text-[10px] leading-tight truncate max-w-full ${
                    isActive ? "font-semibold" : "font-medium"
                  }`}
                >
                  {label}
                </span>
              </Link>
            );
          })}

          {/* "More" tab — Logout aur baaki links yahan */}
          {(overflowLinks.length > 0 || true) && (
            <button
              onClick={() => setMoreOpen(true)}
              className="relative flex flex-1 flex-col items-center justify-center gap-0.5 min-w-0 px-1 transition-opacity"
              style={{
                color: "var(--color-gold-400)",
                opacity: isMoreActive ? 1 : 0.55,
              }}
            >
              <Grid2X2 size={22} strokeWidth={isMoreActive ? 2.25 : 1.75} aria-hidden />
              <span
                className={`text-[10px] leading-tight truncate max-w-full ${
                  isMoreActive ? "font-semibold" : "font-medium"
                }`}
              >
                More
              </span>
            </button>
          )}
        </div>
      </nav>
    </>
  );
}