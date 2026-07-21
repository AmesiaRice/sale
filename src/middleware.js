import { NextResponse } from "next/server";
import { getRequiredPermission, hasPermission } from "@/lib/admin/permission";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    return handleAdminRoute(request, pathname);
  }

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

function handleAdminRoute(request, pathname) {
  // /admin/login aur /admin/access-denied hamesha publicly accessible hain
  if (pathname === "/admin/login" || pathname === "/admin/access-denied") {
    return NextResponse.next();
  }

  const adminSessionCookie = request.cookies.get("admin_session")?.value;

  if (!adminSessionCookie) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  let admin;
  try {
    admin = JSON.parse(adminSessionCookie);
  } catch {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  const requiredPermission = getRequiredPermission(pathname);

  if (!requiredPermission) {
    return NextResponse.next();
  }

  const allowed = hasPermission(admin.role, requiredPermission);

  if (!allowed) {
    return NextResponse.redirect(new URL("/admin/access-denied", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};