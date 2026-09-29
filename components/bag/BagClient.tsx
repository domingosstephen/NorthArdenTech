"use client";

import Link from "next/link";
import { useCart } from "@/components/providers/CartProvider";
import { Button, SpecRail } from "@/components/ui";
import type { CartItem } from "@/lib/commerce/types";

export function BagClient() {
  const { items, itemCount, removeItem } = useCart();
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  if (itemCount === 0) {
    return (
      <div className="flex flex-col items-center gap-5 py-24 text-center">
        <p className="text-[22px] font-semibold text-ink">Your bag is empty.</p>
        <p className="text-[15px] text-ink-2">Add an iPhone to get started.</p>
        <Link href="/iphone">
          <Button variant="primary">Shop iPhone</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-10">
      {/* Line items */}
      <div className="flex-1">
        <ul className="divide-y divide-line">
          {items.map((item) => (
            <BagLineItem key={item.variantId} item={item} onRemove={() => removeItem(item.variantId)} />
          ))}
        </ul>
      </div>

      {/* Summary */}
      <aside className="lg:w-[340px] shrink-0">
        <div className="rounded-[16px] border border-line bg-surface p-6 space-y-4">
          <h2 className="text-[18px] font-semibold text-ink">Order summary</h2>

          <div className="space-y-2 text-[15px]">
            <div className="flex justify-between">
              <span className="text-ink-2">Subtotal</span>
              <span className="font-medium text-ink" style={{ fontFeatureSettings: '"tnum" 1' }}>
                {subtotal === 0 ? "[PRICE]" : `$${subtotal.toLocaleString()}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-2">Shipping</span>
              <span className="text-ink-2">[FREE / calculated at checkout]</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-2">Estimated tax</span>
              <span className="text-ink-2">Calculated at checkout</span>
            </div>
          </div>

          <div className="border-t border-line pt-3 flex justify-between text-[17px] font-semibold text-ink">
            <span>Total</span>
            <span style={{ fontFeatureSettings: '"tnum" 1' }}>
              {subtotal === 0 ? "[PRICE]" : `$${subtotal.toLocaleString()}`}
            </span>
          </div>

          <Link href="/checkout" className="block">
            <Button variant="primary" className="w-full">
              Check Out
            </Button>
          </Link>
          <p className="text-[12px] text-ink-2 text-center">
            Secure checkout. Payment processed by Stripe.
          </p>
        </div>
      </aside>
    </div>
  );
}

function BagLineItem({ item, onRemove }: { item: CartItem; onRemove: () => void }) {
  const specFacts = [
    { label: "Condition", value: item.condition.charAt(0).toUpperCase() + item.condition.slice(1) },
    { label: "Storage", value: item.storage },
    ...(item.batteryFloor ? [{ label: "Battery", value: item.batteryFloor }] : []),
  ];

  return (
    <li className="flex gap-4 py-5">
      {/* Thumbnail */}
      <div className="w-20 h-20 shrink-0 rounded-[10px] bg-surface flex items-center justify-center">
        <span className="text-[10px] text-ink-2 text-center px-1 leading-tight">
          {item.familyName.replace("iPhone ", "")}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[16px] font-semibold text-ink">{item.familyName}</p>
        <p className="text-[14px] text-ink-2 capitalize">{item.finish}</p>
        <SpecRail facts={specFacts} condensed className="mt-1 text-[13px]" />
        <p
          className="mt-2 text-[15px] font-semibold text-ink"
          style={{ fontFeatureSettings: '"tnum" 1' }}
        >
          {item.price === 0 ? "[PRICE]" : `$${item.price.toLocaleString()}`}
        </p>
      </div>

      {/* Qty note + remove */}
      <div className="flex flex-col items-end gap-2 shrink-0">
        <span className="text-[13px] text-ink-2">Qty: {item.quantity}</span>
        <button
          onClick={onRemove}
          aria-label={`Remove ${item.familyName}`}
          className="text-[13px] text-accent hover:text-accent-press transition-colors duration-[120ms] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Remove
        </button>
      </div>
    </li>
  );
}
