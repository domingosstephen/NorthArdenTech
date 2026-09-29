"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRef } from "react";
import { Button, useAddToBag, Price } from "@/components/ui";
import { useCart } from "@/components/providers/CartProvider";
import type { Condition, Family, Variant } from "@/lib/commerce/types";

interface StickyBarProps {
  visible: boolean;
  family: Family;
  selectedVariant: Variant | null;
  selectedFinish: string;
  selectedCondition: Condition;
  selectedStorage: string;
}

export function StickyBar({
  visible,
  family,
  selectedVariant,
  selectedFinish,
  selectedCondition,
  selectedStorage,
}: StickyBarProps) {
  const { addItem, openCart } = useCart();

  // Use ref so the async onAdd callback always reads fresh values
  const actionRef = useRef<() => void>(() => {});
  actionRef.current = () => {
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

  const { loading, success, trigger } = useAddToBag(() => actionRef.current());

  const configSummary = [
    selectedCondition !== "new" ? selectedCondition : null,
    selectedStorage,
    selectedFinish,
  ]
    .filter(Boolean)
    .join(" · ");

  const isOutOfStock = selectedVariant?.stock === 0;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 64, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 64, opacity: 0 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-0 left-0 right-0 z-50 border-t border-line px-4 py-3"
          style={{
            backgroundColor: "rgba(255,255,255,0.90)",
            backdropFilter: "saturate(180%) blur(20px)",
            WebkitBackdropFilter: "saturate(180%) blur(20px)",
          }}
        >
          <div
            className="mx-auto flex items-center gap-3"
            style={{ maxWidth: "var(--max-w-content)" }}
          >
            {/* Thumbnail */}
            <div className="w-10 h-10 shrink-0 rounded-[8px] bg-surface flex items-center justify-center">
              <span className="text-[9px] text-ink-2 leading-tight text-center px-0.5">
                {family.name.replace("iPhone ", "")}
              </span>
            </div>

            {/* Summary */}
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium text-ink truncate">{family.name}</p>
              <p className="text-[12px] text-ink-2 truncate capitalize">{configSummary}</p>
            </div>

            {/* Price */}
            <div className="shrink-0">
              {selectedVariant && !selectedVariant.placeholder ? (
                <Price
                  value={selectedVariant.price}
                  className="text-[17px] font-semibold text-ink"
                />
              ) : (
                <span className="text-[17px] font-semibold text-ink">[PRICE]</span>
              )}
            </div>

            {/* CTA */}
            <Button
              variant="primary"
              size="sm"
              loading={loading}
              success={success}
              disabled={!selectedVariant || isOutOfStock}
              onClick={trigger}
              className="shrink-0"
            >
              {success ? "Added ✓" : isOutOfStock ? "Out of Stock" : "Add to Bag"}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
