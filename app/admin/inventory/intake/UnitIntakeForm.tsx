"use client";

import { useState, useTransition } from "react";
import { createUnit } from "@/app/admin/api/inventory/actions";
import { Button } from "@/components/ui";

interface VariantOption {
  id: string;
  sku: string;
  familyName: string;
  storageGb: number;
  condition: string;
  batteryFloor: number | null;
}

export function UnitIntakeForm({ variants }: { variants: VariantOption[] }) {
  const [variantId, setVariantId] = useState("");
  const [batteryPct, setBatteryPct] = useState("");
  const [gradeNotes, setGradeNotes] = useState("");
  const [lastCreated, setLastCreated] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selected = variants.find((v) => v.id === variantId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const pct = parseInt(batteryPct, 10);
    if (!variantId) { setError("Select a variant."); return; }
    if (isNaN(pct) || pct < 0 || pct > 100) { setError("Battery % must be 0–100."); return; }
    if (selected && selected.batteryFloor && pct < selected.batteryFloor) {
      setError(`Battery % (${pct}) is below the floor for this grade (${selected.batteryFloor}%). Assign a lower grade instead.`);
      return;
    }

    startTransition(async () => {
      try {
        const unitId = await createUnit({ variantId, batteryPct: pct, gradeNotes });
        setLastCreated(unitId);
        setBatteryPct("");
        setGradeNotes("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create unit.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Variant picker */}
      <div>
        <label className="block text-[14px] font-medium text-ink mb-1" htmlFor="variant">
          Variant (grade + storage)
        </label>
        <select
          id="variant"
          required
          value={variantId}
          onChange={(e) => setVariantId(e.target.value)}
          className="w-full rounded-[12px] border border-line bg-bg px-4 py-3 text-[15px] text-ink focus:outline-2 focus:outline-offset-2 focus:outline-accent"
        >
          <option value="">Select a variant…</option>
          {variants.map((v) => (
            <option key={v.id} value={v.id}>
              {v.familyName} · {v.condition.charAt(0).toUpperCase() + v.condition.slice(1)} · {v.storageGb} GB
              {v.batteryFloor ? ` (floor ${v.batteryFloor}%)` : ""} — {v.sku}
            </option>
          ))}
        </select>
      </div>

      {/* Battery % */}
      <div>
        <label className="block text-[14px] font-medium text-ink mb-1" htmlFor="battery">
          Battery health %
          {selected?.batteryFloor && (
            <span className="ml-2 font-normal text-ink-2">
              (min {selected.batteryFloor}% for this grade)
            </span>
          )}
        </label>
        <input
          id="battery"
          type="number"
          min={0}
          max={100}
          required
          value={batteryPct}
          onChange={(e) => setBatteryPct(e.target.value)}
          placeholder="e.g. 92"
          className="w-full rounded-[12px] border border-line bg-bg px-4 py-3 text-[15px] text-ink tabular-nums placeholder:text-ink-2 focus:outline-2 focus:outline-offset-2 focus:outline-accent"
        />
      </div>

      {/* Grade notes */}
      <div>
        <label className="block text-[14px] font-medium text-ink mb-1" htmlFor="notes">
          Cosmetic notes <span className="font-normal text-ink-2">(optional)</span>
        </label>
        <textarea
          id="notes"
          rows={3}
          value={gradeNotes}
          onChange={(e) => setGradeNotes(e.target.value)}
          placeholder="e.g. Minor scratch on back panel near camera, screen pristine"
          className="w-full rounded-[12px] border border-line bg-bg px-4 py-3 text-[15px] text-ink placeholder:text-ink-2 focus:outline-2 focus:outline-offset-2 focus:outline-accent resize-none"
        />
      </div>

      {/* IMEI note */}
      <p className="text-[13px] text-ink-2 bg-surface rounded-[10px] border border-line px-4 py-3">
        IMEI entry is handled via direct DB import or a separate batch tool (encryption required).
        Do not enter IMEI in plain text anywhere in this form.
      </p>

      {error && (
        <p role="alert" className="rounded-[12px] bg-[#FFF2F2] border border-[#FECACA] px-4 py-3 text-[14px] text-[#B91C1C]">
          {error}
        </p>
      )}

      {lastCreated && (
        <div className="rounded-[12px] bg-[#F0FDF4] border border-[#BBF7D0] px-4 py-3">
          <p className="text-[14px] font-semibold text-ok">Unit created.</p>
          <p className="text-[12px] text-ok/80 font-mono mt-0.5">{lastCreated}</p>
          <p className="text-[13px] text-ok/80 mt-1">Ready for the next unit.</p>
        </div>
      )}

      <Button type="submit" variant="primary" loading={isPending}>
        Add unit to inventory
      </Button>
    </form>
  );
}
