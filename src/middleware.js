import { NextResponse } from "next/server";
import { getRequiredPermission, hasPermission } from "@/lib/admin/permission";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Ignore Next.js internals, static files, and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // ================= ADMIN ROUTES (naya block) =================
  if (pathname.startsWith("/admin")) {
    return handleAdminRoute(request, pathname);
  }

  // ================= RETAILER ROUTES (existing, untouched) =================
  const isLoggedIn = request.cookies.get("user-session")?.value;

  const publicRoutes = ["/login", "/registration", "/"];

  if (publicRoutes.includes(pathname)) {
    if (isLoggedIn && pathname === "/login") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// ================= Admin Route Handler =================

function handleAdminRoute(request, pathname) {
  // /admin/login hamesha publicly accessible hai (warna login hi nahi kar payenge)
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const adminSessionCookie = request.cookies.get("admin_session")?.value;

  // Session hi nahi hai — login page bhejo
  if (!adminSessionCookie) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  let admin;
  try {
    admin = JSON.parse(adminSessionCookie);
  } catch {
    // Corrupt cookie — safe side, login pe bhej do
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  const requiredPermission = getRequiredPermission(pathname);

  // Agar is route ke liye koi specific permission define nahi hai, allow kar do
  // (jaise koi generic admin page jo sabko dikhni chahiye)
  if (!requiredPermission) {
    return NextResponse.next();
  }

  const allowed = hasPermission(admin.role, requiredPermission);

  if (!allowed) {
    // Permission nahi hai — "Access Denied" page par bhejo
    return NextResponse.redirect(new URL("/admin/access-denied", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};