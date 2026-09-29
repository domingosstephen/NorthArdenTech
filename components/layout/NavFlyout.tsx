"use client";

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
      <div
        className="mx-auto px-6 py-8"
        style={{ maxWidth: "var(--max-w-content)" }}
      >
        {/* Current lineup */}
        {currentFamilies.length > 0 && (
          <section className="mb-8">
            <p className="mb-4 text-[12px] font-semibold uppercase tracking-widest text-ink-2">
              Current lineup
            </p>
            <div className="flex flex-wrap gap-3">
              {currentFamilies.map((f) => (
                <FamilyCard key={f.slug} family={f} onClick={onClose} />
              ))}
            </div>
          </section>
        )}

        {/* Previous generations */}
        {prevFamilies.length > 0 && (
          <section>
            <p className="mb-4 text-[12px] font-semibold uppercase tracking-widest text-ink-2">
              Previous generations
            </p>
            <div className="flex flex-wrap gap-3">
              {prevFamilies.map((f) => (
                <FamilyCard key={f.slug} family={f} onClick={onClose} compact />
              ))}
            </div>
          </section>
        )}
      </div>
    </motion.div>
  );
}

interface FamilyCardProps {
  family: Family;
  onClick: () => void;
  compact?: boolean;
}

function lowestPrice(family: Family): string {
  const v = family.variants.find((v) => !v.placeholder && v.price > 0);
  if (!v) return "From [PRICE]";
  return `From $${v.price.toLocaleString()}`;
}

function FamilyCard({ family, onClick, compact = false }: FamilyCardProps) {
  return (
    <Link
      href={`/iphone/${family.slug}`}
      onClick={onClick}
      className={[
        "group flex flex-col items-center rounded-[12px] p-3 text-center",
        "hover:bg-surface transition-colors duration-[120ms]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        compact ? "w-24" : "w-28",
      ].join(" ")}
    >
      {/* Device silhouette placeholder */}
      <div className={compact ? "h-16 w-8" : "h-20 w-10"}>
        <DeviceSilhouette name={family.name} />
      </div>
      <p className="mt-2 text-[13px] font-medium text-ink leading-tight">
        {family.name}
      </p>
      <p className="mt-0.5 text-[12px] text-ink-2" style={{ fontFeatureSettings: '"tnum" 1' }}>
        {lowestPrice(family)}
      </p>
    </Link>
  );
}

/** Neutral rounded-rect device silhouette per BUILD-SPEC §7 */
function DeviceSilhouette({ name }: { name: string }) {
  return (
    <svg
      viewBox="0 0 48 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="w-full h-full"
    >
      {/* Body */}
      <rect x="2" y="2" width="44" height="92" rx="8" fill="var(--surface)" stroke="var(--line)" strokeWidth="1.5" />
      {/* Screen */}
      <rect x="6" y="8" width="36" height="80" rx="5" fill="var(--line)" />
      {/* Family initial (small text) */}
      <text
        x="24"
        y="52"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="7"
        fill="var(--ink-2)"
        fontFamily="system-ui, sans-serif"
      >
        {name.replace("iPhone ", "").slice(0, 6)}
      </text>
    </svg>
  );
}
