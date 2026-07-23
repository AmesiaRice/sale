"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useSkuData } from "@/hooks/useSkuData";
import { calculateBestPrice, isLiveFiroOffer } from "@/data/skus";
import { useAdminSession } from "@/hooks/admin/useAdminSession";
import { useIntroEligibility } from "@/hooks/useIntroEligibility";
import { getImsSystem } from "@/lib/getImsSystem";
import RetailerSearchSelect from "./RetailerSearchSelect";
import PlaceOrderProductCard from "./PlaceOrderProductCard";
import CategoryTabs from "@/components/products/CategoryTabs";
import { Trash2, Flame, Gift, Sparkles, ShoppingBag, Package } from "lucide-react";

export default function PlaceOrderOnBehalf() {
  const { admin } = useAdminSession();
  const { skuLines } = useSkuData();

  const [selectedRetailer, setSelectedRetailer] = useState(null);
  const [activeSkuId, setActiveSkuId] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const { isEligible: isIntroEligible } = useIntroEligibility(selectedRetailer?.retailerId);

  useEffect(() => {
    if (skuLines.length > 0 && !activeSkuId) {
      setActiveSkuId(skuLines[0].id);
    }
  }, [skuLines, activeSkuId]);

  const activeSku = skuLines.find((s) => s.id === activeSkuId) || skuLines[0];

  const handleAddToOrder = (product, quantity) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const updateQty = (id, qty) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const maxQty = Number.isFinite(item.currentStock) ? item.currentStock : Infinity;
        return { ...item, quantity: Math.min(maxQty, Math.max(1, qty)) };
      })
    );
  };

  const removeItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const pricedItems = useMemo(() => {
    return cartItems.map((item) => {
      const pricing = calculateBestPrice(item, item.quantity);
      const liveFiro = (item.firoOffers || []).find(isLiveFiroOffer) || null;
      const introOffer = item.introOffer || null;
      const introEligibleForRetailer = introOffer ? isIntroEligible(introOffer.introId) : false;
      const introQualifies = introEligibleForRetailer && introOffer && item.quantity >= introOffer.minQty;

      return { ...item, ...pricing, liveFiro, introOffer, introEligibleForRetailer, introQualifies };
    });
  }, [cartItems, isIntroEligible]);

  const total = pricedItems.reduce((sum, item) => sum + item.finalPrice * item.quantity, 0);
  const totalSavings = pricedItems.reduce((sum, item) => sum + item.discountPerBag * item.quantity, 0);
  const totalGiftsUnlocked = pricedItems.filter((item) => item.introQualifies).length;

  const handlePlaceOrder = async () => {
    if (!selectedRetailer) {
      alert("Please select a retailer first.");
      return;
    }
    if (cartItems.length === 0) {
      alert("Add at least one product.");
      return;
    }

    const outOfStockItems = pricedItems.filter(
      (item) => item.inStock === false || item.quantity > (item.currentStock ?? Infinity)
    );
    if (outOfStockItems.length > 0) {
      alert(
        "In products ki available stock se zyada quantity hai, order se pehle qty kam karein:\n" +
          outOfStockItems
            .map((item) => `${item.name} (available: ${item.inStock === false ? 0 : item.currentStock})`)
            .join("\n")
      );
      return;
    }

    setLoading(true);

    try {
      const orderId = `ORD-${selectedRetailer.retailerId}-${Date.now()}`;
      const grandTotal = Math.round(total);
      const totalItems = pricedItems.reduce((sum, i) => sum + i.quantity, 0);

      const payload = pricedItems.map((item) => ({
        orderId,
        retailerId: selectedRetailer.retailerId,
        skuName: item.name,
        skuCode: item.skuCode || "",
        grade: item.grade || "",
        packSize: item.packSizes || "",
        quantity: item.quantity,
        rate: item.finalPrice,
        discountPerBag: item.discountPerBag,
        discountType: item.appliedType,
        amount: item.finalPrice * item.quantity,
        orderTotal: grandTotal,
        orderTotalItems: totalItems,
        INTD_ID: item.introQualifies ? item.introOffer.introId : "",
        imsSystem: getImsSystem(item),
        giftSkuId: item.introQualifies ? item.introOffer.giftSkuId : "",
        giftQty: item.introQualifies ? item.introOffer.giftQty : 0,
        PlacedBy: admin?.name || admin?.adminId || "Field Executive",
        createdAt: new Date().toISOString(),
      }));

      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        throw new Error(data.message || "Failed to place order");
      }

      alert(`Order placed successfully for ${selectedRetailer.name}!`);
      setCartItems([]);
      setSelectedRetailer(null);
    } catch (error) {
      alert(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, var(--color-gold-400), var(--color-gold-600))" }}
        >
          <ShoppingBag size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-gold-800)" }}>
            Place Order on Behalf
          </h1>
          <p className="text-sm text-gray-500">Retailer ko live offers dikhaye, aur unke liye order karein.</p>
        </div>
      </div>

      <RetailerSearchSelect selectedRetailer={selectedRetailer} onSelect={setSelectedRetailer} />

      {selectedRetailer && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-4 text-sm text-white"
          style={{ background: "linear-gradient(90deg, var(--color-gold-700), var(--color-gold-500))" }}
        >
          Ordering for <strong>{selectedRetailer.name}</strong> · {selectedRetailer.companyName} · {selectedRetailer.phone}
        </motion.div>
      )}

      {/* Total savings summary */}
      {(totalSavings > 0 || totalGiftsUnlocked > 0) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl px-5 py-3 flex items-center gap-3 text-white"
          style={{ background: "linear-gradient(90deg, #166534, #16a34a)" }}
        >
          <Sparkles size={20} className="shrink-0" />
          <p className="text-sm font-semibold">
            {totalSavings > 0 && `Retailer bacha raha hai ₹${Math.round(totalSavings).toLocaleString("en-IN")}`}
            {totalSavings > 0 && totalGiftsUnlocked > 0 && " · "}
            {totalGiftsUnlocked > 0 && `${totalGiftsUnlocked} gift unlocked! 🎁`}
          </p>
        </motion.div>
      )}

      {/* Product browsing — same cards as website */}
      {skuLines.length > 0 && activeSku && (
        <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "var(--color-gold-200)" }}>
          <CategoryTabs skuLines={skuLines} activeSkuId={activeSku.id} onSkuSelect={setActiveSkuId} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {(activeSku.variants || []).map((v) => (
              <PlaceOrderProductCard key={v.id} variant={v} onAddToOrder={handleAddToOrder} isIntroEligible={isIntroEligible} />
            ))}
          </div>
        </div>
      )}

      {/* Order Summary */}
      {pricedItems.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold" style={{ color: "var(--color-gold-800)" }}>
            Order Summary
          </p>

          <AnimatePresence>
            {pricedItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white rounded-xl border overflow-hidden"
                style={{ borderColor: item.liveFiro ? "#EA580C" : "var(--color-gold-200)" }}
              >
                {item.liveFiro && (
                  <div
                    className="px-4 py-1.5 flex items-center gap-2 text-white text-[11px] font-bold"
                    style={{ background: "linear-gradient(90deg, #DC2626, #EA580C)" }}
                  >
                    <Flame size={12} className="animate-pulse" /> Flash Offer Applied: ₹{item.firoDiscount}/bag off
                  </div>
                )}
                {item.introQualifies && (
                  <div
                    className="px-4 py-1.5 flex items-center gap-2 text-white text-[11px] font-bold"
                    style={{ background: "linear-gradient(90deg, #7E22CE, #C026D3)" }}
                  >
                    <Gift size={12} /> Gift Unlocked: {item.introOffer.gift}
                  </div>
                )}

                <div className="px-4 py-3 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="flex items-baseline gap-1.5">
                        {item.discountPerBag > 0 && (
                          <span className="text-xs line-through text-gray-400">₹{item.basePrice.toFixed(2)}</span>
                        )}
                        <span className="text-xs text-gray-500">₹{item.finalPrice.toFixed(2)}/bag</span>
                      </p>
                    </div>

                    <input
                      type="number"
                      min={1}
                      max={Number.isFinite(item.currentStock) ? item.currentStock : undefined}
                      value={item.quantity}
                      onChange={(e) => updateQty(item.id, Number(e.target.value) || 1)}
                      className="w-16 text-center text-sm font-semibold border rounded-md py-1 no-spinner"
                      style={{ borderColor: "var(--color-gold-200)" }}
                    />

                    <p className="text-sm font-bold w-20 text-right shrink-0" style={{ color: "var(--color-gold-800)" }}>
                      ₹{Math.round(item.finalPrice * item.quantity).toLocaleString("en-IN")}
                    </p>

                    <button onClick={() => removeItem(item.id)} className="text-red-500 cursor-pointer shrink-0">
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {(item.volumeDiscount > 0 || item.firoDiscount > 0) && (
                    <div className="flex flex-wrap items-center gap-2">
                      {item.volumeDiscount > 0 && (
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
                          style={{ backgroundColor: "#EFF6FF", color: "#1D4ED8" }}
                        >
                          <Package size={9} /> Volume −₹{item.volumeDiscount}/bag
                        </span>
                      )}
                      {item.firoDiscount > 0 && (
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
                          style={{ backgroundColor: "#FEF2F2", color: "#DC2626" }}
                        >
                          <Flame size={9} /> Flash −₹{item.firoDiscount}/bag
                        </span>
                      )}
                      <span className="text-[10px] font-semibold text-green-700">
                        Saved ₹{Math.round(item.discountPerBag * item.quantity).toLocaleString("en-IN")} total
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <div
            className="flex items-center justify-between bg-white rounded-2xl border p-5 sticky bottom-4"
            style={{ borderColor: "var(--color-gold-200)", boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
          >
            <div>
              <p className="text-xs text-gray-500">Total Payable</p>
              <p className="text-2xl font-bold" style={{ color: "var(--color-gold-800)", fontFamily: "var(--font-display)" }}>
                ₹{Math.round(total).toLocaleString("en-IN")}
              </p>
              {totalSavings > 0 && (
                <p className="text-xs font-semibold text-green-600 mt-0.5">
                  Saved ₹{Math.round(totalSavings).toLocaleString("en-IN")}
                </p>
              )}
            </div>
            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="text-sm font-semibold px-6 py-3 rounded-xl text-white cursor-pointer disabled:opacity-50"
              style={{ backgroundColor: "var(--color-gold-700)" }}
            >
              {loading ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}