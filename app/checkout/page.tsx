import type { Metadata } from "next";
import { CheckoutShell } from "@/components/checkout/CheckoutShell";

export const metadata: Metadata = {
  title: "Checkout — NorthArdenTech",
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-bg">
      <div className="max-w-[760px] mx-auto px-6 py-16">
        <h1 className="text-[40px] font-semibold tracking-[-0.02em] text-ink mb-10">
          Checkout.
        </h1>
        <CheckoutShell />
      </div>
    </main>
  );
}
