"use client";

// Stripe redirects here after payment: /order/confirm?pi=pi_xxx
// We poll until the webhook creates the order, then redirect to /order/[number].

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function OrderConfirmInner() {
  const router = useRouter();
  const params = useSearchParams();
  const pi = params.get("pi");
  const [attempts, setAttempts] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!pi) {
      router.replace("/");
      return;
    }

    async function poll() {
      const res = await fetch(`/api/orders/by-pi?pi=${pi}`);
      if (res.ok) {
        const { number } = await res.json();
        router.replace(`/order/${encodeURIComponent(number)}`);
        return;
      }

      if (attempts < 12) {
        setAttempts((a) => a + 1);
        timerRef.current = setTimeout(poll, 2500);
      } else {
        // Webhook took too long; send to order-status for manual lookup
        router.replace("/order-status?slow=1");
      }
    }

    timerRef.current = setTimeout(poll, 1500);
    return () => clearTimeout(timerRef.current);
  }, [pi, attempts, router]);

  return (
    <main className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-center space-y-3">
        <p className="text-[18px] font-semibold text-ink">Confirming your order…</p>
        <p className="text-[15px] text-ink-2">This takes just a moment.</p>
      </div>
    </main>
  );
}

export default function OrderConfirmRedirect() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-[18px] font-semibold text-ink">Confirming your order…</p>
          <p className="text-[15px] text-ink-2">This takes just a moment.</p>
        </div>
      </main>
    }>
      <OrderConfirmInner />
    </Suspense>
  );
}
