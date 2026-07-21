"use client";

import { useState, useMemo } from "react";
import { useDiscountsAdmin } from "@/hooks/admin/useDiscountsAdmin";
import { useSkuData } from "@/hooks/useSkuData";
import { DISCOUNT_CONFIG } from "./discountFieldConfig";

const TABS = [
  { key: "volume", label: "Volume Discounts" },
  { key: "firo", label: "FIRO Offers" },
  { key: "intro", label: "Introductory" },
];

// Case/whitespace-insensitive key lookup — Sheet ke exact header naam se
// thoda bhi mismatch ho (space, capitalization), tab bhi value mil jaye
function getRowValue(row, key) {
  if (row[key] !== undefined) return row[key];
  const targetKey = String(key).trim().toLowerCase();
  const foundKey = Object.keys(row).find(
    (k) => String(k).trim().toLowerCase() === targetKey
  );
  return foundKey ? row[foundKey] : undefined;
}

export default function DiscountsManagement() {
  const [activeTab, setActiveTab] = useState("volume");
  const [showForm, setShowForm] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const config = DISCOUNT_CONFIG[activeTab];

  const { rows, isLoading, createDiscount, setStatus } = useDiscountsAdmin(activeTab);
  const { skuLines } = useSkuData();

  const [formData, setFormData] = useState({});

  // Saare products ki flat list — SKU dropdown ke liye
  const allProducts = useMemo(
    () => skuLines.flatMap((line) => line.variants || []),
    [skuLines]
  );

  const handleFieldChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Jab SKU ID select ho, agar form mein "SKU Name" field bhi hai to auto-fill karo
  const handleSkuSelect = (skuId) => {
    const product = allProducts.find((p) => p.skuId === skuId);
    setFormData((prev) => ({
      ...prev,
      "SKU ID": skuId,
      ...(product && config.fields.some((f) => f.key === "SKU Name")
        ? { "SKU Name": product.name }
        : {}),
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const result = await createDiscount({ ...formData, [config.statusKey]: "Active" });
    if (result.success) {
      setFormData({});
      setShowForm(false);
    } else {
      alert(result.message || "Failed to create");
    }
  };

  const toggleStatus = async (row) => {
    const id = getRowValue(row, config.idKey);
    const currentStatus = getRowValue(row, config.statusKey);

    if (!id) {
      alert(
        `Could not find ID for this row. Check that the sheet column "${config.idKey}" exists and matches.`
      );
      return;
    }

    setUpdatingId(id);

    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    const result = await setStatus(id, config.statusKey, newStatus);

    setUpdatingId(null);

    if (!result.success) {
      alert(result.message || "Failed to update status");
    }
  };

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-2xl font-bold" style={{ color: "var(--color-gold-800)" }}>
        Discounts Management
      </h1>

      {/* Tabs */}
      <div className="flex gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setShowForm(false);
              setFormData({});
            }}
            className="px-4 py-2 rounded-full text-sm font-semibold cursor-pointer"
            style={{
              backgroundColor: activeTab === tab.key ? "var(--color-gold-500)" : "var(--color-gold-100)",
              color: activeTab === tab.key ? "#fff" : "var(--color-gold-700)",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* <button
        onClick={() => setShowForm((prev) => !prev)}
        className="text-sm font-semibold px-4 py-2 rounded-lg text-white cursor-pointer"
        style={{ backgroundColor: "var(--color-gold-500)" }}
      >
        {showForm ? "Cancel" : `+ New ${config.label}`}
      </button> */}

      {/* Create Form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-2xl border p-5 grid grid-cols-2 gap-4"
          style={{ borderColor: "var(--color-gold-200)" }}
        >
          {config.fields.map((field) => {
            // SKU ID field ko dropdown bana do (existing products se)
            if (field.key === "SKU ID") {
              return (
                <div key={field.key} className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600">{field.label}</label>
                  <select
                    value={formData["SKU ID"] || ""}
                    onChange={(e) => handleSkuSelect(e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm cursor-pointer"
                    style={{ borderColor: "var(--color-gold-200)" }}
                    required
                  >
                    <option value="">Select a product...</option>
                    {allProducts.map((p) => (
                      <option key={p.skuId} value={p.skuId}>
                        {p.name} ({p.skuId})
                      </option>
                    ))}
                  </select>
                </div>
              );
            }

            // SKU Name field auto-filled hai, isliye readonly dikhaate hain
            if (field.key === "SKU Name") {
              return (
                <div key={field.key} className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600">{field.label}</label>
                  <input
                    type="text"
                    value={formData["SKU Name"] || ""}
                    readOnly
                    placeholder="Auto-filled after selecting SKU"
                    className="border rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500"
                    style={{ borderColor: "var(--color-gold-200)" }}
                  />
                </div>
              );
            }

            return (
              <div key={field.key} className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600">{field.label}</label>
                <input
                  type={field.type}
                  value={formData[field.key] || ""}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  className="border rounded-lg px-3 py-2 text-sm"
                  style={{ borderColor: "var(--color-gold-200)" }}
                  required
                />
              </div>
            );
          })}
          <button
            type="submit"
            className="col-span-2 text-sm font-semibold px-4 py-2 rounded-lg text-white w-fit cursor-pointer"
            style={{ backgroundColor: "var(--color-gold-700)" }}
          >
            Save
          </button>
        </form>
      )}

      {/* List Table */}
      {isLoading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : (
        <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "var(--color-gold-200)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "var(--color-gold-50)" }}>
                {config.columns.map((col) => (
                  <th key={col} className="text-left px-4 py-3 font-semibold" style={{ color: "var(--color-gold-700)" }}>
                    {col}
                  </th>
                ))}
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => {
                const statusValue = getRowValue(row, config.statusKey);
                const rowId = getRowValue(row, config.idKey);
                const isUpdating = updatingId === rowId;

                return (
                  <tr key={idx} className="border-t" style={{ borderColor: "var(--color-gold-100)" }}>
                    {config.columns.map((col) => (
                      <td key={col} className="px-4 py-3">
                        {col === config.statusKey ? (
                          <span
                            className="text-xs font-semibold px-2 py-1 rounded-full"
                            style={{
                              backgroundColor: statusValue === "Active" ? "#D1FAE5" : "#FEE2E2",
                              color: statusValue === "Active" ? "#065F46" : "#991B1B",
                            }}
                          >
                            {statusValue || "Inactive"}
                          </span>
                        ) : (
                          String(getRowValue(row, col) ?? "")
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => toggleStatus(row)}
                        disabled={isUpdating}
                        className="text-xs font-semibold cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 hover:underline"
                        style={{ color: "var(--color-gold-600)" }}
                      >
                        {isUpdating ? "Updating..." : statusValue === "Active" ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={config.columns.length + 1} className="text-center text-gray-400 py-8">
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}