"use client";

import Navlink from "./Navlink";
import { useCart } from "@/app/context/CartContext";
import { useState, useEffect } from "react";
import { motion } from "motion/react";

const navlinks = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Contact", href: "/contact" },
  { label: "Cart", href: "/cart" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { cartItems, cartPulse } = useCart();

  const totalCartItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`px-4 sm:px-6 flex items-center justify-between sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled ? "py-2 backdrop-blur-md bg-[--color-gold-900]/90 shadow-lg" : "py-3"
      }`}
      style={{
        backgroundColor: "var(--color-gold-900)",
        borderColor: "var(--color-gold-800)",
      }}
    >
      {/* Logo */}
      <Navlink href="/" className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div
          className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full flex items-center justify-center text-lg sm:text-xl shadow-md"
          style={{ backgroundColor: "var(--color-gold-500)" }}
        >
          🌾
        </div>
        <div className="min-w-0">
          <p
            className="font-semibold text-sm sm:text-base leading-tight truncate"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-gold-400)",
            }}
          >
            Saifco Basmati Rice
          </p>
          <p
            className="hidden sm:block text-[10px] tracking-widest truncate"
            style={{ color: "var(--color-gold-400)", opacity: 0.6 }}
          >
            MANUFACTURER · EXPORTER · SUPPLIER
          </p>
        </div>
      </Navlink>

      {/* Desktop nav only — mobile uses bottom bar */}
      <div className="hidden md:flex items-center gap-6">
        {navlinks.map(({ label, href }) => (
          <Navlink
            key={label}
            href={href}
            className={`relative text-sm transition-colors ${
              label === "Cart" && cartPulse
                ? "ring-2 ring-[--color-gold-500] ring-offset-2 ring-offset-[--color-gold-900] rounded-md px-1 -mx-1"
                : ""
            }`}
            style={{
              color: "var(--color-gold-400)",
            }}
          >
            <span>{label}</span>

            {label === "Cart" && totalCartItems > 0 && (
              <motion.span
                className="absolute -top-2 -right-4 min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                style={{ backgroundColor: "var(--color-gold-500)" }}
              >
                {totalCartItems}
              </motion.span>
            )}
          </Navlink>
        ))}
      </div>
    </nav>
  );
}
