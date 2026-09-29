"use client";

export interface SwatchProps {
  /** Hex color for the swatch fill */
  color: string;
  name: string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Swatch({ color, name, selected = false, onClick, className = "" }: SwatchProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={name}
      onClick={onClick}
      className={[
        "w-7 h-7 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        "transition-[outline,outline-offset] duration-[200ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
        selected
          ? "outline outline-2 outline-offset-[3px] outline-ink"
          : "outline outline-2 outline-offset-[3px] outline-transparent",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ backgroundColor: color }}
    />
  );
}

/** Renders a row of swatches with the selected name shown below */
export interface SwatchGroupProps {
  options: { color: string; name: string }[];
  selected: string;
  onChange: (name: string) => void;
  className?: string;
}

export function SwatchGroup({ options, selected, onChange, className = "" }: SwatchGroupProps) {
  return (
    <div className={className}>
      <div className="flex items-center gap-3" role="radiogroup" aria-label="Finish">
        {options.map((opt) => (
          <Swatch
            key={opt.name}
            color={opt.color}
            name={opt.name}
            selected={selected === opt.name}
            onClick={() => onChange(opt.name)}
          />
        ))}
      </div>
      <p
        className="mt-2 text-[14px] text-ink-2 transition-opacity duration-[320ms]"
        aria-live="polite"
      >
        {selected}
      </p>
    </div>
  );
}
