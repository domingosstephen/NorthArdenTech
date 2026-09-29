"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FilterBar, type FilterState, type SortKey } from "./FilterBar";
import { FamilyCard } from "./FamilyCard";
import type { Family, Tier } from "@/lib/commerce/types";

interface ShopClientProps {
  families: Family[];
}

/** Tier display order for consistent grid ordering */
const TIER_ORDER: Tier[] = ["duo", "pro-max", "pro", "air", "plus", "base", "e", "mini"];

function lowestVariantPrice(family: Family): number {
  const prices = family.variants
    .filter((v) => !v.placeholder && v.price > 0)
    .map((v) => v.price);
  return prices.length > 0 ? Math.min(...prices) : Infinity;
}

function sortFamilies(families: Family[], sort: SortKey): Family[] {
  return [...families].sort((a, b) => {
    if (sort === "newest") {
      if (b.generation !== a.generation) return b.generation - a.generation;
      return TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier);
    }
    if (sort === "price-asc") {
      return lowestVariantPrice(a) - lowestVariantPrice(b);
    }
    // price-desc
    return lowestVariantPrice(b) - lowestVariantPrice(a);
  });
}

function filterFamilies(families: Family[], filters: FilterState): Family[] {
  return families.filter((f) => {
    if (filters.generations.length > 0 && !filters.generations.includes(f.generation)) {
      return false;
    }
    if (filters.tiers.length > 0 && !filters.tiers.includes(f.tier)) {
      return false;
    }
    if (filters.conditions.length > 0) {
      const hasNew = f.variants.some((v) => v.condition === "new");
      const hasPreOwned = f.variants.some((v) => v.condition !== "new");
      const wantsNew = filters.conditions.includes("new");
      const wantsPreOwned = filters.conditions.includes("pre-owned");
      if (wantsNew && !wantsPreOwned && !hasNew) return false;
      if (wantsPreOwned && !wantsNew && !hasPreOwned) return false;
    }
    return true;
  });
}

export function ShopClient({ families }: ShopClientProps) {
  const [filters, setFilters] = useState<FilterState>({
    generations: [],
    tiers: [],
    conditions: [],
    sort: "newest",
  });

  // Derive available filter options from catalog
  const availableGenerations = useMemo(
    () => [...new Set(families.map((f) => f.generation))].sort((a, b) => b - a),
    [families]
  );
  const availableTiers = useMemo(
    () => TIER_ORDER.filter((t) => families.some((f) => f.tier === t)),
    [families]
  );

  const displayed = useMemo(
    () => sortFamilies(filterFamilies(families, filters), filters.sort),
    [families, filters]
  );

  return (
    <>
      {/* ── Sticky filter bar ──────────────────────────────────── */}
      <div
        className="sticky z-30 border-b border-line px-4 py-3 bg-bg"
        style={{ top: "56px" }}
      >
        <div className="mx-auto" style={{ maxWidth: "var(--max-w-content)" }}>
          <FilterBar
            availableGenerations={availableGenerations}
            availableTiers={availableTiers}
            filters={filters}
            onChange={setFilters}
            resultCount={displayed.length}
          />
        </div>
      </div>

      {/* ── Main grid area ─────────────────────────────────────── */}
      <div
        className="mx-auto px-4 py-8"
        style={{ maxWidth: "var(--max-w-content)" }}
      >
        {/* Result count (desktop) */}
        <p className="hidden md:block mb-5 text-[14px] text-ink-2">
          {displayed.length === families.length
            ? `${families.length} models`
            : `${displayed.length} of ${families.length} models`}
        </p>

        {/* Grid with FLIP layout animations */}
        {displayed.length > 0 ? (
          <motion.ul
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {displayed.map((family) => (
                <motion.li
                  key={family.slug}
                  layout
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                >
                  <FamilyCard family={family} />
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        ) : (
          <EmptyState onClear={() => setFilters((f) => ({ ...f, generations: [], tiers: [], conditions: [] }))} />
        )}
      </div>
    </>
  );
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <p className="text-[22px] font-semibold text-ink">No models match those filters.</p>
      <p className="text-[15px] text-ink-2 max-w-sm">
        Try broadening your search — we carry every iPhone from the 14 to the Duo.
      </p>
      <button
        onClick={onClear}
        className="mt-2 text-[15px] text-accent hover:text-accent-press underline-offset-2 hover:underline transition-colors duration-[120ms] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        Clear all filters
      </button>
    </div>
  );
}

