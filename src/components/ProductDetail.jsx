"use client";

import { useCart } from "@/app/context/CartContext";
import { useState, useMemo } from "react";
import { calculateBestPrice, isLiveFiroOffer } from "@/data/skus";

export default function ProductDetail({
  skuLine,
  variant,
  onVariantSelect,
  loading = false,
}) {
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const liveFiroOffers = useMemo(() => {
    const offers = [];
    (skuLine?.variants || []).forEach((v) => {
      (v.firoOffers || []).forEach((offer) => {
        if (isLiveFiroOffer(offer)) {
          offers.push({ ...offer, variantName: v.name, variantId: v.id });
        }
      });
    });
    return offers;
  }, [skuLine]);

  const pricing = useMemo(() => {
    if (!variant) {
      return {
        basePrice: 0,
        finalPrice: 0,
        discountPerBag: 0,
        volumeDiscount: 0,
        firoDiscount: 0,
        appliedType: "None",
      };
    }
    return calculateBestPrice(variant, quantity);
  }, [variant, quantity]);

  if (loading || !variant) {
    return (
      <div className="p-4 sm:p-5 md:p-6 flex flex-col gap-5 animate-pulse">
        <div className="h-3 w-40 rounded bg-gray-200" />

        <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
          <div className="flex-1">
            <div className="h-8 w-52 rounded bg-gray-200 mb-3" />
            <div className="h-3 w-36 rounded bg-gray-200" />
          </div>
          <div className="h-8 w-28 rounded-full bg-gray-200" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="rounded-xl border p-4 min-h-[90px] bg-gray-100">
              <div className="h-3 w-16 mx-auto rounded bg-gray-200 mb-3" />
              <div className="h-5 w-24 mx-auto rounded bg-gray-300" />
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-gray-100 p-4 space-y-3">
          <div className="h-3 w-full rounded bg-gray-200" />
          <div className="h-3 w-[90%] rounded bg-gray-200" />
          <div className="h-3 w-[80%] rounded bg-gray-200" />
        </div>

        <div>
          <div className="h-3 w-32 rounded bg-gray-200 mb-4" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-10 w-28 rounded-lg bg-gray-200" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const handleQtyChange = (delta) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleAdd = () => {
    addToCart({
      id: variant.id,
      name: variant.name,
      skuId: variant.skuId,
      skuCode: variant.skuCode,
      grade: variant.grade,
      packSizes: variant.packSizes,
      mrp: variant.mrp,
      dealerPrice: pricing.finalPrice.toFixed(2),
      quantity: quantity,
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

  const specs = [
    { label: "MRP", value: variant.mrp != null ? `₹${variant.mrp}` : "N/A" },
    { label: "Pack Size", value: variant.packSizes },
    { label: "Dealer Price/ Bag", value: variant.dealerPrice != null ? `₹${(variant.dealerPrice).toFixed(2)}` : "N/A" },
    { label: "Consumer Price/ Bag", value: variant.consumerPriceBag != null ? `₹${variant.consumerPriceBag}` : "N/A" },
    {
      label: "Your Margin/Bag",
      value:
        variant.consumerPriceBag != null && variant.dealerPrice != null
          ? `₹${(variant.consumerPriceBag - variant.dealerPrice).toFixed(2)}`
          : "N/A",
    },
    {
  label: "Rate / KG",
  value:
    variant.dealerPricePerKg != null && !isNaN(Number(variant.dealerPricePerKg))
      ? `₹${Number(variant.dealerPricePerKg).toFixed(2)}`
      : "N/A",
},
  ];

  return (
    <div
      className="p-4 sm:p-5 md:p-6 flex flex-col gap-4 sm:gap-5"
      style={{ backgroundColor: "#fff", animation: "fadeIn 0.3s ease-in-out" }}
    >
      {/* Scrollable Live Discount Banner */}
      {liveFiroOffers.length > 0 && (
        <div
          className="relative overflow-hidden rounded-xl"
          style={{ background: "linear-gradient(90deg, #b91c1c, #ea580c, #b91c1c)" }}
        >
          <div className="marquee-track flex items-center gap-8 py-2.5 whitespace-nowrap">
            {[...liveFiroOffers, ...liveFiroOffers].map((offer, idx) => (
              <span
                key={`${offer.firoId}-${idx}`}
                className="text-white text-xs sm:text-sm font-semibold flex items-center gap-2 px-2"
              >
                🔥 {offer.firoName} — {offer.variantName}: Flat ₹{offer.benefitPerBag}/bag off on {offer.minQty}+ bags!
              </span>
            ))}
          </div>

          <style jsx>{`
            .marquee-track {
              width: max-content;
              animation: marquee-scroll 22s linear infinite;
            }
            @keyframes marquee-scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
          `}</style>
        </div>
      )}

      {/* Breadcrumb */}
      <p className="text-[10px] sm:text-xs break-words leading-relaxed" style={{ color: "var(--color-gold-400)" }}>
        Products › {skuLine.name} ›{" "}
        <span style={{ color: "var(--color-gold-500)", fontWeight: 600 }}>{variant.name}</span>
      </p>

      {/* Title row */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
        <div className="min-w-0">
          <h2
            className="text-xl sm:text-2xl md:text-3xl font-semibold break-words"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-gold-900)" }}
          >
            {variant.name}
          </h2>

          <p className="text-[10px] sm:text-xs mt-1 leading-relaxed break-words font-black text-orange-600">
            SKU Code: {variant.skuCode}
            <span className="hidden sm:inline"> &nbsp;|&nbsp; {variant.grade}</span>
            <span className="sm:hidden block mt-1">Grade: {variant.grade}</span>
          </p>
        </div>

        <button
          onClick={handleAdd}
          className="w-full sm:w-auto text-white text-sm font-semibold px-5 py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          style={{ backgroundColor: "var(--color-gold-500)" }}
        >
          {added ? "✓ Added" : "Add To Cart"}
        </button>

        <span
          className="text-[11px] sm:text-xs font-semibold px-3 py-1.5 rounded-md w-fit shrink-0"
          style={{
            backgroundColor: variant.inStock ? "#f0fdf4" : "#fef2f2",
            color: variant.inStock ? "#166534" : "#dc2626",
          }}
        >
          {variant.inStock ? "✓ In Stock" : "✕ Out of Stock"}
        </span>
      </div>

      {/* Spec cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
        {specs.map(({ label, value }) => (
          <div
            key={label}
            className="rounded-lg p-3 sm:p-4 text-center border min-h-[90px] flex flex-col justify-center"
            style={{ backgroundColor: "var(--color-gold-100)", borderColor: "var(--color-gold-200)" }}
          >
            <p className="text-[10px] sm:text-xs mb-1" style={{ color: "var(--color-gold-400)" }}>
              {label}
            </p>
            <p
              className="text-sm sm:text-base md:text-lg font-semibold break-words"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-gold-900)" }}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Quantity Selector + Live Price */}
      <div
        className="rounded-xl border p-4 flex flex-col gap-3"
        style={{ backgroundColor: "var(--color-gold-50)", borderColor: "var(--color-gold-200)" }}
      >
        <div className="flex items-center justify-between flex-wrap gap-3">
          <p className="text-xs sm:text-sm font-semibold" style={{ color: "var(--color-gold-900)" }}>
            Select Quantity (Bags)
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleQtyChange(-1)}
              className="w-8 h-8 rounded-md font-bold text-sm"
              style={{ backgroundColor: "var(--color-gold-200)", color: "var(--color-gold-900)" }}
            >
              −
            </button>

            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
              className="w-16 text-center rounded-md border py-1.5 text-sm font-semibold"
              style={{ borderColor: "var(--color-gold-300)" }}
            />

            <button
              onClick={() => handleQtyChange(1)}
              className="w-8 h-8 rounded-md font-bold text-sm"
              style={{ backgroundColor: "var(--color-gold-200)", color: "var(--color-gold-900)" }}
            >
              +
            </button>
          </div>
        </div>

        <div
          className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t"
          style={{ borderColor: "var(--color-gold-200)" }}
        >
          <div>
            <p className="text-[10px] sm:text-xs" style={{ color: "var(--color-gold-400)" }}>
              Price per Bag
            </p>
            <p className="flex items-center gap-2">
              {pricing.discountPerBag > 0 && (
                <span className="text-xs sm:text-sm line-through text-gray-400">
                  ₹{(pricing.basePrice).toFixed(2)}
                </span>
              )}
              <span className="text-lg sm:text-xl font-bold" style={{ color: "var(--color-gold-900)" }}>
                ₹{(pricing.finalPrice).toFixed(2)}
              </span>
            </p>
          </div>

          {/* 👇 Volume aur FIRO ab ALAG-ALAG badges mein dikhenge */}
          {pricing.discountPerBag > 0 && (
            <div className="flex flex-col gap-1.5 items-start sm:items-end">
              {pricing.volumeDiscount > 0 && (
                <span
                  className="text-[11px] sm:text-xs font-bold px-3 py-1.5 rounded-md"
                  style={{ backgroundColor: "#f0fdf4", color: "#166534" }}
                >
                  📦 Volume Discount: ₹{pricing.volumeDiscount}/bag OFF
                </span>
              )}

              {pricing.firoDiscount > 0 && (
                <span
                  className="text-[11px] sm:text-xs font-bold px-3 py-1.5 rounded-md"
                  style={{ backgroundColor: "#fef2f2", color: "#dc2626" }}
                >
                  🔥 FIRO Flash Discount: ₹{pricing.firoDiscount}/bag OFF
                </span>
              )}
            </div>
          )}

          <div className="text-right">
            <p className="text-[10px] sm:text-xs" style={{ color: "var(--color-gold-400)" }}>
              Total ({quantity} bags)
            </p>
            <p className="text-base sm:text-lg font-bold" style={{ color: "var(--color-gold-900)" }}>
              ₹{Math.round(pricing.finalPrice * quantity).toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {Array.isArray(variant.volumeTiers) &&
          variant.volumeTiers.some((t) => t.minQty > quantity) && (
            <p className="text-[10px] sm:text-xs pt-1" style={{ color: "var(--color-gold-500)" }}>
              💡{" "}
              {(() => {
                const nextTier = variant.volumeTiers
                  .filter((t) => t.minQty > quantity)
                  .sort((a, b) => a.minQty - b.minQty)[0];
                return `${nextTier.minQty - quantity} bags aur order karein aur ₹${nextTier.benefitPerBag}/bag discount paayein!`;
              })()}
            </p>
          )}
      </div>

      {/* Description */}
      <div
        className="px-3 sm:px-4 py-3 rounded-r-md"
        style={{ backgroundColor: "var(--color-gold-50)", borderLeft: "4px solid var(--color-gold-500)" }}
      >
        <p className="text-sm sm:text-[15px] leading-relaxed" style={{ color: "var(--color-gold-700)" }}>
          {variant.description}
        </p>
      </div>

      {/* Sub-variant switcher */}
      <div>
        <p className="text-[10px] sm:text-[11px] tracking-widest font-semibold mb-3" style={{ color: "var(--color-gold-400)" }}>
          SWITCH SUB-VARIANT
        </p>

        <div className="flex flex-wrap gap-2">
          {skuLine.variants.map((v) => (
            <button
              key={v.id}
              onClick={() => onVariantSelect(v.id)}
              className="px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 break-words max-w-full"
              style={{
                backgroundColor: v.id === variant.id ? "var(--color-gold-500)" : "var(--color-gold-100)",
                color: v.id === variant.id ? "#fff" : "var(--color-gold-700)",
                border: v.id === variant.id ? "none" : "1px solid var(--color-gold-200)",
              }}
            >
              {v.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}