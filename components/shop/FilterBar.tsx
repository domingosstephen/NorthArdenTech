"use client";

import { useState } from "react";
import { Chip, Sheet, Button } from "@/components/ui";
import type { Tier } from "@/lib/commerce/types";

export type SortKey = "newest" | "price-asc" | "price-desc";

export interface FilterState {
  generations: number[];
  tiers: Tier[];
  conditions: ("new" | "pre-owned")[];
  sort: SortKey;
}

interface FilterBarProps {
  availableGenerations: number[];
  availableTiers: Tier[];
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  resultCount: number;
}

const TIER_LABEL: Partial<Record<Tier, string>> = {
  e: "iPhone e",
  base: "Standard",
  plus: "Plus",
  mini: "Mini",
  air: "Air",
  pro: "Pro",
  "pro-max": "Pro Max",
  duo: "Duo",
};

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "newest", label: "Newest" },
  { key: "price-asc", label: "Price: Low to High" },
  { key: "price-desc", label: "Price: High to Low" },
];

function toggleItem<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
}

export function FilterBar({
  availableGenerations,
  availableTiers,
  filters,
  onChange,
  resultCount,
}: FilterBarProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const activeFilterCount =
    filters.generations.length + filters.tiers.length + filters.conditions.length;

  function setGen(gen: number) {
    onChange({ ...filters, generations: toggleItem(filters.generations, gen) });
  }
  function setTier(tier: Tier) {
    onChange({ ...filters, tiers: toggleItem(filters.tiers, tier) });
  }
  function setCondition(cond: "new" | "pre-owned") {
    onChange({ ...filters, conditions: toggleItem(filters.conditions, cond) });
  }
  function setSort(sort: SortKey) {
    onChange({ ...filters, sort });
  }
  function clearAll() {
    onChange({ generations: [], tiers: [], conditions: [], sort: filters.sort });
  }

  return (
    <>
      {/* ── Desktop filter bar ─────────────────────────────────── */}
      <div
        className="hidden md:flex items-center gap-2 flex-wrap"
        role="group"
        aria-label="Filters"
      >
        {/* Generation */}
        {availableGenerations.map((gen) => (
          <Chip
            key={gen}
            selected={filters.generations.includes(gen)}
            onClick={() => setGen(gen)}
          >
            iPhone {gen}
          </Chip>
        ))}

        <div className="w-px h-5 bg-line mx-1" aria-hidden />

        {/* Tier / Size */}
        {availableTiers.map((tier) => (
          <Chip
            key={tier}
            selected={filters.tiers.includes(tier)}
            onClick={() => setTier(tier)}
          >
            {TIER_LABEL[tier] ?? tier}
          </Chip>
        ))}

        <div className="w-px h-5 bg-line mx-1" aria-hidden />

        {/* Condition */}
        {(["new", "pre-owned"] as const).map((cond) => (
          <Chip
            key={cond}
            selected={filters.conditions.includes(cond)}
            onClick={() => setCondition(cond)}
          >
            {cond === "new" ? "New" : "Pre-owned"}
          </Chip>
        ))}

        {/* Clear */}
        {activeFilterCount > 0 && (
          <button
            onClick={clearAll}
            className="ml-1 text-[13px] text-accent hover:text-accent-press transition-colors duration-[120ms]"
          >
            Clear
          </button>
        )}

        {/* Sort — pushed right */}
        <div className="ml-auto flex items-center gap-1">
          <span className="text-[13px] text-ink-2 mr-1">Sort:</span>
          {SORT_OPTIONS.map((opt) => (
            <Chip
              key={opt.key}
              selected={filters.sort === opt.key}
              onClick={() => setSort(opt.key)}
            >
              {opt.label}
            </Chip>
          ))}
        </div>
      </div>

      {/* ── Mobile filter trigger ──────────────────────────────── */}
      <div className="md:hidden flex items-center justify-between">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setSheetOpen(true)}
        >
          Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
          <FilterIcon />
        </Button>
        <p className="text-[14px] text-ink-2">
          {resultCount} {resultCount === 1 ? "result" : "results"}
        </p>
      </div>

      {/* ── Mobile filter sheet ────────────────────────────────── */}
      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Filter & Sort">
        <div className="space-y-6 pb-4">
          {/* Generation */}
          <FilterSection label="Generation">
            <div className="flex flex-wrap gap-2">
              {availableGenerations.map((gen) => (
                <Chip
                  key={gen}
                  selected={filters.generations.includes(gen)}
                  onClick={() => setGen(gen)}
                >
                  iPhone {gen}
                </Chip>
              ))}
            </div>
          </FilterSection>

          {/* Size */}
          <FilterSection label="Size">
            <div className="flex flex-wrap gap-2">
              {availableTiers.map((tier) => (
                <Chip
                  key={tier}
                  selected={filters.tiers.includes(tier)}
                  onClick={() => setTier(tier)}
                >
                  {TIER_LABEL[tier] ?? tier}
                </Chip>
              ))}
            </div>
          </FilterSection>

          {/* Condition */}
          <FilterSection label="Condition">
            <div className="flex flex-wrap gap-2">
              {(["new", "pre-owned"] as const).map((cond) => (
                <Chip
                  key={cond}
                  selected={filters.conditions.includes(cond)}
                  onClick={() => setCondition(cond)}
                >
                  {cond === "new" ? "New" : "Pre-owned"}
                </Chip>
              ))}
            </div>
          </FilterSection>

          {/* Sort */}
          <FilterSection label="Sort by">
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map((opt) => (
                <Chip
                  key={opt.key}
                  selected={filters.sort === opt.key}
                  onClick={() => setSort(opt.key)}
                >
                  {opt.label}
                </Chip>
              ))}
            </div>
          </FilterSection>

          {activeFilterCount > 0 && (
            <button
              onClick={() => { clearAll(); setSheetOpen(false); }}
              className="text-[15px] text-accent hover:text-accent-press transition-colors duration-[120ms]"
            >
              Clear all filters
            </button>
          )}
        </div>
      </Sheet>
    </>
  );
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[12px] font-semibold uppercase tracking-widest text-ink-2">
        {label}
      </p>
      {children}
    </div>
  );
}

function FilterIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M1 3h12M3 7h8M5 11h4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
