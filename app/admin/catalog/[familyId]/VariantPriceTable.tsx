"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui";
import { updateVariantPrice } from "@/app/admin/api/catalog/actions";
import type { InferSelectModel } from "drizzle-orm";
import type { variants } from "@/lib/db/schema";

type Variant = InferSelectModel<typeof variants>;

export function VariantPriceTable({ variants: rows }: { variants: Variant[] }) {
  const [prices, setPrices] = useState<Record<string, string>>(
    Object.fromEntries(rows.map((v) => [v.id, String(v.priceCents)]))
  );
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [pending, startTransition] = useTransition();

  if (rows.length === 0) {
    return (
      <p className="text-[14px] text-ink-2">
        No variants yet — run the seed script to populate.
      </p>
    );
  }

  function handleSave(variantId: string) {
    const cents = parseInt(prices[variantId] ?? "0", 10);
    if (isNaN(cents) || cents < 0) return;
    startTransition(async () => {
      await updateVariantPrice(variantId, cents);
      setSaved((s) => ({ ...s, [variantId]: true }));
      setTimeout(() => setSaved((s) => ({ ...s, [variantId]: false })), 2000);
    });
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-line text-left">
            {["SKU", "Condition", "Storage", "Connectivity", "Price (¢)", "Active", ""].map((h) => (
              <th key={h} className="pb-2 pr-4 text-ink-2 font-normal last:pr-0">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((v) => (
            <tr key={v.id} className={v.active ? "" : "opacity-50"}>
              <td className="py-2 pr-4 font-mono text-ink-2 text-[11px]">{v.sku}</td>
              <td className="py-2 pr-4 capitalize text-ink">{v.condition}</td>
              <td className="py-2 pr-4 text-ink tabular-nums">{v.storageGb} GB</td>
              <td className="py-2 pr-4 capitalize text-ink-2">{v.connectivity}</td>
              <td className="py-2 pr-4">
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={prices[v.id] ?? ""}
                  onChange={(e) =>
                    setPrices((p) => ({ ...p, [v.id]: e.target.value }))
                  }
                  className="w-[100px] rounded-[8px] border border-line bg-bg px-2 py-1 text-[13px] tabular-nums text-ink focus:outline-2 focus:outline-offset-1 focus:outline-accent"
                />
              </td>
              <td className="py-2 pr-4">
                <span className={v.active ? "text-ok" : "text-ink-2"}>
                  {v.active ? "Yes" : "No"}
                </span>
              </td>
              <td className="py-2 text-right">
                <div className="flex items-center gap-2 justify-end">
                  <Button
                    variant="secondary"
                    onClick={() => handleSave(v.id)}
                    loading={pending}
                    disabled={prices[v.id] === String(v.priceCents)}
                    className="!py-1 !px-3 !text-[12px]"
                  >
                    Save
                  </Button>
                  {saved[v.id] && (
                    <span className="text-[12px] text-ok font-medium">✓</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
