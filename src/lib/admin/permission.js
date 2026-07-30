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
    "dispatch",
    "dispatch:edit",
  ],
  manager: ["orders", "orders:edit", "dispatch", "dispatch:edit"],
  sales_support: ["enquiries", "enquiries:edit","place_order_on_behalf","retailers"],
  discount_manager: ["discounts", "discounts:edit"],
  field_executive: ["place_order_on_behalf","retailers","enquiries"],
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
  "/admin/dispatch": "dispatch",
  "/admin/retailers": "retailers",
  "/admin/discounts": "discounts",
  "/admin/enquiries": "enquiries",
  "/admin/place-order": "place_order_on_behalf",
};

export function getDefaultRouteForRole(role) {
  const permissions = ROLE_PERMISSIONS[role] || [];

  for (const [route, requiredPermission] of Object.entries(ROUTE_PERMISSIONS)) {
    if (permissions.includes(requiredPermission)) {
      return route;
    }
  }

  // Agar role ke paas koi bhi route permission nahi hai
  return "/admin/access-denied";
}
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