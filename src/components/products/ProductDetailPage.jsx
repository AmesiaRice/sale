"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSkuData } from "@/hooks/useSkuData";
import { calculateBestPrice, isLiveFiroOffer } from "@/data/skus";
import { useCart } from "@/app/context/CartContext";
import { ArrowLeft, Flame, Plus, Minus, Check, Package } from "lucide-react";

export default function ProductDetailPage({ productId }) {
  const router = useRouter();
  const { skuLines, isLoading } = useSkuData();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const { variant, skuLine } = useMemo(() => {
    for (const line of skuLines) {
      const found = line.variants?.find((v) => v.id === productId);
      if (found) return { variant: found, skuLine: line };
    }
    return { variant: null, skuLine: null };
  }, [skuLines, productId]);

  const pricing = useMemo(() => {
    if (!variant) {
      return { basePrice: 0, finalPrice: 0, discountPerBag: 0, volumeDiscount: 0, firoDiscount: 0 };
    }
    return calculateBestPrice(variant, quantity);
  }, [variant, quantity]);

  const liveFiro = useMemo(() => {
    if (!variant) return null;
    return (variant.firoOffers || []).find(isLiveFiroOffer) || null;
  }, [variant]);

  const volumeTiers = useMemo(() => {
    if (!variant || !Array.isArray(variant.volumeTiers)) return [];
    return [...variant.volumeTiers].sort((a, b) => a.minQty - b.minQty);
  }, [variant]);

  if (isLoading && !variant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm" style={{ color: "var(--color-gold-500)" }}>Loading...</p>
      </div>
    );
  }

  if (!variant) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-sm" style={{ color: "#8A2A1F" }}>Product not found.</p>
        <button
          onClick={() => router.push("/products")}
          className="text-xs font-semibold uppercase tracking-wide"
          style={{ color: "var(--color-gold-600)" }}
        >
          ← Back to Products
        </button>
      </div>
    );
  }

  const consumerPrice =
    variant.consumerPriceBag != null && !isNaN(Number(variant.consumerPriceBag))
      ? Number(variant.consumerPriceBag)
      : null;

  const dealerPriceNum =
    variant.dealerPrice != null && !isNaN(Number(variant.dealerPrice))
      ? Number(variant.dealerPrice)
      : null;

  const margin =
    consumerPrice != null && dealerPriceNum != null
      ? (consumerPrice - dealerPriceNum).toFixed(2)
      : null;

  const ratePerKg =
    variant.dealerPricePerKg != null && !isNaN(Number(variant.dealerPricePerKg))
      ? Number(variant.dealerPricePerKg).toFixed(2)
      : null;

  const handleQtyChange = (delta) => setQuantity((prev) => Math.max(1, prev + delta));

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
    <div className="min-h-screen" style={{ backgroundColor: "#FDFBF7" }}>
      <div className="max-w-4xl mx-auto px-6 sm:px-10 py-10">
        {/* Back link */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide mb-8"
          style={{ color: "#9A8F7A" }}
        >
          <ArrowLeft size={14} /> Back
        </button>

        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <span
            className="text-[10px] font-semibold tracking-[0.15em] uppercase"
            style={{ color: "#9A8F7A" }}
          >
            {skuLine?.name}
          </span>

          <span
            className="text-[10px] inline-flex items-center gap-1"
            style={{ color: variant.inStock ? "#4A5D3A" : "#8A2A1F" }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: variant.inStock ? "#4A5D3A" : "#8A2A1F" }}
            />
            {variant.inStock ? "In Stock" : "Out of Stock"}
          </span>
        </div>

        <h1
          className="text-3xl sm:text-4xl leading-tight mb-2"
          style={{ fontFamily: "var(--font-display)", color: "#2A2118" }}
        >
          {variant.name}
        </h1>

        <p className="text-xs tracking-wide mb-8" style={{ color: "#B0A48D" }}>
          {variant.skuCode} · {variant.packSizes} · {variant.grade}
        </p>

        {/* FIRO banner */}
        {liveFiro && (
          <div
            className="rounded-lg px-5 py-3.5 mb-8 flex items-center gap-3 text-white"
            style={{ background: "linear-gradient(90deg, #8A2A1F, #B84A2E)" }}
          >
            <Flame size={18} className="shrink-0" />
            <p className="text-sm font-semibold">
              {liveFiro.firoName}: Flat ₹{liveFiro.benefitPerBag}/bag off on {liveFiro.minQty}+ bags — ends{" "}
              {new Date(liveFiro.endDateTime).toLocaleString("en-IN", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        )}

        {/* Price grid */}
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-6 mb-8"
          style={{ borderTop: "1px solid #E8E1D4", borderBottom: "1px solid #E8E1D4" }}
        >
          <div>
            <p className="text-[10px] tracking-[0.1em] uppercase mb-1" style={{ color: "#B0A48D" }}>MRP</p>
            <p className="text-lg font-medium" style={{ color: "#2A2118" }}>
              {variant.mrp != null ? `₹${variant.mrp}` : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-[10px] tracking-[0.1em] uppercase mb-1" style={{ color: "#B0A48D" }}>Dealer Price</p>
            <p className="text-lg font-medium" style={{ color: "#2A2118" }}>
              {dealerPriceNum != null ? `₹${dealerPriceNum.toFixed(2)}` : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-[10px] tracking-[0.1em] uppercase mb-1" style={{ color: "#B0A48D" }}>Consumer Price</p>
            <p className="text-lg font-medium" style={{ color: "#2A2118" }}>
              {consumerPrice != null ? `₹${consumerPrice}` : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-[10px] tracking-[0.1em] uppercase mb-1" style={{ color: "#B0A48D" }}>Your Margin</p>
            <p className="text-lg font-medium" style={{ color: "#4A5D3A" }}>
              {margin != null ? `₹${margin}` : "N/A"}
            </p>
          </div>
        </div>

        {/* Secondary details */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-8">
          <div>
            <p className="text-[10px] tracking-[0.1em] uppercase mb-1" style={{ color: "#B0A48D" }}>Rate / KG</p>
            <p className="text-sm" style={{ color: "#5C5343" }}>{ratePerKg != null ? `₹${ratePerKg}` : "N/A"}</p>
          </div>
          <div>
            <p className="text-[10px] tracking-[0.1em] uppercase mb-1" style={{ color: "#B0A48D" }}>Packaging</p>
            <p className="text-sm" style={{ color: "#5C5343" }}>{variant.packagingType || "N/A"}</p>
          </div>
          <div>
            <p className="text-[10px] tracking-[0.1em] uppercase mb-1" style={{ color: "#B0A48D" }}>Primary Use</p>
            <p className="text-sm" style={{ color: "#5C5343" }}>{variant.primaryUse || "N/A"}</p>
          </div>
        </div>

        {variant.description && (
          <div className="mb-10">
            <p className="text-[10px] tracking-[0.1em] uppercase mb-2" style={{ color: "#B0A48D" }}>Description</p>
            <p className="text-sm leading-relaxed" style={{ color: "#5C5343" }}>{variant.description}</p>
          </div>
        )}

        {/* Volume discount table */}
        {volumeTiers.length > 0 && (
          <div className="mb-10">
            <p className="text-[10px] tracking-[0.1em] uppercase mb-3 flex items-center gap-1.5" style={{ color: "#B0A48D" }}>
              <Package size={12} /> Volume Discount Slabs
            </p>
            <div style={{ border: "1px solid #E8E1D4" }}>
              {volumeTiers.map((tier, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-5 py-3 text-sm"
                  style={{ borderTop: idx > 0 ? "1px solid #E8E1D4" : "none" }}
                >
                  <span style={{ color: "#2A2118" }}>{tier.minQty}+ bags</span>
                  <span className="font-semibold" style={{ color: "#4A5D3A" }}>−₹{tier.benefitPerBag}/bag</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quantity + Live price + CTA */}
        <div style={{ borderTop: "1px solid #E8E1D4" }} className="pt-8">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#2A2118" }}>
              Select Quantity
            </p>

            <div className="flex items-center" style={{ border: "1px solid #E8E1D4" }}>
              <button
                onClick={() => handleQtyChange(-1)}
                className="w-9 h-10 flex items-center justify-center hover:bg-[#FAF7F0] transition"
              >
                <Minus size={13} style={{ color: "#5C5343" }} />
              </button>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                className="w-14 text-center text-sm font-medium outline-none no-spinner"
                style={{ color: "#2A2118" }}
              />
              <button
                onClick={() => handleQtyChange(1)}
                className="w-9 h-10 flex items-center justify-center hover:bg-[#FAF7F0] transition"
              >
                <Plus size={13} style={{ color: "#5C5343" }} />
              </button>
            </div>
          </div>

          {(pricing.volumeDiscount > 0 || pricing.firoDiscount > 0) && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-4">
              {pricing.volumeDiscount > 0 && (
                <span className="text-[12px] font-medium" style={{ color: "#6B7F5C" }}>
                  Volume −₹{pricing.volumeDiscount}/bag
                </span>
              )}
              {pricing.firoDiscount > 0 && (
                <span className="text-[12px] font-semibold flex items-center gap-1" style={{ color: "#8A2A1F" }}>
                  <Flame size={12} /> Flash −₹{pricing.firoDiscount}/bag
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-[10px] tracking-[0.1em] uppercase mb-1" style={{ color: "#B0A48D" }}>
                Total ({quantity} bags)
              </p>
              <p className="flex items-baseline gap-2">
                {pricing.discountPerBag > 0 && (
                  <span className="text-sm line-through" style={{ color: "#C7BCA5" }}>
                    ₹{Math.round(pricing.basePrice * quantity).toLocaleString("en-IN")}
                  </span>
                )}
                <span className="text-2xl font-semibold" style={{ fontFamily: "var(--font-display)", color: "#2A2118" }}>
                  ₹{Math.round(pricing.finalPrice * quantity).toLocaleString("en-IN")}
                </span>
              </p>
            </div>

            <button
              onClick={handleAdd}
              className="h-11 px-8 text-xs font-semibold tracking-wide uppercase transition-all duration-300 flex items-center gap-1.5"
              style={{ backgroundColor: added ? "#4A5D3A" : "#2A2118", color: "#F5F0E6" }}
            >
              {added ? (<><Check size={13} /> Added to Cart</>) : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}