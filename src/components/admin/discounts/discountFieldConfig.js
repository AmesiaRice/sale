export const DISCOUNT_CONFIG = {
  volume: {
    label: "Volume Discounts",
    idKey: "Volume ID",
    statusKey: "Active Status",
    fields: [
      { key: "SKU ID", label: "SKU ID", type: "text" },
      { key: "Minimum Order Qty", label: "Min Qty", type: "number" },
      { key: "Volume Benefit ₹/Bag", label: "Benefit ₹/Bag", type: "number" },
    ],
    columns: ["SKU ID", "Minimum Order Qty", "Volume Benefit ₹/Bag", "Active Status"],
  },
  firo: {
    label: "FIRO (Flash) Offers",
    idKey: "FIRO ID",
    statusKey: "Status",
    fields: [
      { key: "FIRO Name", label: "Offer Name", type: "text" },
      { key: "SKU ID", label: "SKU ID", type: "text" },
      { key: "SKU Name", label: "SKU Name", type: "text" },
      { key: "Offer Start DateTime", label: "Start", type: "datetime-local" },
      { key: "Offer End DateTime", label: "End", type: "datetime-local" },
      { key: "Minimum Order Qty", label: "Min Qty", type: "number" },
      { key: "FIRO Benefit ₹/Bag", label: "Benefit ₹/Bag", type: "number" },
      { key: "Remarks", label: "Remarks", type: "text" },
    ],
    columns: ["FIRO Name", "SKU ID", "Offer Start DateTime", "Offer End DateTime", "FIRO Benefit ₹/Bag", "Status"],
  },
  intro: {
    label: "Introductory Offers",
    idKey: "INTD_ID",
    statusKey: "Active Status",
    fields: [
      { key: "SKU ID", label: "SKU ID", type: "text" },
      { key: "Minimum Order Qty", label: "Min Qty", type: "number" },
      { key: "GIFT", label: "Gift Description", type: "text" },
      { key: "Remarks", label: "Remarks", type: "text" },
    ],
    columns: ["SKU ID", "Minimum Order Qty", "GIFT", "Active Status"],
  },
};