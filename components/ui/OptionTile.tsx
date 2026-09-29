"use client";

import { Tooltip } from "./Tooltip";

export interface OptionTileProps {
  selected?: boolean;
  disabled?: boolean;
  /** Shown in tooltip when disabled */
  disabledReason?: string;
  /** e.g. "$1,099" */
  price?: string;
  /** e.g. "Battery 90%+" */
  badge?: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function OptionTile({
  selected = false,
  disabled = false,
  disabledReason = "Out of stock in this configuration.",
  price,
  badge,
  children,
  onClick,
  className = "",
}: OptionTileProps) {
  const tile = (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      className={[
        "relative flex flex-col items-start gap-0.5 px-4 py-3 rounded-[12px] text-left",
        "border border-line transition-[box-shadow] duration-[200ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        selected && !disabled && "shadow-[inset_0_0_0_1.5px_var(--accent)]",
        disabled
          ? "opacity-40 cursor-not-allowed"
          : "cursor-pointer hover:border-ink-2",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="text-[17px] font-medium text-ink leading-snug">{children}</span>
      {price && (
        <span
          className="text-[14px] text-ink-2"
          style={{ fontFeatureSettings: '"tnum" 1' }}
        >
          {price}
        </span>
      )}
      {badge && (
        <span className="text-[12px] text-ok font-medium">{badge}</span>
      )}
    </button>
  );

  if (disabled && disabledReason) {
    return <Tooltip content={disabledReason} delay={300}>{tile}</Tooltip>;
  }

  return tile;
}
