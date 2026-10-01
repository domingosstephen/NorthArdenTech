/**
 * Generic device silhouette placeholder.
 * Spec §7: "a neutral rounded-rect device silhouette (no logos, no camera-bump
 * likeness of a specific model) with the family name in --ink-2."
 *
 * Ratios:
 *   phone (default) — 1:1 square crop centred in container
 *   foldable        — wider rounded-rect (iPhone Duo)
 *   landscape       — 16:9 (Duo hero band)
 *   portrait-tall   — 4:5 (Duo mobile band)
 *   grade-photo     — 4:3 (pre-owned grade)
 */

interface Props {
  label?: string;
  variant?: "phone" | "foldable" | "landscape" | "portrait-tall" | "grade-photo";
  className?: string;
  /** Inline width/height — only needed when rendering outside a sized container */
  width?: number;
  height?: number;
}

const DEVICE: Record<
  NonNullable<Props["variant"]>,
  { vw: number; vh: number; rx: number; rw: number; rh: number; ry: number }
> = {
  //                viewBox w  h    rect rx   rw   rh   ry
  phone:            { vw: 200, vh: 200, rx: 24, rw: 84,  rh: 160, ry: 20 },
  foldable:         { vw: 200, vh: 200, rx: 20, rw: 134, rh: 150, ry: 25 },
  landscape:        { vw: 320, vh: 180, rx: 16, rw: 240, rh: 132, ry: 24 },
  "portrait-tall":  { vw: 200, vh: 250, rx: 24, rw: 84,  rh: 190, ry: 30 },
  "grade-photo":    { vw: 320, vh: 240, rx: 16, rw: 240, rh: 168, ry: 36 },
};

export function DeviceSilhouette({
  label,
  variant = "phone",
  className = "",
  width,
  height,
}: Props) {
  const d = DEVICE[variant];
  const rx = (d.vw - d.rw) / 2;

  return (
    <svg
      viewBox={`0 0 ${d.vw} ${d.vh}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="img"
      {...(width ? { width } : {})}
      {...(height ? { height } : {})}
      className={["w-full h-full text-[var(--surface)] fill-current", className].join(" ")}
    >
      {/* Background */}
      <rect width={d.vw} height={d.vh} fill="var(--surface)" />
      {/* Device outline */}
      <rect
        x={rx}
        y={d.ry}
        width={d.rw}
        height={d.rh}
        rx={d.rx}
        fill="none"
        stroke="var(--line)"
        strokeWidth="2"
      />
      {/* Screen area */}
      <rect
        x={rx + 6}
        y={d.ry + 10}
        width={d.rw - 12}
        height={d.rh - 20}
        rx={d.rx - 6}
        fill="var(--line)"
        opacity="0.5"
      />
      {/* Family name label */}
      {label && (
        <text
          x={d.vw / 2}
          y={d.vh / 2 + 5}
          textAnchor="middle"
          fill="var(--ink-2)"
          fontSize={Math.min(d.rw / 7, 13)}
          fontFamily="Inter, system-ui, sans-serif"
          fontWeight="500"
        >
          {label.replace("iPhone ", "")}
        </text>
      )}
    </svg>
  );
}
