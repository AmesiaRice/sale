"use client";

import { useEffect, useState } from "react";
import { useSkuData } from "../app/hooks/useSkuData";
import Sidebar from "@/components/Sidebar";
import ProductDetail from "@/components/ProductDetail";
import { AnimatePresence, motion } from "motion/react";

export default function ProductsPageClient() {
  const { skuLines, isLoading: loading } = useSkuData();

  const [activeSkuId, setActiveSkuId] = useState(null);
  const [activeVariantId, setActiveVariantId] = useState(null);

  // Variant switching loading
  const [variantLoading, setVariantLoading] = useState(false);

  // Jab bhi skuLines pehli baar load ho (ya cache se aa jaye),
  // default active SKU/variant set karo — sirf tab jab abhi tak kuch select nahi hua
  useEffect(() => {
    if (Array.isArray(skuLines) && skuLines.length > 0 && !activeSkuId) {
      setActiveSkuId(skuLines[0].id);
      setActiveVariantId(skuLines[0].variants?.[0]?.id || null);
    }
  }, [skuLines, activeSkuId]);

  // Initial Skeleton Screen
  if (loading && skuLines.length === 0) {
    return (
      <div
        className="
          flex
          flex-col
          md:flex-row
          min-h-screen
          animate-pulse
        "
      >
        {/* Sidebar Skeleton */}
        <div
          className="
            hidden
            md:flex
            w-56
            lg:w-64
            p-4
            flex-col
            gap-3
          "
          style={{
            backgroundColor: "var(--color-gold-800)",
          }}
        >
          <div className="h-4 w-24 rounded bg-white/20" />

          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="h-12 rounded-xl bg-white/10" />
          ))}
        </div>

        {/* Mobile Topbar Skeleton */}
        <div className="md:hidden p-4">
          <div className="h-10 w-40 rounded-xl bg-gray-200" />
        </div>

        {/* Product Skeleton */}
        <div className="flex-1">
          <ProductDetail loading={true} />
        </div>
      </div>
    );
  }

  // No Products
  if (!skuLines.length) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4">
        <p
          className="text-center text-sm sm:text-base"
          style={{
            color: "var(--color-gold-700)",
          }}
        >
          No products available.
        </p>
      </div>
    );
  }

  // Active SKU
  const activeSku = skuLines.find((s) => s.id === activeSkuId) || skuLines[0];

  // Active Variant
  const activeVariant =
    activeSku?.variants?.find((v) => v.id === activeVariantId) ||
    activeSku?.variants?.[0];

  // SKU Change
  const handleSkuSelect = (skuId) => {
    setVariantLoading(true);

    setTimeout(() => {
      setActiveSkuId(skuId);

      const sku = skuLines.find((s) => s.id === skuId);

      if (sku?.variants?.length) {
        setActiveVariantId(sku.variants[0].id);
      } else {
        setActiveVariantId(null);
      }

      setVariantLoading(false);
    }, 250);
  };

  // Variant Change
  const handleVariantSelect = (variantId) => {
    setVariantLoading(true);

    setTimeout(() => {
      setActiveVariantId(variantId);

      setVariantLoading(false);
    }, 250);
  };

  // Safety Check
  if (!activeSku || !activeVariant) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4">
        <p
          className="text-center text-sm sm:text-base"
          style={{
            color: "var(--color-gold-700)",
          }}
        >
          Product data is incomplete.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Main Layout */}
      <div
        className="
          flex
          flex-col
          md:flex-row
          flex-1
          min-h-screen
          bg-white
        "
      >
        {/* Sidebar */}
        <Sidebar
          skuLines={skuLines}
          activeSkuId={activeSkuId}
          activeVariantId={activeVariantId}
          onSkuSelect={handleSkuSelect}
          onVariantSelect={handleVariantSelect}
        />

        {/* Product Content */}
        <main
          className="
            flex-1
            w-full
            overflow-y-auto
          "
        >
          <div
            className="
              max-w-7xl
              mx-auto
              w-full
            "
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeSkuId}-${activeVariantId}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <ProductDetail
                  key={activeVariantId}
                  skuLine={activeSku}
                  variant={activeVariant}
                  onVariantSelect={handleVariantSelect}
                  loading={variantLoading}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* <ContactSection /> */}
    </>
  );
}