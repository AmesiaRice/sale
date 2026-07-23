"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "motion/react";
import { calculateBestPrice, isLiveFiroOffer } from "@/data/skus";
import dynamic from "next/dynamic";
import { useSkuData } from "@/hooks/useSkuData";
import { useRetailerId } from "@/hooks/useRetailerId";
import { useIntroEligibility } from "@/hooks/useIntroEligibility";
import { getImsSystem } from "@/lib/getImsSystem";

import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Tag,
  Truck,
  ShieldCheck,
  Flame,
  PackageCheck,
  Gift,
} from "lucide-react";

import { useCart } from "@/app/context/CartContext";

const Select = dynamic(() => import("react-select"), { ssr: false });

export default function CartPage() {
  const { skuLines } = useSkuData();

  const {
    cartItems,
    removeFromCart,
    increaseQty,
    decreaseQty,
    updateQuantity,
    clearCart,
    addToCart,
  } = useCart();

  const [retailerId, setRetailerId] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedSku, setSelectedSku] = useState("");

  // 👇 Introductory offer eligibility check
  const { isEligible: isIntroEligible, refresh: refreshIntroEligibility } = useIntroEligibility(retailerId);

  const products = useMemo(
    () => skuLines.flatMap((line) => line.variants || []),
    [skuLines]
  );

  const pricedItems = useMemo(() => {
    return cartItems.map((item) => {
      const fullProduct = products.find(
        (p) => p.id === item.id || p.skuId === item.skuId
      );

      if (!fullProduct) {
        return {
          ...item,
          basePrice: Number(item.dealerPrice || 0),
          finalPrice: Number(item.dealerPrice || 0),
          discountPerBag: 0,
          appliedType: "None",
          nextTier: null,
          introOffer: null,
          introQualifies: false,
          // Live product data abhi load nahi hui — stock restrict mat karo
          currentStock: Infinity,
          inStock: true,
        };
      }

      const pricing = calculateBestPrice(fullProduct, item.quantity);

      let nextTier = null;
      if (Array.isArray(fullProduct.volumeTiers)) {
        const upcoming = fullProduct.volumeTiers
          .filter((t) => t.minQty > item.quantity)
          .sort((a, b) => a.minQty - b.minQty)[0];
        if (upcoming) nextTier = upcoming;
      }

      // 👇 Introductory offer: eligible hai (pehle use nahi kiya) AUR
      // current quantity minQty threshold cross kar rahi hai
      const introOffer = fullProduct.introOffer || null;
      const introQualifies =
        introOffer != null &&
        isIntroEligible(introOffer.introId) &&
        item.quantity >= introOffer.minQty;

      return {
        ...item,
        basePrice: pricing.basePrice,
        finalPrice: pricing.finalPrice,
        discountPerBag: pricing.discountPerBag,
        volumeDiscount: pricing.volumeDiscount,
        firoDiscount: pricing.firoDiscount,
        appliedType: pricing.appliedType,
        activeFiro: pricing.activeFiro,
        nextTier,
        introOffer,
        introQualifies,
        // Live IMS stock (useSkuData se, cart mein add hone ke waqt wali stale
        // value se nahi) — checkout validation aur qty cap dono isi se karte hain
        currentStock: Number.isFinite(fullProduct.currentStock) ? fullProduct.currentStock : Infinity,
        inStock: fullProduct.inStock !== false,
        // Cart item (ProductCard/ProductDetailPage se) productType carry nahi karta —
        // isliye yaha fullProduct se le rahe hain, warna getImsSystem() hamesha
        // "brand" pe fallback ho jaata (Lot orders ka IMS deduct galat sheet mein jaata)
        productType: fullProduct.productType,
      };
    });
  }, [cartItems, products, isIntroEligible]);

  const subtotal = pricedItems.reduce(
    (total, item) => total + item.basePrice * item.quantity,
    0
  );

  const totalDiscount = pricedItems.reduce(
    (total, item) => total + item.discountPerBag * item.quantity,
    0
  );

  const shipping = 0;
  const total = subtotal - totalDiscount + shipping;

  const handleSkuSelect = (id) => {
    setSelectedSku(id);
    const product = products.find((p) => p.id === id);
    if (!product) return;
    addToCart({ ...product });
  };

  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch("/api/session");
        const data = await res.json();
        if (data.success) {
          const user = data.user;
          setRetailerId(user.retailerId || user.retailerID || user.id || "");
        }
      } catch (error) {
        console.error("Failed to load session");
      }
    }
    loadSession();
  }, []);



  const handleCheckout = async () => {
    if (!cartItems.length) {
      alert("Your cart is empty.");
      return;
    }
    if (!retailerId) {
      alert("Retailer ID not found. Please log in again.");
      return;
    }

    // Stock se zyada qty ho ya SKU out of stock ho gaya ho to checkout block karo
    const outOfStockItems = pricedItems.filter(
      (item) => !item.inStock || item.quantity > item.currentStock
    );
    if (outOfStockItems.length > 0) {
      alert(
        "In products ki available stock se zyada quantity hai, checkout se pehle qty kam karein:\n" +
          outOfStockItems.map((item) => `${item.name} (available: ${item.inStock ? item.currentStock : 0})`).join("\n")
      );
      return;
    }

    const orderId = `ORD-${retailerId}-${Date.now()}`;
    setLoading(true);

    try {
      const grandTotal = Math.round(total);
      const totalItemsCount = pricedItems.reduce((sum, item) => sum + item.quantity, 0);

      const payload = pricedItems.map((item) => ({
        orderId,
        retailerId,
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
        orderTotalItems: totalItemsCount,
        // 👇 Sirf tab bheja jayega jab retailer eligible ho AUR minQty cross ho
        INTD_ID: item.introQualifies ? item.introOffer.introId : "",
        // 👇 IMS deduct-stock call ke liye — kaunsi IMS (Brand/Lot) se stock katega
        imsSystem: getImsSystem(item),
        // 👇 Intro offer ki gift (hamesha Brand SKU) — order line ka hissa nahi hai,
        // isliye alag se bhejte hain taaki uska stock bhi deduct ho sake
        giftSkuId: item.introQualifies ? item.introOffer.giftSkuId : "",
        giftQty: item.introQualifies ? item.introOffer.giftQty : 0,
        createdAt: new Date().toISOString(),
      }));

      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        throw new Error(data.message || "Failed to submit order");
      }

      alert("Order submitted successfully!");
      clearCart();
      refreshIntroEligibility();
    } catch (error) {
      console.error(error);
      alert(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen px-4 py-6 sm:px-6 lg:px-8"
      style={{ background: "linear-gradient(to bottom, #fffdf8, #f8f4ea)" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: "var(--color-gold-800)" }}>
              Shopping Cart
            </h1>
            <p className="text-gray-500 mt-2 text-sm sm:text-base">
              Review your selected products before placing the order.
            </p>
          </div>

          <div
            className="px-5 py-3 rounded-2xl shadow-sm border bg-white flex items-center gap-3 w-fit"
            style={{ borderColor: "var(--color-gold-200)" }}
          >
            <ShoppingBag size={20} style={{ color: "var(--color-gold-500)" }} />
            <div>
              <p className="text-xs text-gray-500">Total Items</p>
              <p className="font-bold text-lg" style={{ color: "var(--color-gold-700)" }}>
                {cartItems.length}
              </p>
            </div>
          </div>
        </div>

        {/* Total savings banner */}
        {totalDiscount > 0 && (
          <div
            className="mb-6 rounded-2xl px-5 py-4 flex items-center gap-3 text-white"
            style={{ background: "linear-gradient(90deg, #166534, #16a34a)" }}
          >
            <Tag size={22} />
            <p className="text-sm sm:text-base font-semibold">
              🎉 Aap total ₹{Math.round(totalDiscount).toLocaleString("en-IN")} bacha rahe hain is order par!
            </p>
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Select Product</label>

          <Select
            options={products.map((product) => ({
              value: product.id,
              label: `${product.name} (${product.skuCode})`,
            }))}
            value={
              products.find((p) => p.id === selectedSku)
                ? {
                  value: selectedSku,
                  label: `${products.find((p) => p.id === selectedSku).name} (${products.find((p) => p.id === selectedSku).skuCode
                    })`,
                }
                : null
            }
            onChange={(option) => handleSkuSelect(option.value)}
            placeholder="Search Product..."
            isSearchable
          />
        </div>

        {!cartItems.length ? (
          <div
            className="bg-white rounded-3xl p-10 text-center border shadow-sm"
            style={{ borderColor: "var(--color-gold-200)" }}
          >
            <div
              className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-5"
              style={{ backgroundColor: "var(--color-gold-100)" }}
            >
              <ShoppingBag size={34} style={{ color: "var(--color-gold-500)" }} />
            </div>

            <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--color-gold-700)" }}>
              Your Cart is Empty
            </h2>

            <p className="text-gray-500">Add products to continue shopping.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="xl:col-span-2 space-y-4">
              {pricedItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border shadow-sm p-5 sm:p-6 transition-all duration-300 hover:shadow-lg overflow-hidden"
                  style={{ borderColor: "var(--color-gold-200)" }}
                >
                  {/* 🔥 Bada FIRO banner */}
                  {item.firoDiscount > 0 && (
                    <div
                      className="-m-5 sm:-m-6 mb-4 sm:mb-5 px-5 sm:px-6 py-3 flex items-center gap-3 text-white"
                      style={{ background: "linear-gradient(90deg, #dc2626, #ea580c)" }}
                    >
                      <Flame size={20} className="shrink-0 animate-pulse" />
                      <p className="text-sm sm:text-base font-bold">
                        FIRO Flash Discount Active! Extra ₹{item.firoDiscount}/bag off applied 🔥
                      </p>
                    </div>
                  )}

                  {/* 🎁 Introductory offer banner — jab qualify ho raha ho */}
                  {item.introQualifies && (
                    <div
                      className="-m-5 sm:-m-6 mb-4 sm:mb-5 px-5 sm:px-6 py-3 flex items-center gap-3 text-white"
                      style={{ background: "linear-gradient(90deg, #7E22CE, #C026D3)" }}
                    >
                      <Gift size={20} className="shrink-0" />
                      <p className="text-sm sm:text-base font-bold">
                        First Order Gift Unlocked! You'll receive {item.introOffer.gift} FREE 🎁
                      </p>
                    </div>
                  )}

                  {/* Intro offer hint — eligible hai lekin abhi qty kam hai */}
                  {item.introOffer &&
                    !item.introQualifies &&
                    isIntroEligible(item.introOffer.introId) && (
                      <p className="text-[11px] sm:text-xs text-purple-600 mb-3 font-medium">
                        🎁 {item.introOffer.minQty - item.quantity} bags aur lein, {item.introOffer.gift} FREE paayein (first order special)!
                      </p>
                  )}

                  <div className="flex flex-col lg:flex-row gap-5 lg:items-center lg:justify-between">
                    {/* Product */}
                    <div className="flex gap-4 items-start">
                      <div
                        className="w-24 h-24 rounded-2xl shrink-0 flex items-center justify-center text-3xl"
                        style={{ backgroundColor: "var(--color-gold-100)" }}
                      >
                        🌾
                      </div>

                      <div>
                        <h2 className="text-lg sm:text-xl font-bold" style={{ color: "var(--color-gold-800)" }}>
                          {item.name}
                        </h2>

                        <div className="mt-2 space-y-1 text-sm text-gray-500">
                          <p>SKU: {item.skuCode || "N/A"}</p>
                          <p>Grade: {item.grade || "Premium"}</p>
                          <p>Pack Size: {item.packSizes || "25kg"}</p>
                        </div>

                        <div className="mt-3 flex items-center gap-2 flex-wrap">
                          <span
                            className="px-3 py-1 rounded-full text-xs font-medium"
                            style={
                              item.inStock
                                ? { backgroundColor: "#f0fdf4", color: "#166534" }
                                : { backgroundColor: "#fef2f2", color: "#b91c1c" }
                            }
                          >
                            {item.inStock ? "In Stock" : "Out of Stock"}
                          </span>

                          {item.volumeDiscount > 0 && (
                            <span
                              className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
                              style={{ backgroundColor: "#eff6ff", color: "#1d4ed8" }}
                            >
                              <PackageCheck size={12} />
                              Volume: ₹{item.volumeDiscount}/bag
                            </span>
                          )}
                        </div>

                        {item.nextTier && (
                          <p className="text-[11px] sm:text-xs text-orange-600 mt-2 font-medium">
                            💡 {item.nextTier.minQty - item.quantity} bags aur lein, ₹
                            {item.nextTier.benefitPerBag}/bag discount paayein!
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Price + Actions */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-5">
                      <div className="text-left sm:text-center lg:text-right">
                        {item.discountPerBag > 0 && (
                          <p className="text-sm text-gray-400 line-through">
                            ₹{Math.round(item.basePrice * item.quantity).toLocaleString("en-IN")}
                          </p>
                        )}

                        <h3 className="text-2xl font-bold" style={{ color: "var(--color-gold-700)" }}>
                          ₹{Math.round(item.finalPrice * item.quantity).toLocaleString("en-IN")}
                        </h3>

                        <p className="text-xs text-green-600 mt-1">{item.skuId}</p>

                        {item.discountPerBag > 0 && (
                          <p className="text-[11px] text-green-700 font-semibold mt-0.5">
                            Saved ₹{Math.round(item.discountPerBag * item.quantity)}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3 flex-wrap">
                        <div
                          className="flex items-center rounded-2xl border overflow-hidden"
                          style={{ borderColor: "var(--color-gold-200)" }}
                        >
                          <button
                            onClick={() => decreaseQty(item.id)}
                            className="w-11 h-11 flex items-center justify-center hover:bg-gray-50 transition shrink-0"
                          >
                            <Minus size={16} />
                          </button>

                          <input
                            type="number"
                            min={1}
                            max={Number.isFinite(item.currentStock) ? item.currentStock : undefined}
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, e.target.value)}
                            onBlur={(e) => {
                              if (!e.target.value || Number(e.target.value) < 1) {
                                updateQuantity(item.id, 1);
                              } else if (Number(e.target.value) > item.currentStock) {
                                updateQuantity(item.id, item.currentStock);
                              }
                            }}
                            className="w-16 text-center font-semibold outline-none no-spinner"
                          />

                          <button
                            onClick={() => increaseQty(item.id)}
                            disabled={item.quantity >= item.currentStock}
                            className="w-11 h-11 flex items-center justify-center hover:bg-gray-50 transition shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="w-11 h-11 rounded-2xl flex items-center justify-center transition hover:scale-105"
                          style={{ backgroundColor: "#fef2f2", color: "#dc2626" }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div>
              <div
                className="bg-white rounded-3xl border shadow-sm p-6 sticky top-24"
                style={{ borderColor: "var(--color-gold-200)" }}
              >
                <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--color-gold-800)" }}>
                  Order Summary
                </h2>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Retailer ID</label>
                  <input
                    type="text"
                    value={retailerId}
                    readOnly
                    className="w-full border rounded-xl px-4 py-3 bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                </div>

                <div className="mb-6 space-y-3">
                  <p className="text-sm font-medium text-gray-700">Items</p>

                  {pricedItems.map((item) => (
                    <motion.div key={item.id} className="flex items-start justify-between gap-3 text-sm">
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800 truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          {item.skuCode || item.skuId || "—"}
                          {item.quantity > 1 && ` · Qty ${item.quantity}`}
                        </p>
                        {item.discountPerBag > 0 && (
                          <p className="text-[11px] text-green-600 font-medium">
                            −₹{item.discountPerBag}/bag ({item.appliedType})
                          </p>
                        )}
                        {item.introQualifies && (
                          <p className="text-[11px] text-purple-600 font-medium">
                            🎁 {item.introOffer.gift} FREE
                          </p>
                        )}
                      </div>

                      <span className="font-medium shrink-0">₹{(item.finalPrice).toFixed(2)}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-medium">₹{Math.round(subtotal).toLocaleString("en-IN")}</span>
                  </div>

                  {totalDiscount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-green-600 font-medium">Total Discount</span>
                      <span className="font-semibold text-green-600">
                        − ₹{Math.round(totalDiscount).toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}

                  <div
                    className="pt-4 border-t flex items-center justify-between"
                    style={{ borderColor: "var(--color-gold-200)" }}
                  >
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-2xl font-bold" style={{ color: "var(--color-gold-700)" }}>
                      ₹{Math.round(total).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <button
                  className="w-full mt-6 py-4 rounded-2xl text-white font-semibold text-base transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                  style={{ backgroundColor: "var(--color-gold-500)" }}
                  onClick={handleCheckout}
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Proceed To Checkout"}
                </button>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Truck size={18} />
                    Free delivery on orders above ₹3000
                  </div>

                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <ShieldCheck size={18} />
                    100% secure order processing
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}