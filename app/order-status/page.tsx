import type { Metadata } from "next";
import { OrderStatusClient } from "@/components/order-status/OrderStatusClient";

export const metadata: Metadata = {
  title: "Check Your Order — NorthArdenTech",
  robots: { index: false },
};

export default function OrderStatusPage() {
  return (
    <main className="min-h-screen bg-bg">
      <div className="max-w-[480px] mx-auto px-6 py-16">
        <h1 className="text-[40px] font-semibold tracking-[-0.02em] text-ink mb-3">
          Check your order.
        </h1>
        <p className="text-[17px] text-ink-2 mb-10">
          Enter the email address and order number from your confirmation email.
        </p>
        <OrderStatusClient />
      </div>
    </main>
  );
}
