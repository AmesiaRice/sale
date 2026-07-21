"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";

export default function ConditionalChrome({ children }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    // Admin routes: no navbar, no footer, no mobile bottom nav, no extra padding
    return <div className="flex flex-col flex-1">{children}</div>;
  }

  return (
    <div className="flex flex-col flex-1 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
      <Navbar />
      {children}
      <Footer />
      <MobileBottomNav />
    </div>
  );
}