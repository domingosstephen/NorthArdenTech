"use client";

import Link from "next/link";
import { OptionTile, SwatchGroup } from "@/components/ui";
import type { Condition, Family, Variant } from "@/lib/commerce/types";

const CONDITION_ORDER: Condition[] = ["new", "premium", "excellent", "good", "fair"];
const CONDITION_LABEL: Record<Condition, string> = {
  new: "New",
  premium: "Premium",
  excellent: "Excellent",
  good: "Good",
  fair: "Fair",
};

interface ConfiguratorProps {
  family: Family;
  /** Families with the same generation sharing a size line (e.g. Pro / Pro Max) */
  siblings: Family[];
  selectedFinish: string;
  selectedCondition: Condition;
  selectedStorage: string;
  onFinishChange: (finish: string) => void;
  onConditionChange: (condition: Condition) => void;
  onStorageChange: (storage: string) => void;
  selectedVariant: Variant | null;
}

export function Configurator({
  family,
  siblings,
  selectedFinish,
  selectedCondition,
  selectedStorage,
  onFinishChange,
  onConditionChange,
  onStorageChange,
}: ConfiguratorProps) {
  // All conditions that exist in this family
  const allConditions = CONDITION_ORDER.filter((c) =>
    family.variants.some((v) => v.condition === c)
  );

  // All unique storages across the family
  const allStorages = [...new Set(family.variants.map((v) => v.storage))];

  // Is this condition available given current finish × storage?
  function isConditionAvailable(condition: Condition) {
    return family.variants.some(
      (v) =>
        v.finish === selectedFinish &&
        v.storage === selectedStorage &&
        v.condition === condition
    );
  }

  // Is this storage available given current finish × condition?
  function isStorageAvailable(storage: string) {
    return family.variants.some(
      (v) =>
        v.finish === selectedFinish &&
        v.condition === selectedCondition &&
        v.storage === storage
    );
  }

  // Best-match variant for condition tile price display
  function variantForCondition(condition: Condition): Variant | undefined {
    return family.variants.find(
      (v) =>
        v.finish === selectedFinish &&
        v.storage === selectedStorage &&
        v.condition === condition
    );
  }

  // Best-match variant for storage tile price display
  function variantForStorage(storage: string): Variant | undefined {
    return family.variants.find(
      (v) =>
        v.finish === selectedFinish &&
        v.condition === selectedCondition &&
        v.storage === storage
    );
  }

  const swatchOptions = family.finishes.map((f) => ({
    name: f.name,
    // Use placeholder grey if hex is still a bracket value
    color: f.hex.startsWith("[") ? "#c8c8c8" : f.hex,
  }));

  return (
    <div className="space-y-6">
      {/* ── Model size ───────────────────────────────────────────── */}
      {siblings.length > 0 && (
        <ConfigRow label="Model">
          <div role="radiogroup" aria-label="Model size" className="flex flex-wrap gap-2">
            {/* Current model — selected */}
            <OptionTile
              selected
              onClick={() => {}}
              className="min-w-[96px]"
            >
              {family.name.replace("iPhone ", "")}
            </OptionTile>
            {/* Sibling models — navigate on click */}
            {siblings.map((s) => (
              <Link key={s.slug} href={`/iphone/${s.slug}`} tabIndex={-1}>
                <OptionTile
                  selected={false}
                  onClick={() => {}}
                  className="min-w-[96px]"
                >
                  {s.name.replace("iPhone ", "")}
                </OptionTile>
              </Link>
            ))}
          </div>
        </ConfigRow>
      )}

      {/* ── Finish swatches ──────────────────────────────────────── */}
      {family.finishes.length > 0 && (
        <ConfigRow label="Finish">
          <SwatchGroup
            options={swatchOptions}
            selected={selectedFinish}
            onChange={onFinishChange}
          />
        </ConfigRow>
      )}

      {/* ── Condition ────────────────────────────────────────────── */}
      <ConfigRow label="Condition">
        <div role="radiogroup" aria-label="Condition" className="flex flex-wrap gap-2">
          {allConditions.map((condition) => {
            const v = variantForCondition(condition);
            const available = isConditionAvailable(condition);
            const priceStr = v
              ? v.price === 0
                ? "[PRICE]"
                : `$${v.price.toLocaleString()}`
              : undefined;
            const batteryStr =
              v?.batteryFloor && condition !== "new"
                ? `Battery ${v.batteryFloor}`
                : undefined;
            return (
              <OptionTile
                key={condition}
                selected={selectedCondition === condition}
                disabled={!available}
                disabledReason="Out of stock in this configuration."
                price={priceStr}
                badge={batteryStr}
                onClick={() => onConditionChange(condition)}
                className="min-w-[108px]"
              >
                {CONDITION_LABEL[condition]}
              </OptionTile>
            );
          })}
        </div>
      </ConfigRow>

      {/* ── Storage ──────────────────────────────────────────────── */}
      <ConfigRow label="Storage">
        <div role="radiogroup" aria-label="Storage" className="flex flex-wrap gap-2">
          {allStorages.map((storage) => {
            const v = variantForStorage(storage);
            const available = isStorageAvailable(storage);
            const priceStr = v
              ? v.price === 0
                ? "[PRICE]"
                : `$${v.price.toLocaleString()}`
              : undefined;
            return (
              <OptionTile
                key={storage}
                selected={selectedStorage === storage}
                disabled={!available}
                price={priceStr}
                onClick={() => onStorageChange(storage)}
                className="min-w-[80px]"
              >
                {storage}
              </OptionTile>
            );
          })}
        </div>
      </ConfigRow>

      {/* ── Connectivity (v1: Unlocked only, shown as a fact) ────── */}
      <ConfigRow label="Connectivity">
        <p className="text-[15px] text-ink">
          Unlocked &mdash; compatible with all major carriers.
        </p>
      </ConfigRow>
    </div>
  );
}

function ConfigRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[12px] font-semibold uppercase tracking-widest text-ink-2">
        {label}
      </p>
      {children}
    </div>
  );
}
