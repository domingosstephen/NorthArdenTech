"use client";

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

export function Chip({ selected = false, disabled, children, className = "", ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      className={[
        "inline-flex items-center px-4 py-2 rounded-[980px] text-[14px] font-medium select-none",
        "border transition-[background-color,color,border-color] duration-[200ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        selected
          ? "bg-ink text-white border-ink"
          : "bg-bg text-ink-2 border-line hover:border-ink hover:text-ink",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
