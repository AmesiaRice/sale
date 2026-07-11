"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, Mail, ShoppingCart } from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import { motion } from "motion/react";

const bottomNavItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Products", href: "/products", icon: Package },
  { label: "Contact", href: "/contact", icon: Mail },
  { label: "Discounts", href: "/discounts", icon: Package },
  { label: "Cart", href: "/cart", icon: ShoppingCart },
];

const HIDDEN_PATHS = ["/login", "/registration"];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { cartItems, cartPulse } = useCart();

  const totalCartItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  if (HIDDEN_PATHS.includes(pathname)) {
    return null;
  }

  return (
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
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.25 : 1.75}
                  aria-hidden
                />
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
      </div>
    </nav>
  );
}
