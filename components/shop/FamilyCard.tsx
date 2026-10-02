"use client";

import Image from "next/image";
import Link from "next/link";
import { SpecRail, Swatch } from "@/components/ui";
import type { Family } from "@/lib/commerce/types";

function lowestPrice(family: Family): string {
  const prices = family.variants.filter((v) => !v.placeholder && v.price > 0).map((v) => v.price);
  if (prices.length === 0) return "From [PRICE]";
  return `From $${Math.min(...prices).toLocaleString()}`;
}

export function FamilyCard({ family }: { family: Family }) {
  const specFacts = [
    { label: "Chip", value: family.specs.chip },
    { label: "Display", value: family.specs.display },
    { label: "Camera", value: family.specs.camera },
  ];

  const firstImageUrl = family.finishes[0]?.images?.[0];
  const hasRealImage = firstImageUrl && !firstImageUrl.startsWith("[");

  return (
    <Link
      href={`/iphone/${family.slug}`}
      className="group flex flex-col rounded-[16px] border border-line bg-bg hover:border-ink-2 transition-colors duration-[120ms] overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      {/* Image */}
      <div className="relative aspect-square bg-surface overflow-hidden">
        {hasRealImage ? (
          <div className="absolute inset-5">
            <div className="relative w-full h-full">
              <Image
                src={firstImageUrl}
                alt={family.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-contain"
              />
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <DeviceSilhouette name={family.name} />
          </div>
        )}
        {family.status === "preorder" && (
          <span className="absolute top-3 left-3 bg-warn text-white text-[11px] font-semibold px-2 py-0.5 rounded-full z-10">
            Pre-order
          </span>
        )}
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <p className="text-[17px] font-semibold text-ink leading-tight">{family.name}</p>
        <SpecRail facts={specFacts} condensed className="text-[12px]" />
        {family.finishes.length > 0 && (
          <div className="flex items-center gap-1.5 mt-1" aria-label="Available finishes">
            {family.finishes.slice(0, 6).map((f) => (
              <Swatch key={f.name} color={f.hex.startsWith("[") ? "#c8c8c8" : f.hex} name={f.name} />
            ))}
            {family.finishes.length > 6 && (
              <span className="text-[11px] text-ink-2">+{family.finishes.length - 6}</span>
            )}
          </div>
        )}
        <p className="mt-auto pt-2 text-[15px] font-semibold text-ink" style={{ fontFeatureSettings: '"tnum" 1' }}>
          {lowestPrice(family)}
        </p>
      </div>
    </Link>
  );
}

function DeviceSilhouette({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 200 400" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden className="h-[55%] w-auto">
      <rect x="4" y="4" width="192" height="392" rx="28" fill="var(--surface)" stroke="var(--line)" strokeWidth="3" />
      <rect x="14" y="24" width="172" height="352" rx="18" fill="var(--line)" />
      <rect x="76" y="32" width="48" height="12" rx="6" fill="var(--surface)" />
      <text x="100" y="210" textAnchor="middle" dominantBaseline="middle" fontSize="16" fill="var(--ink-2)" fontFamily="system-ui, sans-serif">
        {name.replace("iPhone ", "")}
      </text>
    </svg>
  );
}
