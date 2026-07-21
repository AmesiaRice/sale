"use client";

import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { Flame, Plus, Minus, Check, Sparkles, Gift } from "lucide-react";
import { calculateBestPrice, isLiveFiroOffer } from "@/data/skus";

export default function PlaceOrderProductCard({ variant, onAddToOrder, isIntroEligible }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const pricing = useMemo(() => calculateBestPrice(variant, quantity), [variant, quantity]);

  const liveFiro = useMemo(() => {
    return (variant.firoOffers || []).find(isLiveFiroOffer) || null;
  }, [variant]);

  const introOffer = variant.introOffer;
  const introEligible = introOffer && isIntroEligible ? isIntroEligible(introOffer.introId) : false;

  const handleQtyChange = (delta) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleAdd = (e) => {
    e.stopPropagation();
    onAddToOrder(variant, quantity);
    setAdded(true);
    setQuantity(1);
    setTimeout(() => setAdded(false), 1500);
  };

  const hasDiscount = pricing.discountPerBag > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="relative bg-white overflow-hidden"
      style={{ border: liveFiro ? "1.5px solid #EA580C" : "1px solid #EEE8DA" }}
    >
      {/* Top-right pulsing badge — FIRO */}
      {liveFiro && (
        <motion.div
          className="absolute top-3 right-3 z-20"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <div
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold text-white shadow-md"
            style={{ background: "linear-gradient(135deg, #DC2626, #EA580C)" }}
          >
            <Flame size={10} className="animate-pulse" />
            FLASH
          </div>
        </motion.div>
      )}

      {/* Top-left Introductory Offer badge — bilkul ProductCard.jsx jaisa */}
      {introEligible && (
        <div className="absolute top-3 left-3 z-20">
          <div
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold text-white shadow-md"
            style={{ background: "linear-gradient(135deg, #9333EA, #C026D3)" }}
          >
            <Gift size={10} />
            Intoductory Offer
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between px-5 pt-5 pb-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
          style={{
            background: "linear-gradient(135deg, var(--color-gold-400), var(--color-gold-600))",
            color: "#fff",
            fontFamily: "var(--font-display)",
          }}
        >
          {variant.name?.[0] || "S"}
        </div>
        <span className="text-[9px] font-semibold tracking-[0.14em] uppercase pt-1.5" style={{ color: "#B0A48D" }}>
          {variant.series}
        </span>
      </div>

      {/* Name */}
      <div className="px-5">
        <h3 className="text-base leading-snug break-words" style={{ fontFamily: "var(--font-display)", color: "#2A2118" }}>
          {variant.name}
        </h3>
        <p className="text-[10px] mt-1 tracking-wide" style={{ color: "#B0A48D" }}>
          {variant.packSizes}
        </p>
      </div>

      <div className="mx-5 mt-4 mb-4" style={{ height: "1px", backgroundColor: "#F0E9D8" }} />

      {/* Price */}
      <div className="px-5 flex items-end justify-between gap-2">
        <div>
          <p className="text-[9px] tracking-[0.1em] uppercase mb-0.5" style={{ color: "#B0A48D" }}>
            Dealer Price
          </p>
          <p className="flex items-baseline gap-1.5">
            {hasDiscount && (
              <span className="text-xs line-through" style={{ color: "#C7BCA5" }}>
                ₹{pricing.basePrice.toFixed(0)}
              </span>
            )}
            <span className="text-xl font-semibold" style={{ fontFamily: "var(--font-display)", color: "#2A2118" }}>
              ₹{pricing.finalPrice.toFixed(0)}
            </span>
          </p>
        </div>

        {hasDiscount && (
          <span
            className="flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-full shrink-0"
            style={{ backgroundColor: "#f0fdf4", color: "#166534" }}
          >
            <Sparkles size={9} /> ₹{pricing.discountPerBag} off
          </span>
        )}
      </div>

      {/* Volume/FIRO breakdown */}
      {(pricing.volumeDiscount > 0 || pricing.firoDiscount > 0) && (
        <div className="px-5 mt-2 flex flex-wrap gap-1.5">
          {pricing.volumeDiscount > 0 && (
            <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#EFF6FF", color: "#1D4ED8" }}>
              Volume −₹{pricing.volumeDiscount}
            </span>
          )}
          {pricing.firoDiscount > 0 && (
            <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#FEF2F2", color: "#DC2626" }}>
              Flash −₹{pricing.firoDiscount}
            </span>
          )}
        </div>
      )}

      {/* Intro offer line — bilkul ProductCard.jsx jaisa, exact same wording/styling */}
      {introEligible && (
        <p className="px-5 mt-2 text-[10px] leading-snug" style={{ color: "#9333EA" }}>
          🎁 Order {introOffer.minQty}+ bags & get <strong>{introOffer.gift}</strong> FREE (first order only)
        </p>
      )}

      {/* Next volume tier hint */}
      {Array.isArray(variant.volumeTiers) && variant.volumeTiers.some((t) => t.minQty > quantity) && (
        <p className="px-5 mt-2 text-[10px]" style={{ color: "var(--color-gold-500)" }}>
          💡{" "}
          {(() => {
            const nextTier = variant.volumeTiers.filter((t) => t.minQty > quantity).sort((a, b) => a.minQty - b.minQty)[0];
            return `${nextTier.minQty - quantity} bags aur lein, ₹${nextTier.benefitPerBag}/bag extra discount!`;
          })()}
        </p>
      )}

      {/* Quantity + CTA */}
      <div className="px-5 mt-4 pb-5 flex items-center gap-2">
        <div className="flex items-center shrink-0 rounded-lg" style={{ border: "1px solid #EEE8DA" }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleQtyChange(-1);
            }}
            className="w-7 h-8 flex items-center justify-center hover:bg-[#FAF7F0] cursor-pointer transition rounded-l-lg"
          >
            <Minus size={12} style={{ color: "#5C5343" }} />
          </button>
          <input
            type="number"
            min={1}
            value={quantity}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
            className="w-11 text-center text-xs font-medium outline-none no-spinner"
            style={{ color: "#2A2118" }}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleQtyChange(1);
            }}
            className="w-7 h-8 flex items-center justify-center hover:bg-[#FAF7F0] cursor-pointer transition rounded-r-lg"
          >
            <Plus size={12} style={{ color: "#5C5343" }} />
          </button>
        </div>

        <button
          onClick={handleAdd}
          disabled={added}
          className="flex-1 h-8 text-[11px] font-semibold tracking-wide uppercase transition-colors duration-300 flex items-center justify-center gap-1.5 rounded-lg cursor-pointer disabled:cursor-not-allowed"
          style={{ backgroundColor: added ? "#4A5D3A" : "#2A2118", color: "#F5F0E6" }}
        >
          {added ? (
            <>
              <Check size={12} /> Added
            </>
          ) : (
            "Add to Order"
          )}
        </button>
      </div>
    </motion.div>
  );
}