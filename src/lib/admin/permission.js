// ================= Role → Permissions Mapping =================
// Har role ke paas jo bhi permissions hain, wo yaha define hain.
// Naya role add karna ho to bas ek naya key add karo.

export const ROLE_PERMISSIONS = {
  super_admin: [
    "overview",
    "orders",
    "orders:edit",
    "retailers",
    "discounts",
    "discounts:edit",
    "enquiries",
    "enquiries:edit",
    "place_order_on_behalf",
  ],
  manager: ["orders", "orders:edit"],
  sales_support: ["enquiries", "enquiries:edit"],
  discount_manager: ["discounts", "discounts:edit"],
  field_executive: ["place_order_on_behalf"],
};

/**
 * Check karta hai ki diya gaya role, diyi gayi permission rakhta hai ya nahi.
 */
export function hasPermission(role, permission) {
  if (!role || !permission) return false;
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  return permissions.includes(permission);
}

/**
 * Route path → required permission mapping.
 * Middleware isko use karega ye check karne ke liye ki
 * kaunse route ke liye kaunsi permission chahiye.
 */
export const ROUTE_PERMISSIONS = {
  "/admin": "overview",
  "/admin/orders": "orders",
  "/admin/retailers": "retailers",
  "/admin/discounts": "discounts",
  "/admin/enquiries": "enquiries",
  "/admin/place-order": "place_order_on_behalf",
};

/**
 * Diye gaye pathname ke liye required permission dhoondta hai.
 * Sabse specific (longest) match ko priority deta hai.
 */
export function getRequiredPermission(pathname) {
  const matchingRoutes = Object.keys(ROUTE_PERMISSIONS)
    .filter((route) => pathname === route || pathname.startsWith(`${route}/`))
    .sort((a, b) => b.length - a.length); // longest match first

  if (matchingRoutes.length === 0) return null;
  return ROUTE_PERMISSIONS[matchingRoutes[0]];
}