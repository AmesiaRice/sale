"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import Tilt from "react-parallax-tilt";
import { Flame, Plus, Minus, Check, Sparkles, Tag } from "lucide-react";
import { calculateBestPrice } from "@/data/skus";
import { useCart } from "@/app/context/CartContext";
import { Gift } from "lucide-react"; // Flame, Plus, Minus, Check, Sparkles, Tag ke sath add karein
import { useRetailerId } from "@/hooks/useRetailerId";
import { useIntroEligibility } from "@/hooks/useIntroEligibility";

export default function ProductCard({ variant }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const pricing = useMemo(
    () => calculateBestPrice(variant, quantity),
    [variant, quantity]
  );

  const { retailerId } = useRetailerId();
  const { isEligible } = useIntroEligibility(retailerId);

  const introOffer = variant.introOffer;
  const introEligible = introOffer ? isEligible(introOffer.introId) : false;

  // appliedType: "None" | "Volume" | "FIRO" | "Volume + FIRO"
  const hasFiro = pricing.appliedType.includes("FIRO");
  const hasVolume = pricing.appliedType.includes("Volume");
  const hasDiscount = pricing.discountPerBag > 0;

  // Card ka color state decide karna
  const cardState = hasFiro ? "flash" : hasVolume ? "regular" : "none";

  const cardStyles = {
    flash: {
      border: "1.5px solid #DC2626",
      boxShadow:
        "0 2px 10px rgba(220,38,38,0.25), 0 14px 34px rgba(220,38,38,0.22)",
    },
    regular: {
      border: "1.5px solid #EA7C1E",
      boxShadow:
        "0 2px 8px rgba(234,124,30,0.18), 0 12px 28px rgba(234,124,30,0.16)",
    },
    none: {
      border: "1px solid #EEE8DA",
      boxShadow:
        "0 1px 2px rgba(42,33,24,0.04), 0 8px 24px rgba(42,33,24,0.06)",
    },
  };

  const handleQtyChange = (delta) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleAdd = (e) => {
    e.stopPropagation();
    addToCart({
      id: variant.id,
      name: variant.name,
      skuId: variant.skuId,
      skuCode: variant.skuCode,
      grade: variant.grade,
      packSizes: variant.packSizes,
      mrp: variant.mrp,
      dealerPrice: pricing.finalPrice.toFixed(2),
      quantity,
      appliedDiscount: pricing.discountPerBag,
      appliedType: pricing.appliedType,
      moq: variant.moq,
      offer: variant.offer,
      inStock: variant.inStock,
      grainLength: variant.grainLength,
      moisture: variant.moisture,
      primaryUse: variant.primaryUse,
      description: variant.description,
      image: variant.image || "",
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <Tilt
        tiltMaxAngleX={4}
        tiltMaxAngleY={4}
        glareEnable={true}
        glareMaxOpacity={0.12}
        glareColor="#E8B74A"
        glarePosition="all"
        glareBorderRadius="20px"
        scale={1.02}
        transitionSpeed={1200}
        className="relative bg-white overflow-hidden rounded-2xl"
        style={{
          ...cardStyles[cardState],
          transition: "border 0.3s ease, box-shadow 0.3s ease",
        }}
      >
        {/* Top-right animated badge — flash ko priority */}
        {hasFiro && (
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
        {!hasFiro && hasVolume && (
          <div className="absolute top-3 right-3 z-20">
            <div
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold text-white shadow-md"
              style={{ background: "linear-gradient(135deg, #EA7C1E, #F5A623)" }}
            >
              <Tag size={10} />
              BULK
            </div>
          </div>
        )}

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

        {/* Top strip: kaunse discounts lage hain — dono ek sath bhi ho sakte hain */}
        <AnimatePresence>
          {(hasFiro || hasVolume) && (
            <motion.div
              key="discount-strip"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap items-center gap-1.5 px-5 py-1.5">
                {hasFiro && (
                  <span
                    className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: "#FEF2F2", color: "#B91C1C" }}
                  >
                    <Flame size={9} className="animate-pulse" />
                    Flash Offer Applied
                    {pricing.activeFiro?.benefitPerBag
                      ? ` · ₹${pricing.activeFiro.benefitPerBag} off`
                      : ""}
                  </span>
                )}
                {hasVolume && (
                  <span
                    className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: "#FFF4E8", color: "#B9560A" }}
                  >
                    <Tag size={9} />
                    Bulk Discount Applied
                    {pricing.volumeDiscount
                      ? ` · ₹${pricing.volumeDiscount} off`
                      : ""}
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top: monogram + eyebrow */}
        <div className="relative flex items-start justify-between px-5 pt-5 pb-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
            style={{
              background:
                "linear-gradient(135deg, var(--color-gold-400), var(--color-gold-600))",
              color: "#fff",
              fontFamily: "var(--font-display)",
            }}
          >
            {variant.name?.[0] || "S"}
          </div>
          <span
            className="text-[9px] font-semibold tracking-[0.14em] uppercase pt-1.5"
            style={{ color: "#B0A48D" }}
          >
            {variant.series}
          </span>
        </div>

        {/* Name + SKU */}
        <div className="relative px-5">
          <h3
            className="text-base leading-snug break-words"
            style={{ fontFamily: "var(--font-display)", color: "#2A2118" }}
          >
            {variant.name}
          </h3>
          <p className="text-[10px] mt-1 tracking-wide" style={{ color: "#B0A48D" }}>
           {variant.skuCode}
          </p>
        </div>

        <div
          className="mx-5 mt-4 mb-4"
          style={{ height: "1px", backgroundColor: "#F0E9D8" }}
        />

        {/* Price + savings badge */}
        <div className="relative px-5 flex items-end justify-between gap-2">
          <div>
            <p
              className="text-[9px] tracking-[0.1em] uppercase mb-0.5"
              style={{ color: "#B0A48D" }}
            >
              Dealer Price
            </p>
            <p className="flex items-baseline gap-1.5">
              {hasDiscount && (
                <span className="text-xs line-through" style={{ color: "#C7BCA5" }}>
                  ₹{pricing.basePrice.toFixed(0)}
                </span>
              )}
              <span
                className="text-xl font-semibold"
                style={{ fontFamily: "var(--font-display)", color: "#2A2118" }}
              >
                ₹{pricing.finalPrice.toFixed(0)}
              </span>
            </p>
          </div>
          {hasDiscount && (
            <span
              className="flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-full shrink-0"
              style={{
                backgroundColor: hasFiro ? "#FEF2F2" : "#FFF4E8",
                color: hasFiro ? "#B91C1C" : "#B9560A",
              }}
            >
              <Sparkles size={9} />
              ₹{pricing.discountPerBag} off
            </span>
          )}
        </div>

        {introEligible && (
          <p className="relative px-5 mt-2 text-[10px] leading-snug" style={{ color: "#9333EA" }}>
            🎁 Order {introOffer.minQty}+ bags & get <strong>{introOffer.gift}</strong> FREE (first order only)
          </p>
        )}

        {/* More details link */}
        <div className="relative px-5 mt-2">
          <Link
            href={`/products/${variant.id}`}
            onClick={(e) => e.stopPropagation()}
            className="text-[10px] font-semibold tracking-wide uppercase inline-flex items-center gap-1 transition-all duration-200 hover:gap-1.5"
            style={{ color: "var(--color-gold-600)" }}
          >
            More details →
          </Link>
        </div>

        {/* Quantity + CTA */}
        <div className="relative px-5 mt-4 pb-5 flex items-center gap-2">
          <div
            className="flex items-center shrink-0 rounded-lg"
            style={{ border: "1px solid #EEE8DA" }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleQtyChange(-1);
              }}
              className="w-7 h-8 flex items-center justify-center hover:bg-[#FAF7F0] transition rounded-l-lg"
            >
              <Minus size={12} style={{ color: "#5C5343" }} />
            </button>
            <input
              type="number"
              min={1}
              value={quantity}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
              className="w-9 text-center text-xs font-medium outline-none no-spinner"
              style={{ color: "#2A2118" }}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleQtyChange(1);
              }}
              className="w-7 h-8 flex items-center justify-center hover:bg-[#FAF7F0] transition rounded-r-lg"
            >
              <Plus size={12} style={{ color: "#5C5343" }} />
            </button>
          </div>
          <motion.button
            onClick={handleAdd}
            whileTap={{ scale: 0.96 }}
            className="flex-1 h-8 text-[11px] font-semibold tracking-wide uppercase transition-colors duration-300 flex items-center justify-center gap-1.5 rounded-lg"
            style={{
              backgroundColor: added ? "#4A5D3A" : "#2A2118",
              color: "#F5F0E6",
            }}
          >
            {added ? (
              <motion.span
                key="added"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-1"
              >
                <Check size={12} />
                Added
              </motion.span>
            ) : (
              `Add · ₹${Math.round(pricing.finalPrice * quantity).toLocaleString("en-IN")}`
            )}
          </motion.button>
        </div>
      </Tilt>
    </motion.div>
  );
}