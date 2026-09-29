"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useCart } from "@/components/providers/CartProvider";
import { CheckoutForm } from "./CheckoutForm";
import Link from "next/link";
import { Button } from "@/components/ui";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PIResponse {
  clientSecret: string;
  paymentIntentId: string;
  subtotalCents: number;
}

export function CheckoutShell() {
  const { items, itemCount } = useCart();
  const [piData, setPIData] = useState<PIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!items.length) return;

    const lines = items.map((i) => ({ variantId: i.variantId, qty: i.quantity }));

    fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lines, email: "pending@checkout.local" }),
    })
      .then((r) => r.json())
      .then((data: PIResponse & { error?: string }) => {
        if (data.error) {
          setError(data.error);
        } else {
          setPIData(data);
        }
      })
      .catch(() => setError("Could not initialize checkout. Please try again."));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (itemCount === 0) {
    return (
      <div className="flex flex-col items-center gap-5 py-24 text-center">
        <p className="text-[22px] font-semibold text-ink">Your bag is empty.</p>
        <Link href="/iphone">
          <Button variant="primary">Shop iPhone</Button>
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[16px] border border-line bg-surface p-6 text-[15px] text-ink">
        <p className="font-semibold mb-1">Something went wrong.</p>
        <p className="text-ink-2 mb-4">{error}</p>
        <Link href="/bag">
          <Button variant="secondary">Back to bag</Button>
        </Link>
      </div>
    );
  }

  if (!piData) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="text-[15px] text-ink-2">Loading checkout…</span>
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret: piData.clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#0B5FD9",
            borderRadius: "12px",
            fontFamily: "Inter, system-ui, sans-serif",
          },
        },
      }}
    >
      <CheckoutForm
        subtotalCents={piData.subtotalCents}
        paymentIntentId={piData.paymentIntentId}
      />
    </Elements>
  );
}
