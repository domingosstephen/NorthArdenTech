"use client";

import { useState, useTransition, useCallback } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
  AddressElement,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui";

interface Props {
  subtotalCents: number;
  paymentIntentId: string;
}

export function CheckoutForm({ subtotalCents, paymentIntentId }: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fmt = (cents: number) =>
    (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!stripe || !elements) return;

      setErrorMessage(null);

      startTransition(async () => {
        const { error } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/order/confirm?pi=${paymentIntentId}`,
          },
        });

        if (error) {
          // confirmPayment only rejects with error if it can't redirect
          setErrorMessage(
            error.message ?? "Your payment didn't go through. No charge was made."
          );
        }
        // On success Stripe redirects to return_url — no code needed here
      });
    },
    [stripe, elements, paymentIntentId]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Contact */}
      <section>
        <h2 className="text-[18px] font-semibold text-ink mb-4">Contact</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-[14px] font-medium text-ink mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full rounded-[12px] border border-line bg-bg px-4 py-3 text-[15px] text-ink placeholder:text-ink-2 focus:outline-2 focus:outline-offset-2 focus:outline-accent"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-[14px] font-medium text-ink mb-1" htmlFor="phone">
              Phone <span className="font-normal text-ink-2">(for delivery updates)</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              className="w-full rounded-[12px] border border-line bg-bg px-4 py-3 text-[15px] text-ink placeholder:text-ink-2 focus:outline-2 focus:outline-offset-2 focus:outline-accent"
              placeholder="+1 (555) 000-0000"
            />
          </div>
        </div>
      </section>

      {/* Shipping */}
      <section>
        <h2 className="text-[18px] font-semibold text-ink mb-4">Shipping</h2>
        <AddressElement
          options={{
            mode: "shipping",
            allowedCountries: ["US"],
            autocomplete: { mode: "automatic" },
            fields: { phone: "always" },
          }}
        />
        <p className="mt-3 text-[13px] text-ink-2">
          Signature required on delivery.
        </p>
      </section>

      {/* Payment */}
      <section>
        <h2 className="text-[18px] font-semibold text-ink mb-4">Payment</h2>
        <p className="text-[13px] text-ink-2 mb-3">
          Payment is processed securely by Stripe. We never see or store your card number.
        </p>
        <PaymentElement
          options={{
            layout: "tabs",
          }}
        />
      </section>

      {errorMessage && (
        <p role="alert" className="rounded-[12px] bg-[#FFF2F2] border border-[#FECACA] px-4 py-3 text-[14px] text-[#B91C1C]">
          {errorMessage} <button type="button" className="underline ml-1 font-medium" onClick={() => setErrorMessage(null)}>Try again</button>
        </p>
      )}

      <div className="border-t border-line pt-4 space-y-2 text-[15px]">
        <div className="flex justify-between">
          <span className="text-ink-2">Subtotal</span>
          <span className="font-medium text-ink tabular-nums">{fmt(subtotalCents)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-ink-2">Shipping</span>
          <span className="text-ink-2">[FREE / calculated at checkout]</span>
        </div>
        <div className="flex justify-between">
          <span className="text-ink-2">Tax</span>
          <span className="text-ink-2">Calculated at checkout</span>
        </div>
        <div className="flex justify-between text-[17px] font-semibold text-ink pt-2 border-t border-line">
          <span>Total</span>
          <span className="tabular-nums">{fmt(subtotalCents)}</span>
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        className="w-full"
        loading={isPending}
        disabled={!stripe || !elements}
      >
        {isPending ? "Processing…" : `Pay ${fmt(subtotalCents)}`}
      </Button>

      <p className="text-[12px] text-ink-2 text-center">
        Your items are held for 15 minutes.
      </p>
    </form>
  );
}
