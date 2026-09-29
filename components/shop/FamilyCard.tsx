"use client";

import Link from "next/link";
import { SpecRail, Swatch } from "@/components/ui";
import type { Family } from "@/lib/commerce/types";

interface FamilyCardProps {
  family: Family;
}

function DeviceSilhouette({ name }: { name: string }) {
  return (
    <svg
      viewBox="0 0 200 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="h-[55%] w-auto"
    >
      <rect x="4" y="4" width="192" height="392" rx="28" fill="var(--surface)" stroke="var(--line)" strokeWidth="3" />
      <rect x="14" y="24" width="172" height="352" rx="18" fill="var(--line)" />
      <rect x="76" y="32" width="48" height="12" rx="6" fill="var(--surface)" />
      <text x="100" y="210" textAnchor="middle" dominantBaseline="middle" fontSize="16" fill="var(--ink-2)" fontFamily="system-ui, sans-serif">
        {name.replace("iPhone ", "")}
      </text>
    </svg>
  );
}

function lowestPrice(family: Family): string {
  const prices = family.variants
    .filter((v) => !v.placeholder && v.price > 0)
    .map((v) => v.price);
  if (prices.length === 0) return "From [PRICE]";
  return `From $${Math.min(...prices).toLocaleString()}`;
}

export function FamilyCard({ family }: FamilyCardProps) {
  const specFacts = [
    { label: "Chip", value: family.specs.chip },
    { label: "Display", value: family.specs.display },
    { label: "Camera", value: family.specs.camera },
  ];

  return (
    <Link
      href={`/iphone/${family.slug}`}
      className="group flex flex-col rounded-[16px] border border-line bg-bg hover:border-ink-2 transition-colors duration-[120ms] overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      {/* Image — 1:1 device silhouette */}
      <div className="relative aspect-square bg-surface flex items-center justify-center overflow-hidden">
        <DeviceSilhouette name={family.name} />
        {/* Status badge */}
        {family.status === "preorder" && (
          <span className="absolute top-3 left-3 bg-warn text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
            Pre-order
          </span>
        )}
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <p className="text-[17px] font-semibold text-ink leading-tight">{family.name}</p>

        <SpecRail facts={specFacts} condensed className="text-[12px]" />

        {/* Finish dots */}
        {family.finishes.length > 0 && (
          <div className="flex items-center gap-1.5 mt-1" aria-label="Available finishes">
            {family.finishes.slice(0, 6).map((f) => (
              <Swatch
                key={f.name}
                color={f.hex.startsWith("[") ? "#c8c8c8" : f.hex}
                name={f.name}
              />
            ))}
            {family.finishes.length > 6 && (
              <span className="text-[11px] text-ink-2">+{family.finishes.length - 6}</span>
            )}
          </div>
        )}

        {/* Price */}
        <p
          className="mt-auto pt-2 text-[15px] font-semibold text-ink"
          style={{ fontFeatureSettings: '"tnum" 1' }}
        >
          {lowestPrice(family)}
        </p>
      </div>
    </Link>
  );
}
