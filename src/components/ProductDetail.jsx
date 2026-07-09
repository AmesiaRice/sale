"use client";

import { useCart } from "@/app/context/CartContext";
import { useState } from "react";

export default function ProductDetail({
  skuLine,
  variant,
  onVariantSelect,
  loading = false,
}) 

{
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();
  // Skeleton Loader
  if (loading || !variant) {
    return (
      <div className="p-4 sm:p-5 md:p-6 flex flex-col gap-5 animate-pulse">
        {/* Breadcrumb */}
        <div className="h-3 w-40 rounded bg-gray-200" />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
          <div className="flex-1">
            <div className="h-8 w-52 rounded bg-gray-200 mb-3" />
            <div className="h-3 w-36 rounded bg-gray-200" />
          </div>

          <div className="h-8 w-28 rounded-full bg-gray-200" />
        </div>

        {/* Spec Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="
                rounded-xl
                border
                p-4
                min-h-[90px]
                bg-gray-100
              "
            >
              <div className="h-3 w-16 mx-auto rounded bg-gray-200 mb-3" />
              <div className="h-5 w-24 mx-auto rounded bg-gray-300" />
            </div>
          ))}
        </div>

        {/* Description */}
        <div className="rounded-xl bg-gray-100 p-4 space-y-3">
          <div className="h-3 w-full rounded bg-gray-200" />
          <div className="h-3 w-[90%] rounded bg-gray-200" />
          <div className="h-3 w-[80%] rounded bg-gray-200" />
        </div>

        {/* Variant Buttons */}
        <div>
          <div className="h-3 w-32 rounded bg-gray-200 mb-4" />

          <div className="flex flex-wrap gap-2">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-10 w-28 rounded-lg bg-gray-200"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const handleAdd = () => {
    addToCart({
      id: variant.id,
      name: variant.name,
      skuId: variant.skuId,
      skuCode: variant.skuCode,
      grade: variant.grade,
      packSizes: variant.packSizes,
      mrp: variant.mrp,
      dealerPrice: Math.round(variant.dealerPrice),
      moq: variant.moq,
      offer: variant.offer,
      inStock: variant.inStock,
      grainLength: variant.grainLength,
      moisture: variant.moisture,
      primaryUse: variant.primaryUse,
      description: variant.description,
      image: variant.image || "",
    })
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  // 👇 Retailer ke liye sabse relevant 6 fields
  const specs = [
    { label: "MRP", value: variant.mrp != null ? `₹${variant.mrp}` : "N/A" },
    { label: "Pack Size", value: variant.packSizes },
    { label: "Dealer Price/ Bag", value: variant.dealerPrice != null ? `₹${Math.round(variant.dealerPrice)}` : "N/A" },
    { label: "Consumer Price/ Bag", value: variant.consumerPriceBag != null ? `₹${variant.consumerPriceBag}` : "N/A" },
    {
      label: "Your Margin/Bag",
      value:
        variant.consumerPriceBag != null && variant.dealerPrice != null
          ? `₹${(variant.consumerPriceBag - variant.dealerPrice).toFixed(2)}`
          : "N/A",
    },
    { label: "Rate / KG", value: variant.dealerPricePerKg != null ? `₹${variant.dealerPricePerKg.toFixed(2)}` : "N/A" },
  ];
  

  return (
    <div
      className="p-4 sm:p-5 md:p-6 flex flex-col gap-4 sm:gap-5"
      style={{
        backgroundColor: "#fff",
        animation: "fadeIn 0.3s ease-in-out",
      }}
    >
      {/* Breadcrumb */}
      <p
        className="text-[10px] sm:text-xs break-words leading-relaxed"
        style={{ color: "var(--color-gold-400)" }}
      >
        Products › {skuLine.name} ›{" "}
        <span
          style={{
            color: "var(--color-gold-500)",
            fontWeight: 600,
          }}
        >
          {variant.name}
        </span>
      </p>

      {/* Title row */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
        <div className="min-w-0">
          <h2
            className="text-xl sm:text-2xl md:text-3xl font-semibold break-words"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-gold-900)",
            }}
          >
            {variant.name}
          </h2>

          <p
            className="text-[10px] sm:text-xs mt-1 leading-relaxed break-words font-black text-orange-600"
            // style={{ color: "var(--color-gold-400)" }}
          >
            SKU Code: {variant.skuCode}

            <span className="hidden sm:inline">
              {" "}
              &nbsp;|&nbsp; {variant.grade}
            </span>

            <span className="sm:hidden block mt-1">
              Grade: {variant.grade}
            </span>
          </p>
        </div>

        <button
        
  onClick={handleAdd}
  className="
    w-full
    sm:w-auto
    text-white
    text-sm
    font-semibold
    px-5
    py-3
    rounded-xl
    transition-all
    duration-300
    hover:scale-[1.02]
    active:scale-[0.98]
  "
  style={{
    backgroundColor: "var(--color-gold-500)",
  }}
>
  Add To Cart
</button>

        <span
          className="text-[11px] sm:text-xs font-semibold px-3 py-1.5 rounded-md w-fit shrink-0"
          style={{
            backgroundColor: variant.inStock
              ? "#f0fdf4"
              : "#fef2f2",
            color: variant.inStock ? "#166534" : "#dc2626",
          }}
        >
          {variant.inStock
            ? "✓ In Stock"
            : "✕ Out of Stock"}
        </span>
      </div>

      {/* Spec cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
        {specs.map(({ label, value }) => (
          <div
            key={label}
            className="
              rounded-lg
              p-3
              sm:p-4
              text-center
              border
              min-h-[90px]
              flex
              flex-col
              justify-center
            "
            style={{
              backgroundColor: "var(--color-gold-100)",
              borderColor: "var(--color-gold-200)",
            }}
          >
            <p
              className="text-[10px] sm:text-xs mb-1"
              style={{
                color: "var(--color-gold-400)",
              }}
            >
              {label}
            </p>

            <p
              className="
                text-sm
                sm:text-base
                md:text-lg
                font-semibold
                break-words
              "
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-gold-900)",
              }}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Description */}
      <div
        className="px-3 sm:px-4 py-3 rounded-r-md"
        style={{
          backgroundColor: "var(--color-gold-50)",
          borderLeft:
            "4px solid var(--color-gold-500)",
        }}
      >
        <p
          className="
            text-sm
            sm:text-[15px]
            leading-relaxed
          "
          style={{
            color: "var(--color-gold-700)",
          }}
        >
          {variant.description}
        </p>
      </div>

      {/* Sub-variant switcher */}
      <div>
        <p
          className="
            text-[10px]
            sm:text-[11px]
            tracking-widest
            font-semibold
            mb-3
          "
          style={{
            color: "var(--color-gold-400)",
          }}
        >
          SWITCH SUB-VARIANT
        </p>

        <div className="flex flex-wrap gap-2">
          {skuLine.variants.map((v) => (
            <button
              key={v.id}
              onClick={() => onVariantSelect(v.id)}
              className="
                px-3
                sm:px-4
                py-2
                rounded-md
                text-xs
                sm:text-sm
                font-medium
                transition-all
                duration-200
                break-words
                max-w-full
              "
              style={{
                backgroundColor:
                  v.id === variant.id
                    ? "var(--color-gold-500)"
                    : "var(--color-gold-100)",

                color:
                  v.id === variant.id
                    ? "#fff"
                    : "var(--color-gold-700)",

                border:
                  v.id === variant.id
                    ? "none"
                    : "1px solid var(--color-gold-200)",
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