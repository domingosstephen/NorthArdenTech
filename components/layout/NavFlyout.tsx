"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import type { Family } from "@/lib/commerce/types";

interface NavFlyoutProps {
  currentFamilies: Family[];
  prevFamilies: Family[];
  onClose: () => void;
}

export function NavFlyout({ currentFamilies, prevFamilies, onClose }: NavFlyoutProps) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      style={{ overflow: "hidden", backgroundColor: "var(--bg)" }}
      className="absolute top-full left-0 right-0 border-b border-line shadow-[0_8px_30px_rgba(0,0,0,.08)] z-10"
    >
      <div className="mx-auto px-6 py-8" style={{ maxWidth: "var(--max-w-content)" }}>
        {currentFamilies.length > 0 && (
          <section className="mb-8">
            <p className="mb-4 text-[12px] font-semibold uppercase tracking-widest text-ink-2">
              Current lineup
            </p>
            <div className="flex flex-wrap gap-2">
              {currentFamilies.map((f) => (
                <FlyoutCard key={f.slug} family={f} onClick={onClose} />
              ))}
            </div>
          </section>
        )}

        {prevFamilies.length > 0 && (
          <section>
            <p className="mb-4 text-[12px] font-semibold uppercase tracking-widest text-ink-2">
              Previous generations
            </p>
            <div className="flex flex-wrap gap-2">
              {prevFamilies.map((f) => (
                <FlyoutCard key={f.slug} family={f} onClick={onClose} compact />
              ))}
            </div>
          </section>
        )}
      </div>
    </motion.div>
  );
}

function lowestPrice(family: Family): string {
  const v = family.variants.find((v) => !v.placeholder && v.price > 0);
  if (!v) return "From [PRICE]";
  return `From $${v.price.toLocaleString()}`;
}

function FlyoutCard({ family, onClick, compact = false }: { family: Family; onClick: () => void; compact?: boolean }) {
  const firstImageUrl = family.finishes[0]?.images?.[0];
  const hasRealImage = firstImageUrl && !firstImageUrl.startsWith("[");
  const cardW = compact ? "w-20" : "w-24";
  const imgH = compact ? "h-16" : "h-20";

  return (
    <Link
      href={`/iphone/${family.slug}`}
      onClick={onClick}
      className={[
        "group flex flex-col items-center rounded-[12px] p-3 text-center",
        "hover:bg-surface transition-colors duration-[120ms]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        cardW,
      ].join(" ")}
    >
      <div className={`relative w-full ${imgH} mb-2`}>
        {hasRealImage ? (
          <Image
            src={firstImageUrl}
            alt={family.name}
            fill
            sizes={compact ? "80px" : "96px"}
            className="object-contain"
          />
        ) : (
          <DeviceSilhouette name={family.name} />
        )}
      </div>
      <p className="text-[12px] font-medium text-ink leading-tight">{family.name}</p>
      <p className="mt-0.5 text-[11px] text-ink-2" style={{ fontFeatureSettings: '"tnum" 1' }}>
        {lowestPrice(family)}
      </p>
    </Link>
  );
}

function DeviceSilhouette({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 48 96" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden className="w-full h-full">
      <rect x="2" y="2" width="44" height="92" rx="8" fill="var(--surface)" stroke="var(--line)" strokeWidth="1.5" />
      <rect x="6" y="8" width="36" height="80" rx="5" fill="var(--line)" />
      <text x="24" y="52" textAnchor="middle" dominantBaseline="middle" fontSize="7" fill="var(--ink-2)" fontFamily="system-ui, sans-serif">
        {name.replace("iPhone ", "").slice(0, 6)}
      </text>
    </svg>
  );
}
