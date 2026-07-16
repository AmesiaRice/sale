"use client";

import { useState, useMemo } from "react";
import { Search, PackageOpen, X } from "lucide-react";
import { useRetailerId } from "@/hooks/useRetailerId";
import { useOrderHistory } from "@/hooks/useOrderHistory";
import OrderCard from "./OrderCard";

export default function OrderHistoryPage() {
  const { retailerId, isLoading: retailerLoading } = useRetailerId();
  const [searchInput, setSearchInput] = useState("");

  // Debounce ke bina bhi kaam chalega kyunki user Enter/button dabayega search ke liye
  const [activeSearch, setActiveSearch] = useState("");

  const { orders, isLoading, error } = useOrderHistory({
    retailerId: activeSearch ? null : retailerId,
    orderId: activeSearch || null,
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setActiveSearch(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setActiveSearch("");
  };

  const isSearchMode = Boolean(activeSearch);

  // Loading state — jab tak retailerId khud load ho raha hai (session fetch)
  const showLoading = (retailerLoading && !isSearchMode) || isLoading;

  return (
    <div
      className="min-h-screen px-4 py-6 sm:px-6 lg:px-8"
      style={{ background: "linear-gradient(to bottom, #fffdf8, #f8f4ea)" }}
    >
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: "var(--color-gold-800)" }}>
            My Orders
          </h1>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">
            Apna order history dekhein, ya Order ID se search karein.
          </p>
        </div>

        {/* Search box */}
        <form onSubmit={handleSearchSubmit} className="mb-8">
          <div
            className="flex items-center gap-2 bg-white rounded-2xl border px-4 py-3 shadow-sm"
            style={{ borderColor: "var(--color-gold-200)" }}
          >
            <Search size={18} style={{ color: "var(--color-gold-400)" }} />

            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by Order ID (e.g. ORD-RET123-172...)"
              className="flex-1 outline-none text-sm bg-transparent"
              style={{ color: "var(--color-gold-900)" }}
            />

            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="shrink-0 p-1 rounded-full hover:bg-gray-100"
              >
                <X size={16} style={{ color: "var(--color-gold-400)" }} />
              </button>
            )}

            <button
              type="submit"
              className="shrink-0 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all"
              style={{ backgroundColor: "var(--color-gold-500)" }}
            >
              Search
            </button>
          </div>
        </form>

        {/* Section label */}
        <p
          className="text-[11px] tracking-widest font-semibold mb-4 uppercase"
          style={{ color: "var(--color-gold-400)" }}
        >
          {isSearchMode ? `Search Result` : "Your Order History"}
        </p>

        {/* Loading state */}
        {showLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 rounded-2xl bg-white border animate-pulse"
                style={{ borderColor: "var(--color-gold-200)" }}
              />
            ))}
          </div>
        )}

        {/* Error state */}
        {!showLoading && error && (
          <div
            className="bg-white rounded-2xl p-8 text-center border"
            style={{ borderColor: "var(--color-gold-200)" }}
          >
            <p className="text-sm" style={{ color: "#8A2A1F" }}>
              Failed to load orders. Please try again.
            </p>
          </div>
        )}

        {/* Empty state */}
        {!showLoading && !error && orders.length === 0 && (
          <div
            className="bg-white rounded-2xl p-10 text-center border"
            style={{ borderColor: "var(--color-gold-200)" }}
          >
            <PackageOpen
              size={32}
              className="mx-auto mb-3"
              style={{ color: "var(--color-gold-400)" }}
            />
            <h2 className="text-lg font-bold mb-1" style={{ color: "var(--color-gold-700)" }}>
              {isSearchMode ? "Order Nahi Mila" : "Koi Order Nahi Hai"}
            </h2>
            <p className="text-sm text-gray-500">
              {isSearchMode
                ? "Ye Order ID hamare records mein nahi mila. Sahi ID check karein."
                : "Aapne abhi tak koi order place nahi kiya hai."}
            </p>
          </div>
        )}

        {/* Orders list */}
        {!showLoading && !error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.orderId} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}