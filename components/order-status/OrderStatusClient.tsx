"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui";
import Link from "next/link";

interface OrderResult {
  number: string;
  status: string;
  createdAt: string;
  totalCents: number;
}

export function OrderStatusClient() {
  const [email, setEmail] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [result, setResult] = useState<OrderResult | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isPending, startTransition] = useTransition();

  const fmt = (cents: number) =>
    (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNotFound(false);
    setResult(null);

    startTransition(async () => {
      const res = await fetch(
        `/api/orders/lookup?email=${encodeURIComponent(email)}&number=${encodeURIComponent(orderNumber)}`
      );
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        setNotFound(true);
      }
    });
  }

  if (result) {
    return (
      <div className="space-y-6">
        <div className="rounded-[16px] border border-line bg-surface p-6 space-y-3">
          <div className="flex justify-between text-[15px]">
            <span className="text-ink-2">Order</span>
            <span className="font-semibold text-ink">{result.number}</span>
          </div>
          <div className="flex justify-between text-[15px]">
            <span className="text-ink-2">Status</span>
            <span className="font-medium text-ink capitalize">
              {result.status.replace("_", " ")}
            </span>
          </div>
          <div className="flex justify-between text-[15px]">
            <span className="text-ink-2">Total</span>
            <span className="tabular-nums text-ink">{fmt(result.totalCents)}</span>
          </div>
        </div>
        <Link
          href={`/order/${encodeURIComponent(result.number)}`}
          className="inline-flex items-center rounded-[980px] bg-accent px-6 py-3 text-[15px] font-semibold text-white hover:bg-accent-press transition-colors duration-[120ms]"
        >
          View order details
        </Link>
        <button
          type="button"
          onClick={() => { setResult(null); setEmail(""); setOrderNumber(""); }}
          className="block text-[14px] text-accent hover:text-accent-press transition-colors duration-[120ms]"
        >
          Look up another order
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-[14px] font-medium text-ink mb-1" htmlFor="os-email">
          Email
        </label>
        <input
          id="os-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-[12px] border border-line bg-bg px-4 py-3 text-[15px] text-ink placeholder:text-ink-2 focus:outline-2 focus:outline-offset-2 focus:outline-accent"
        />
      </div>

      <div>
        <label className="block text-[14px] font-medium text-ink mb-1" htmlFor="os-number">
          Order number
        </label>
        <input
          id="os-number"
          type="text"
          required
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="NAT-10421"
          className="w-full rounded-[12px] border border-line bg-bg px-4 py-3 text-[15px] text-ink placeholder:text-ink-2 focus:outline-2 focus:outline-offset-2 focus:outline-accent"
        />
      </div>

      {notFound && (
        <p role="alert" className="rounded-[12px] bg-[#FFF9F0] border border-[#FDE68A] px-4 py-3 text-[14px] text-[#92400E]">
          We couldn&apos;t find that order. Check the number in your confirmation email.
        </p>
      )}

      <Button type="submit" variant="primary" loading={isPending} className="w-full mt-2">
        Find order
      </Button>
    </form>
  );
}
