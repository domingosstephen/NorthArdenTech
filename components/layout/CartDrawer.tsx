"use client";

import Link from "next/link";
import { useCart } from "@/components/providers/CartProvider";
import { Button, Drawer } from "@/components/ui";

export function CartDrawer() {
  const { items, itemCount, isOpen, closeCart, removeItem } = useCart();

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <Drawer open={isOpen} onClose={closeCart} title="Your Bag">
      {itemCount === 0 ? (
        <div className="flex flex-col items-start gap-4 p-6">
          <p className="text-[17px] text-ink-2">Your bag is empty.</p>
          <Link href="/iphone" onClick={closeCart}>
            <Button variant="secondary" size="sm">Shop iPhone</Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          {/* Line items */}
          <ul className="flex-1 overflow-y-auto divide-y divide-line">
            {items.map((item) => (
              <li key={item.variantId} className="flex gap-4 p-4">
                {/* Image placeholder */}
                <div className="w-16 h-16 shrink-0 rounded-[8px] bg-surface flex items-center justify-center">
                  <span className="text-[10px] text-ink-2 text-center leading-tight px-1">
                    {item.familyName}
                  </span>
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium text-ink truncate">{item.familyName}</p>
                  <p className="text-[13px] text-ink-2" style={{ fontFeatureSettings: '"tnum" 1' }}>
                    {item.condition !== "new" ? `${item.condition} · ` : ""}
                    {item.storage}
                  </p>
                  <p className="mt-1 text-[15px] font-medium text-ink" style={{ fontFeatureSettings: '"tnum" 1' }}>
                    {item.price === 0 ? "[PRICE]" : `$${item.price.toLocaleString()}`}
                  </p>
                </div>
                {/* Remove */}
                <button
                  onClick={() => removeItem(item.variantId)}
                  aria-label={`Remove ${item.familyName}`}
                  className="self-start p-1 text-ink-2 hover:text-ink transition-colors duration-[120ms] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>

          {/* Summary */}
          <div className="border-t border-line p-4 space-y-3 shrink-0">
            <div className="flex justify-between text-[15px]">
              <span className="text-ink-2">Subtotal</span>
              <span className="font-medium text-ink" style={{ fontFeatureSettings: '"tnum" 1' }}>
                {subtotal === 0 ? "[PRICE]" : `$${subtotal.toLocaleString()}`}
              </span>
            </div>
            <p className="text-[12px] text-ink-2">
              Shipping and taxes calculated at checkout.
            </p>
            <Link href="/bag" onClick={closeCart} className="block w-full">
              <Button variant="primary" className="w-full">Check Out</Button>
            </Link>
          </div>
        </div>
      )}
    </Drawer>
  );
}
