"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button, useAddToBag, SpecRail, Price } from "@/components/ui";
import { useCart } from "@/components/providers/CartProvider";
import type { Condition, Family, Variant } from "@/lib/commerce/types";
import { Configurator } from "./Configurator";
import { Gallery } from "./Gallery";
import { StickyBar } from "./StickyBar";
import { BelowFold } from "./BelowFold";

interface PDPClientProps {
  family: Family;
  /** Same-generation size-line siblings (e.g. Pro Max when viewing Pro) */
  siblings: Family[];
}

const CONDITION_ORDER: Condition[] = ["new", "premium", "excellent", "good", "fair"];

export function PDPClient({ family, siblings }: PDPClientProps) {
  // ── Derive initial defaults ─────────────────────────────────────
  const firstFinish = family.finishes[0]?.name ?? "";
  const allStorages = [...new Set(family.variants.map((v) => v.storage))];
  const firstStorage = allStorages[0] ?? "";
  const firstCondition =
    CONDITION_ORDER.find((c) => family.variants.some((v) => v.condition === c)) ?? "excellent";

  const [selectedFinish, setSelectedFinish] = useState(firstFinish);
  const [selectedCondition, setSelectedCondition] = useState<Condition>(firstCondition);
  const [selectedStorage, setSelectedStorage] = useState(firstStorage);
  const [stickyVisible, setStickyVisible] = useState(false);

  const priceRef = useRef<HTMLDivElement>(null);

  // ── Sticky bar visibility via IntersectionObserver ──────────────
  useEffect(() => {
    const el = priceRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setStickyVisible(!entry.isIntersecting),
      // Offset for the 56px sticky header
      { rootMargin: "-56px 0px 0px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // ── Derive the matched variant ──────────────────────────────────
  const selectedVariant: Variant | null =
    family.variants.find(
      (v) =>
        v.finish === selectedFinish &&
        v.condition === selectedCondition &&
        v.storage === selectedStorage
    ) ?? null;

  // ── Selection handlers with smart fallbacks ─────────────────────
  const handleFinishChange = useCallback(
    (finish: string) => {
      setSelectedFinish(finish);
      const stillValid = family.variants.some(
        (v) =>
          v.finish === finish &&
          v.condition === selectedCondition &&
          v.storage === selectedStorage
      );
      if (!stillValid) {
        const fallback = family.variants.find((v) => v.finish === finish);
        if (fallback) {
          setSelectedCondition(fallback.condition);
          setSelectedStorage(fallback.storage);
        }
      }
    },
    [family.variants, selectedCondition, selectedStorage]
  );

  const handleConditionChange = useCallback(
    (condition: Condition) => {
      setSelectedCondition(condition);
      const stillValid = family.variants.some(
        (v) =>
          v.finish === selectedFinish &&
          v.condition === condition &&
          v.storage === selectedStorage
      );
      if (!stillValid) {
        const fallback = family.variants.find(
          (v) => v.finish === selectedFinish && v.condition === condition
        );
        if (fallback) setSelectedStorage(fallback.storage);
      }
    },
    [family.variants, selectedFinish, selectedStorage]
  );

  const handleStorageChange = useCallback(
    (storage: string) => {
      setSelectedStorage(storage);
      const stillValid = family.variants.some(
        (v) =>
          v.finish === selectedFinish &&
          v.condition === selectedCondition &&
          v.storage === storage
      );
      if (!stillValid) {
        const fallback = family.variants.find(
          (v) => v.finish === selectedFinish && v.storage === storage
        );
        if (fallback) setSelectedCondition(fallback.condition);
      }
    },
    [family.variants, selectedFinish, selectedCondition]
  );

  // ── Add to bag ──────────────────────────────────────────────────
  const { addItem, openCart } = useCart();

  // Ref ensures onAdd captures the latest state even after async delay
  const addActionRef = useRef<() => void>(() => {});
  addActionRef.current = () => {
    if (!selectedVariant) return;
    const finish = family.finishes.find((f) => f.name === selectedFinish);
    addItem({
      variantId: selectedVariant.id,
      familySlug: family.slug,
      familyName: family.name,
      finish: selectedFinish,
      storage: selectedStorage,
      condition: selectedCondition,
      price: selectedVariant.price,
      image: finish?.images?.[0],
    });
    openCart();
  };

  const { loading, success, trigger } = useAddToBag(() => addActionRef.current());

  // ── Spec rail facts ─────────────────────────────────────────────
  const specFacts = [
    { label: "Chip", value: family.specs.chip },
    { label: "Display", value: family.specs.display },
    { label: "Camera", value: family.specs.camera },
  ];

  const isOutOfStock = selectedVariant?.stock === 0;

  return (
    <>
      <div
        className="mx-auto px-4 py-8 md:py-14"
        style={{ maxWidth: "var(--max-w-content)" }}
      >
        <div className="flex flex-col md:flex-row gap-8 lg:gap-16">
          {/* ── Gallery (left, sticky on desktop) ─────────────────── */}
          <div className="w-full md:w-7/12 md:sticky md:self-start" style={{ top: "80px" }}>
            <Gallery family={family} selectedFinish={selectedFinish} />
          </div>

          {/* ── Right column ──────────────────────────────────────── */}
          <div className="w-full md:w-5/12">
            {/* Title */}
            <h1 className="text-[34px] font-semibold text-ink tracking-[-0.02em] mb-3">
              {family.name}
            </h1>

            {/* Spec rail (condensed — 3 facts) */}
            <SpecRail facts={specFacts} condensed className="mb-5" />

            {/* Price line — observed for sticky bar */}
            <div ref={priceRef} aria-live="polite" aria-atomic="true" className="mb-6">
              {selectedVariant && !selectedVariant.placeholder ? (
                <Price
                  value={selectedVariant.price}
                  className="text-[28px] font-semibold text-ink"
                />
              ) : (
                <span className="text-[28px] font-semibold text-ink">[PRICE]</span>
              )}
            </div>

            {/* Configurator */}
            <Configurator
              family={family}
              siblings={siblings}
              selectedFinish={selectedFinish}
              selectedCondition={selectedCondition}
              selectedStorage={selectedStorage}
              onFinishChange={handleFinishChange}
              onConditionChange={handleConditionChange}
              onStorageChange={handleStorageChange}
              selectedVariant={selectedVariant}
            />

            {/* Delivery estimate */}
            <p className="mt-4 text-[14px] text-ink-2">
              Order today, ships {selectedVariant?.shipsBy ?? "[DATE]"}.
            </p>

            {/* Primary CTA */}
            <div className="mt-5">
              <Button
                variant="primary"
                loading={loading}
                success={success}
                disabled={!selectedVariant || isOutOfStock}
                onClick={trigger}
                className="w-full"
              >
                {success
                  ? "Added ✓"
                  : isOutOfStock
                  ? "Out of Stock"
                  : "Add to Bag"}
              </Button>
            </div>

            {/* Below fold */}
            <BelowFold family={family} selectedCondition={selectedCondition} />
          </div>
        </div>
      </div>

      {/* Sticky summary bar */}
      <StickyBar
        visible={stickyVisible}
        family={family}
        selectedVariant={selectedVariant}
        selectedFinish={selectedFinish}
        selectedCondition={selectedCondition}
        selectedStorage={selectedStorage}
      />
    </>
  );
}
