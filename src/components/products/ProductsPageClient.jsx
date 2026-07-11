"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useSkuData } from "@/hooks/useSkuData";
import CategoryTabs from "@/components/products/CategoryTabs";
import ProductCard from "@/components/products/ProductCard";

export default function ProductsPageClient() {
  const { skuLines, isLoading: loading } = useSkuData();
  const [activeSkuId, setActiveSkuId] = useState(null);

  useEffect(() => {
    if (Array.isArray(skuLines) && skuLines.length > 0 && !activeSkuId) {
      setActiveSkuId(skuLines[0].id);
    }
  }, [skuLines, activeSkuId]);

  if (loading && skuLines.length === 0) {
    return (
      <div className="min-h-screen animate-pulse px-6 sm:px-10 py-8">
        <div className="h-8 w-64 bg-gray-100 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  if (!skuLines.length) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4">
        <p className="text-center text-sm sm:text-base" style={{ color: "var(--color-gold-700)" }}>
          No products available.
        </p>
      </div>
    );
  }

  const activeSku = skuLines.find((s) => s.id === activeSkuId) || skuLines[0];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FDFBF7" }}>
      <CategoryTabs
        skuLines={skuLines}
        activeSkuId={activeSku.id}
        onSkuSelect={setActiveSkuId}
      />

      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-10">
        <motion.div
          key={activeSku.id}
          className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.08 } },
          }}
        >
          {(activeSku.variants || []).map((v) => (
            <ProductCard key={v.id} variant={v} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}