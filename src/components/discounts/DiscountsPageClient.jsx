"use client";

import { useEffect, useState, useMemo } from "react";
import { getSkuLines, isLiveFiroOffer } from "@/data/skus";
import Select from "react-select";
import { Flame, PackageCheck, Tag, Clock, Search } from "lucide-react";
import { useSkuData } from "@/hooks/useSkuData";

const CATEGORY_TABS = [
  { id: "all", label: "All Products" },
  { id: "lp-loose-pack", label: "LP (Loose Pack)" },
  { id: "cp-consumer-pack", label: "CP (Consumer Pack)" },
  { id: "ls-lot-sale", label: "LS (Lot Sale)" },
];

export default function DiscountsPageClient() {
//   const [skuLines, setSkuLines] = useState([]);
//   const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedProductId, setSelectedProductId] = useState(null);

const { skuLines, isLoading: loading } = useSkuData();
  // Sab variants ek flat list mein, group info ke sath
  const allVariants = useMemo(() => {
    return skuLines.flatMap((group) =>
      (group.variants || []).map((v) => ({ ...v, groupId: group.id, groupName: group.name }))
    );
  }, [skuLines]);

  // Sirf wahi variants jinke paas koi discount hai (Volume ya FIRO)
  const variantsWithDiscounts = useMemo(() => {
    return allVariants.filter(
      (v) =>
        (Array.isArray(v.volumeTiers) && v.volumeTiers.length > 0) ||
        (Array.isArray(v.firoOffers) && v.firoOffers.length > 0)
    );
  }, [allVariants]);

  // Tab ke hisaab se filter
  const tabFiltered = useMemo(() => {
    if (activeTab === "all") return variantsWithDiscounts;
    return variantsWithDiscounts.filter((v) => v.groupId === activeTab);
  }, [variantsWithDiscounts, activeTab]);

  // Specific product select hone par sirf wahi dikhao
  const finalList = useMemo(() => {
    if (!selectedProductId) return tabFiltered;
    return tabFiltered.filter((v) => v.id === selectedProductId);
  }, [tabFiltered, selectedProductId]);

  // Search dropdown ke options — active tab ke hisaab se scoped
  const searchOptions = useMemo(() => {
    const pool = activeTab === "all" ? variantsWithDiscounts : variantsWithDiscounts.filter((v) => v.groupId === activeTab);
    return pool.map((v) => ({ value: v.id, label: `${v.name} (${v.skuCode})` }));
  }, [variantsWithDiscounts, activeTab]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSelectedProductId(null); // tab badalne par search reset
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm" style={{ color: "var(--color-gold-500)" }}>
          Loading discounts...
        </p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen px-4 py-6 sm:px-6 lg:px-8"
      style={{ background: "linear-gradient(to bottom, #fffdf8, #f8f4ea)" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: "var(--color-gold-800)" }}>
            Active Discounts
          </h1>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">
            Volume-based aur Flash (FIRO) discounts — sab ek jagah.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-5">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
              style={{
                backgroundColor:
                  activeTab === tab.id ? "var(--color-gold-500)" : "var(--color-gold-100)",
                color: activeTab === tab.id ? "#fff" : "var(--color-gold-700)",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Product Search */}
        <div className="mb-8 max-w-md">
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            <Search size={14} /> Specific Product Search
          </label>
          <Select
            options={searchOptions}
            value={searchOptions.find((o) => o.value === selectedProductId) || null}
            onChange={(option) => setSelectedProductId(option ? option.value : null)}
            placeholder="Search product by name or SKU code..."
            isClearable
            isSearchable
          />
        </div>

        {/* Results */}
        {finalList.length === 0 ? (
          <div
            className="bg-white rounded-3xl p-10 text-center border shadow-sm"
            style={{ borderColor: "var(--color-gold-200)" }}
          >
            <Tag size={32} className="mx-auto mb-3" style={{ color: "var(--color-gold-400)" }} />
            <h2 className="text-xl font-bold mb-1" style={{ color: "var(--color-gold-700)" }}>
              Koi Active Discount Nahi Mila
            </h2>
            <p className="text-gray-500 text-sm">
              Is category/product ke liye abhi koi Volume ya FIRO offer active nahi hai.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {finalList.map((variant) => (
              <DiscountCard key={variant.id} variant={variant} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DiscountCard({ variant }) {
  const liveFiros = (variant.firoOffers || []).filter(isLiveFiroOffer);
  const upcomingFiros = (variant.firoOffers || []).filter(
    (o) => new Date(o.startDateTime) > new Date()
  );
  const volumeTiers = [...(variant.volumeTiers || [])].sort((a, b) => a.minQty - b.minQty);

  return (
    <div
      className="bg-white rounded-2xl border shadow-sm p-5 flex flex-col gap-4"
      style={{ borderColor: "var(--color-gold-200)" }}
    >
      {/* Header */}
      <div>
        <p className="text-[10px] uppercase tracking-wide font-semibold" style={{ color: "var(--color-gold-400)" }}>
          {variant.groupName}
        </p>
        <h3 className="text-base font-bold" style={{ color: "var(--color-gold-900)" }}>
          {variant.name}
        </h3>
        <p className="text-xs text-gray-500">{variant.skuCode}</p>
      </div>

      {/* Live FIRO offers */}
      {liveFiros.length > 0 && (
        <div className="space-y-2">
          {liveFiros.map((offer) => (
            <div
              key={offer.firoId}
              className="rounded-xl p-3 flex flex-col gap-1"
              style={{ backgroundColor: "#fef2f2" }}
            >
              <div className="flex items-center gap-2">
                <Flame size={14} className="text-red-600" />
                <span className="text-xs font-bold text-red-600">{offer.firoName}</span>
                <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-600 text-white">
                  LIVE
                </span>
              </div>
              <p className="text-sm font-semibold text-red-700">
                ₹{offer.benefitPerBag}/bag OFF on {offer.minQty}+ bags
              </p>
              <p className="text-[10px] text-red-500 flex items-center gap-1">
                <Clock size={10} /> Ends: {new Date(offer.endDateTime).toLocaleString("en-IN")}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Upcoming FIRO offers */}
      {upcomingFiros.length > 0 && (
        <div className="space-y-2">
          {upcomingFiros.map((offer) => (
            <div
              key={offer.firoId}
              className="rounded-xl p-3 flex flex-col gap-1 border border-dashed"
              style={{ borderColor: "var(--color-gold-300)" }}
            >
              <div className="flex items-center gap-2">
                <Clock size={14} style={{ color: "var(--color-gold-500)" }} />
                <span className="text-xs font-bold" style={{ color: "var(--color-gold-600)" }}>
                  {offer.firoName} — Upcoming
                </span>
              </div>
              <p className="text-sm font-semibold" style={{ color: "var(--color-gold-700)" }}>
                ₹{offer.benefitPerBag}/bag OFF on {offer.minQty}+ bags
              </p>
              <p className="text-[10px]" style={{ color: "var(--color-gold-400)" }}>
                Starts: {new Date(offer.startDateTime).toLocaleString("en-IN")}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Volume tiers table */}
      {volumeTiers.length > 0 && (
        <div>
          <p className="text-xs font-semibold mb-2 flex items-center gap-1" style={{ color: "var(--color-gold-700)" }}>
            <PackageCheck size={13} /> Volume Discount Slabs
          </p>
          <div className="rounded-xl overflow-hidden border" style={{ borderColor: "var(--color-gold-200)" }}>
            <table className="w-full text-xs">
              <thead>
                <tr style={{ backgroundColor: "var(--color-gold-100)" }}>
                  <th className="text-left px-3 py-2 font-semibold" style={{ color: "var(--color-gold-700)" }}>
                    Min Qty
                  </th>
                  <th className="text-right px-3 py-2 font-semibold" style={{ color: "var(--color-gold-700)" }}>
                    Discount/Bag
                  </th>
                </tr>
              </thead>
              <tbody>
                {volumeTiers.map((tier, idx) => (
                  <tr key={idx} className="border-t" style={{ borderColor: "var(--color-gold-100)" }}>
                    <td className="px-3 py-2 font-medium">{tier.minQty}+ bags</td>
                    <td className="px-3 py-2 text-right font-semibold text-green-700">
                      ₹{tier.benefitPerBag}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Nothing live right now, only expired/none */}
      {liveFiros.length === 0 && upcomingFiros.length === 0 && volumeTiers.length === 0 && (
        <p className="text-xs text-gray-400">Koi discount abhi available nahi hai.</p>
      )}
    </div>
  );
}