"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";

export default function CartToast({ toast, onDismiss }) {
  return (
    <div className="fixed top-20 right-4 z-[100] pointer-events-none">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id + Date.now()}
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto w-[min(100vw-2rem,320px)] rounded-2xl border shadow-xl overflow-hidden"
            style={{
              backgroundColor: "var(--color-gold-50)",
              borderColor: "var(--color-gold-200)",
            }}
            role="status"
            aria-live="polite"
          >
            <div
              className="h-1"
              style={{ backgroundColor: "var(--color-gold-500)" }}
            />
            <div className="p-4 flex gap-3 items-start">
              <span
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                style={{ backgroundColor: "var(--color-gold-500)/15" }}
              >
                ✓
              </span>
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-semibold"
                  style={{ color: "var(--color-gold-900)" }}
                >
                  Added to cart
                </p>
                <p
                  className="text-xs mt-0.5 truncate"
                  style={{ color: "var(--color-gold-700)" }}
                >
                  {toast.name}
                </p>
                <Link
                  href="/cart"
                  onClick={onDismiss}
                  className="inline-block mt-2 text-xs font-semibold underline-offset-2 hover:underline"
                  style={{ color: "var(--color-gold-500)" }}
                >
                  View cart →
                </Link>
              </div>
              <button
                type="button"
                onClick={onDismiss}
                className="text-lg leading-none opacity-50 hover:opacity-100"
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}