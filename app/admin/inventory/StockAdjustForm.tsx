"use client";

import { useState, useTransition } from "react";
import { setStockOnHand } from "@/app/admin/api/inventory/actions";

export function StockAdjustForm({
  variantId,
  currentOnHand,
}: {
  variantId: string;
  currentOnHand: number;
}) {
  const [value, setValue] = useState(String(currentOnHand));
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    const qty = parseInt(value, 10);
    if (isNaN(qty) || qty < 0) return;
    startTransition(async () => {
      await setStockOnHand(variantId, qty);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={0}
        step={1}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-[72px] rounded-[8px] border border-line bg-bg px-2 py-1 text-[13px] tabular-nums text-ink focus:outline-2 focus:outline-offset-1 focus:outline-accent"
        aria-label="On-hand quantity"
      />
      <button
        onClick={handleSave}
        disabled={value === String(currentOnHand) || isPending}
        className="rounded-[8px] border border-line bg-bg px-2 py-1 text-[12px] font-medium text-accent hover:text-accent-press disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-[120ms]"
      >
        {isPending ? "…" : "Set"}
      </button>
      {saved && <span className="text-[12px] text-ok">✓</span>}
    </div>
  );
}
