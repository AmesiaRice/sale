"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, PackageCheck, Tag, Sparkles } from "lucide-react";

export default function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);

  const formattedDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "N/A";

  const formattedTime = order.createdAt
    ? new Date(order.createdAt).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const itemCount = order.items?.length || 0;

  // Total savings across the whole order (sum of discountPerBag * qty for each item)
  const totalSavings = useMemo(() => {
    if (!order.items) return 0;
    return order.items.reduce(
      (sum, item) => sum + (item.discountPerBag || 0) * (item.quantity || 0),
      0
    );
  }, [order.items]);

  // Short ID for the avatar (last few digits, more readable than full string)
  const shortIdSuffix = order.orderId ? order.orderId.slice(-4) : "····";

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl overflow-hidden"
      style={{
        border: "1px solid var(--color-gold-200)",
        boxShadow: "0 1px 3px rgba(42,33,24,0.04), 0 6px 18px rgba(42,33,24,0.05)",
      }}
    >
      {/* Header — hamesha visible, click karne par expand/collapse */}
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-[#FDF9EF]"
      >
        {/* Order icon avatar */}
        <div
          className="w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0"
          style={{
            background: "linear-gradient(135deg, var(--color-gold-400), var(--color-gold-600))",
          }}
        >
          <PackageCheck size={18} className="text-white" strokeWidth={2.2} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p
              className="text-sm font-bold truncate"
              style={{ color: "var(--color-gold-900)", fontFamily: "var(--font-display)" }}
            >
              #{shortIdSuffix}
            </p>
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "var(--color-gold-100)", color: "var(--color-gold-700)" }}
            >
              {itemCount} item{itemCount !== 1 ? "s" : ""}
            </span>
            {totalSavings > 0 && (
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
                style={{ backgroundColor: "#f0fdf4", color: "#166534" }}
              >
                <Sparkles size={9} />
                Saved ₹{Math.round(totalSavings).toLocaleString("en-IN")}
              </span>
            )}
          </div>

          <p className="text-xs mt-1 truncate" style={{ color: "var(--color-gold-400)" }}>
            {formattedDate} · {formattedTime}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wide" style={{ color: "var(--color-gold-400)" }}>
              Total
            </p>
            <p
              className="text-lg font-bold"
              style={{ color: "var(--color-gold-800)", fontFamily: "var(--font-display)" }}
            >
              ₹{Math.round(order.orderTotal || 0).toLocaleString("en-IN")}
            </p>
          </div>

          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "var(--color-gold-100)" }}
          >
            <ChevronDown size={15} style={{ color: "var(--color-gold-600)" }} />
          </motion.div>
        </div>
      </button>

      {/* Expandable body — items list */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div
              className="px-5 pb-5 pt-3 border-t"
              style={{ borderColor: "var(--color-gold-100)", backgroundColor: "#FEFCF6" }}
            >
              {/* Full Order ID for reference */}
              <p
                className="text-[10px] tracking-wide mb-4 pt-3"
                style={{ color: "var(--color-gold-400)" }}
              >
                ORDER ID: <span style={{ color: "var(--color-gold-600)" }}>{order.orderId}</span>
              </p>

              <div className="space-y-3">
                {order.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-3 bg-white rounded-xl px-4 py-3"
                    style={{ border: "1px solid var(--color-gold-100)" }}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
                        style={{ backgroundColor: "var(--color-gold-50)" }}
                      >
                        🌾
                      </div>

                      <div className="min-w-0">
                        <p
                          className="text-sm font-semibold truncate"
                          style={{ color: "var(--color-gold-900)" }}
                        >
                          {item.skuName}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: "var(--color-gold-100)", color: "var(--color-gold-700)" }}
                          >
                            {item.packSize}
                          </span>
                          <span className="text-[11px]" style={{ color: "var(--color-gold-400)" }}>
                            Qty {item.quantity}
                          </span>
                        </div>

                        {item.discountPerBag > 0 && (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-semibold mt-1.5 px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: "#f0fdf4", color: "#166534" }}
                          >
                            <Tag size={9} />
                            −₹{item.discountPerBag}/bag ({item.discountType})
                          </span>
                        )}
                      </div>
                    </div>

                    <p
                      className="text-sm font-bold shrink-0"
                      style={{ color: "var(--color-gold-800)" }}
                    >
                      ₹{Math.round(item.amount || 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}

                {(!order.items || order.items.length === 0) && (
                  <p className="text-xs py-3 text-center" style={{ color: "var(--color-gold-400)" }}>
                    No item details available.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}