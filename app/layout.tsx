import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/providers/CartProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";

const inter = Inter({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "NorthArdenTech",
    template: "%s | NorthArdenTech",
  },
  description:
    "Shop iPhone — new and pre-owned, every model from 14 to Duo, with condition and battery health shown upfront.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <CartProvider>
          {/* Header is an async RSC — safe as child of client CartProvider */}
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          {/* Bag drawer — reads cart context */}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
