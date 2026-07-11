import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import Footer from "@/components/layout/Footer";
import { CartProvider } from "@/app/context/CartContext";
import { Playfair_Display, DM_Sans } from "next/font/google";
import SWRProvider from "@/components/layout/SWRProvider"; // 👈 alag file se import

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata = {
  title: "Saifco Basmati Rice — SKU Catalogue",
  description:
    "Manufacturer, Exporter & Supplier of Premium Basmati Rice. Browse Uttam, Golden, Silver, and Premium SKU lines.",
  icons: {
    icon: "/saifco logo.webp",
    shortcut: "/saifco logo.webp",
    apple: "/saifco logo.webp",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="min-h-screen flex flex-col font-[family-name:var(--font-body)]">
        <CartProvider>
          <Navbar />
          <div className="flex flex-col flex-1 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
            <SWRProvider>{children}</SWRProvider>
          </div>
          <Footer />
          <MobileBottomNav />
        </CartProvider>
      </body>
    </html>
  );
}