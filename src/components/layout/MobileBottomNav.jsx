"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, PackageOpen, ShoppingCart, Grid2X2, Mail, Tag, X } from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import { motion, AnimatePresence } from "motion/react";

// Bottom bar mein hamesha visible tabs
const bottomNavItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Products", href: "/products", icon: Package },
  { label: "Orders", href: "/orders", icon: PackageOpen },
  { label: "Cart", href: "/cart", icon: ShoppingCart },
];

// "More" sheet ke andar jo links honge
const moreMenuItems = [
  { label: "Contact Us", href: "/contact", icon: Mail },
  { label: "Discounts", href: "/discounts", icon: Tag },
];

const HIDDEN_PATHS = ["/login", "/registration"];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { cartItems, cartPulse } = useCart();
  const [moreOpen, setMoreOpen] = useState(false);

  const totalCartItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  if (HIDDEN_PATHS.includes(pathname)) {
    return null;
  }

  // "More" tab active dikhega agar current page moreMenuItems mein se ho
  const isMoreActive = moreMenuItems.some(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );

  return (
    <>
      {/* Bottom Sheet — "More" menu */}
      <AnimatePresence>
        {moreOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMoreOpen(false)}
              className="md:hidden fixed inset-0 z-[60] bg-black/40"
            />

            {/* Sheet */}
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
                {moreMenuItems.map(({ label, href, icon: Icon }) => {
                  const isActive = pathname === href || pathname.startsWith(`${href}/`);
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
                      <span
                        className="text-sm font-medium"
                        style={{ color: "var(--color-gold-400)" }}
                      >
                        {label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Nav Bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t pb-[env(safe-area-inset-bottom)]"
        style={{
          backgroundColor: "var(--color-gold-900)",
          borderColor: "var(--color-gold-800)",
        }}
        aria-label="Main navigation"
      >
        <div className="flex items-stretch justify-around h-16">
          {bottomNavItems.map(({ label, href, icon: Icon }) => {
            const isActive =
              href === "/"
                ? pathname === "/"
                : pathname === href || pathname.startsWith(`${href}/`);
            const isCart = label === "Cart";

            return (
              <Link
                key={href}
                href={href}
                className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 min-w-0 px-1 transition-opacity ${
                  isCart && cartPulse
                    ? "ring-2 ring-[--color-gold-500] ring-inset rounded-sm"
                    : ""
                }`}
                style={{
                  color: "var(--color-gold-400)",
                  opacity: isActive ? 1 : 0.55,
                }}
              >
                <span className="relative">
                  <Icon size={22} strokeWidth={isActive ? 2.25 : 1.75} aria-hidden />
                  {isCart && totalCartItems > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ backgroundColor: "var(--color-gold-500)" }}
                    >
                      {totalCartItems > 99 ? "99+" : totalCartItems}
                    </motion.span>
                  )}
                </span>
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

          {/* "More" tab — bottom sheet toggle */}
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
        </div>
      </nav>
    </>
  );
}