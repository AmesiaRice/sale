// lib/orderStatus.js
// Order status ka color mapping — admin dropdown aur retailer-facing order
// tracking dono isi se lete hain, taaki dono jagah same colors/labels rahein.

export const STATUS_OPTIONS = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

export const STATUS_COLORS = {
  Pending: { bg: "#FEF3C7", text: "#92400E" },
  Processing: { bg: "#DBEAFE", text: "#1E40AF" },
  Shipped: { bg: "#E0E7FF", text: "#4338CA" },
  Delivered: { bg: "#D1FAE5", text: "#065F46" },
  Cancelled: { bg: "#FEE2E2", text: "#7F1D1D" },
};

export function getStatusColors(status) {
  return STATUS_COLORS[status] || STATUS_COLORS.Pending;
}
