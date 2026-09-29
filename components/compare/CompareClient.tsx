"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import type { Family } from "@/lib/commerce/types";

interface CompareClientProps {
  families: Family[];
}

type SpecRow = { label: string; key: keyof import("@/lib/commerce/types").FamilySpecs };

const SPEC_GROUPS: { group: string; rows: SpecRow[] }[] = [
  { group: "Display", rows: [{ label: "Display", key: "display" }] },
  { group: "Chip", rows: [{ label: "Chip", key: "chip" }] },
  { group: "Camera", rows: [{ label: "Camera", key: "camera" }] },
  { group: "Battery", rows: [{ label: "Battery (video hrs)", key: "batteryVideoHrs" }] },
  { group: "Size & weight", rows: [{ label: "Weight", key: "weight" }] },
  { group: "Durability", rows: [{ label: "Connector", key: "connector" }] },
  { group: "Details", rows: [{ label: "Release year", key: "releaseYear" }] },
];

function lowestPrice(family: Family): string {
  const prices = family.variants.filter((v) => !v.placeholder && v.price > 0).map((v) => v.price);
  return prices.length > 0 ? `From $${Math.min(...prices).toLocaleString()}` : "From [PRICE]";
}

function allSame(values: string[]): boolean {
  const filled = values.filter((v) => !!v);
  return filled.length > 1 && filled.every((v) => v === filled[0]);
}

export function CompareClient({ families }: CompareClientProps) {
  // Up to 3 columns; start with the first 3 families
  const defaults = families.slice(0, 3).map((f) => f.slug);
  const [columns, setColumns] = useState<(string | null)[]>([
    defaults[0] ?? null,
    defaults[1] ?? null,
    defaults[2] ?? null,
  ]);
  const [diffsOnly, setDiffsOnly] = useState(false);

  function setColumn(index: number, slug: string | null) {
    setColumns((prev) => prev.map((s, i) => (i === index ? slug : s)));
  }

  const selectedFamilies = columns.map((slug) => families.find((f) => f.slug === slug) ?? null);
  const activeFamilies = selectedFamilies.filter((f): f is Family => f !== null);

  const visibleGroups = useMemo(() => {
    if (!diffsOnly || activeFamilies.length < 2) return SPEC_GROUPS;
    return SPEC_GROUPS.filter((group) =>
      group.rows.some((row) => {
        const vals = activeFamilies.map((f) => String(f.specs[row.key]));
        return !allSame(vals);
      })
    );
  }, [diffsOnly, activeFamilies]);

  return (
    <div>
      {/* Controls */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <p className="text-[14px] text-ink-2">
          {activeFamilies.length === 0
            ? "Select models to compare."
            : `Comparing ${activeFamilies.length} model${activeFamilies.length !== 1 ? "s" : ""}.`}
        </p>
        <button
          onClick={() => setDiffsOnly((v) => !v)}
          className={[
            "flex items-center gap-2 text-[14px] px-3 py-1.5 rounded-full border transition-colors duration-[120ms]",
            diffsOnly
              ? "border-ink bg-ink text-white"
              : "border-line text-ink hover:border-ink-2",
          ].join(" ")}
        >
          <span
            className={[
              "w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center",
              diffsOnly ? "border-white bg-white" : "border-ink-2",
            ].join(" ")}
            aria-hidden
          >
            {diffsOnly && <span className="w-1.5 h-1.5 rounded-full bg-ink block" />}
          </span>
          Show differences only
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[14px]" style={{ minWidth: "640px" }}>
          {/* Column headers — sticky */}
          <thead>
            <tr className="border-b border-line">
              {/* Label column */}
              <th className="w-[180px] sticky top-[56px] bg-bg z-10 py-4 pr-4 text-left font-normal text-ink-2 align-bottom">
                {/* empty */}
              </th>
              {columns.map((slug, i) => {
                const family = families.find((f) => f.slug === slug) ?? null;
                return (
                  <th
                    key={i}
                    className="sticky top-[56px] bg-bg z-10 py-4 px-3 text-left align-top min-w-[200px]"
                  >
                    {/* Family picker */}
                    <select
                      value={slug ?? ""}
                      onChange={(e) => setColumn(i, e.target.value || null)}
                      aria-label={`Column ${i + 1} model`}
                      className="w-full text-[13px] text-ink border border-line rounded-md px-2 py-1.5 bg-bg focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent"
                    >
                      <option value="">Add a model</option>
                      {families.map((f) => (
                        <option key={f.slug} value={f.slug}>
                          {f.name}
                        </option>
                      ))}
                    </select>

                    {family && (
                      <div className="mt-3">
                        {/* Mini silhouette */}
                        <div className="w-12 h-24 mx-auto mb-2">
                          <MiniSilhouette name={family.name} />
                        </div>
                        <p className="text-[15px] font-semibold text-ink leading-tight">
                          {family.name}
                        </p>
                        <p
                          className="mt-0.5 text-[13px] text-ink-2"
                          style={{ fontFeatureSettings: '"tnum" 1' }}
                        >
                          {lowestPrice(family)}
                        </p>
                        <Link href={`/iphone/${family.slug}`} className="mt-2 block">
                          <Button variant="secondary" size="sm" className="w-full">
                            Buy
                          </Button>
                        </Link>
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Spec rows */}
          <tbody>
            {visibleGroups.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-10 text-center text-ink-2 text-[15px]">
                  All selected specs are identical. Turn off &ldquo;differences only&rdquo; to see everything.
                </td>
              </tr>
            ) : (
              visibleGroups.map((group) => (
                <>
                  {/* Group header */}
                  <tr key={`group-${group.group}`} className="border-t-2 border-ink/10">
                    <td
                      colSpan={4}
                      className="pt-5 pb-1 text-[11px] font-semibold uppercase tracking-widest text-ink-2"
                    >
                      {group.group}
                    </td>
                  </tr>
                  {group.rows.map((row) => {
                    const values = selectedFamilies.map((f) =>
                      f ? String(f.specs[row.key]) : ""
                    );
                    const same = allSame(values.filter(Boolean));
                    return (
                      <tr key={row.key} className="border-t border-line">
                        <td className="py-3 pr-4 text-ink-2 align-top">{row.label}</td>
                        {values.map((val, ci) => (
                          <td
                            key={ci}
                            className={[
                              "py-3 px-3 align-top",
                              !same && val && activeFamilies.length > 1
                                ? "text-ink font-medium"
                                : "text-ink-2",
                            ].join(" ")}
                          >
                            {val || <span className="text-line">—</span>}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MiniSilhouette({ name }: { name: string }) {
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
