"use client";

export default function CategoryTabs({ skuLines, activeSkuId, onSkuSelect }) {
  return (
    <div
      className="sticky top-0 z-20 bg-white px-6 sm:px-10"
      style={{ borderBottom: "1px solid #E8E1D4" }}
    >
      <div className="flex items-center gap-8 overflow-x-auto no-scrollbar max-w-7xl mx-auto">
        {skuLines.map((sku) => {
          const isActive = sku.id === activeSkuId;
          return (
            <button
              key={sku.id}
              onClick={() => onSkuSelect(sku.id)}
              className="whitespace-nowrap py-5 text-sm tracking-[0.08em] uppercase transition-all shrink-0 relative"
              style={{
                color: isActive ? "#2A2118" : "#B0A48D",
                fontWeight: isActive ? 600 : 500,
              }}
            >
              {sku.name}
              {isActive && (
                <span
                  className="absolute left-0 right-0 -bottom-px"
                  style={{ height: "2px", backgroundColor: "var(--color-gold-500)" }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}