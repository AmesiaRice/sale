"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { useRetailersList } from "@/hooks/admin/useRetailersList";

const Select = dynamic(() => import("react-select"), { ssr: false });

const selectStyles = {
  menu: (base) => ({ ...base, zIndex: 9999 }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};

export default function RetailerSearchSelect({ selectedRetailer, onSelect }) {
  const { retailers, isLoading } = useRetailersList();

  const options = useMemo(
    () =>
      retailers.map((r) => ({
        value: r.retailerId,
        label: `${r.name} · ${r.companyName} · ${r.phone}`,
        retailer: r,
      })),
    [retailers]
  );

  return (
    <div className="max-w-md relative z-50">
      <label className="block text-xs font-semibold text-gray-600 mb-1">Select Retailer</label>
      <Select
        options={options}
        isLoading={isLoading}
        value={
          selectedRetailer
            ? options.find((o) => o.value === selectedRetailer.retailerId)
            : null
        }
        onChange={(option) => onSelect(option ? option.retailer : null)}
        placeholder="Search retailer by name, company, or phone..."
        isClearable
        isSearchable
        menuPortalTarget={typeof document !== "undefined" ? document.body : null}
        styles={selectStyles}
      />
    </div>
  );
}