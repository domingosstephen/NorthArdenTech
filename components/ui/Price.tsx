"use client";

import { AnimatePresence, motion } from "motion/react";

export interface PriceProps {
  /** Dollar amount, e.g. 1299 */
  value: number;
  currency?: string;
  className?: string;
}

function formatDollars(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/** A single character slot. Animates when its value changes. */
function AnimatedChar({ char, posKey }: { char: string; posKey: string }) {
  const isDigit = /\d/.test(char);

  if (!isDigit) {
    return (
      <span aria-hidden className="inline-block">
        {char}
      </span>
    );
  }

  return (
    <span className="relative inline-flex items-center justify-center">
      {/* ghost char reserves width so layout never shifts */}
      <span className="invisible" aria-hidden style={{ fontFeatureSettings: '"tnum" 1' }}>
        {char}
      </span>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={posKey}
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -8, opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 flex items-center justify-center"
          style={{ fontFeatureSettings: '"tnum" 1' }}
        >
          {char}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function Price({ value, currency = "USD", className = "" }: PriceProps) {
  const formatted = formatDollars(value, currency);
  const chars = formatted.split("");

  return (
    <span
      className={["inline-flex items-center", className].filter(Boolean).join(" ")}
      aria-label={formatted}
      style={{ fontFeatureSettings: '"tnum" 1, "cv11" 1' }}
    >
      {chars.map((char, pos) => (
        <AnimatedChar key={pos} char={char} posKey={`${char}${pos}`} />
      ))}
    </span>
  );
}
