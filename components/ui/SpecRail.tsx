import { Fragment } from "react";

export interface SpecFact {
  value: string;
  /** Applies semantic colour to this fact */
  color?: "default" | "ok" | "warn";
}

export interface SpecRailProps {
  facts: SpecFact[];
  /** 3 facts for grid cards; full (≤5) for PDP */
  condensed?: boolean;
  className?: string;
}

const COLOR_MAP: Record<NonNullable<SpecFact["color"]>, string> = {
  default: "text-ink-2",
  ok: "text-ok",
  warn: "text-warn",
};

export function SpecRail({ facts, condensed = false, className = "" }: SpecRailProps) {
  const visible = condensed ? facts.slice(0, 3) : facts;

  return (
    <p
      className={[
        "inline-flex items-center flex-wrap gap-0 text-[14px] text-ink-2",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ fontFeatureSettings: '"tnum" 1, "cv11" 1' }}
    >
      {visible.map((fact, i) => (
        <Fragment key={i}>
          {i > 0 && (
            <span
              aria-hidden
              className="mx-2 inline-block w-px h-[0.9em] bg-line self-center"
            />
          )}
          <span className={COLOR_MAP[fact.color ?? "default"]}>{fact.value}</span>
        </Fragment>
      ))}
    </p>
  );
}
