import Link from "next/link";
import { Button } from "@/components/ui";
import type { Family } from "@/lib/commerce/types";

interface DuoBandProps {
  duo: Family | null;
}

function duoLowestPrice(duo: Family): string {
  const prices = duo.variants.filter((v) => !v.placeholder && v.price > 0).map((v) => v.price);
  if (prices.length === 0) return "[PRICE]";
  return Math.min(...prices).toLocaleString();
}

export function DuoBand({ duo }: DuoBandProps) {
  const isPreorder = !duo || duo.status === "preorder";
  const ctaLabel = isPreorder ? "Pre-order" : "Buy";
  const statusLine = isPreorder
    ? `Pre-order now. Ships from ${duo?.variants?.[0]?.shipsBy ?? "[DATE]"}.`
    : `In stock. Ships ${duo?.variants?.[0]?.shipsBy ?? "[DATE RANGE]"}.`;
  const priceFrom = duo ? `From $${duoLowestPrice(duo)}` : "From $[PRICE]";

  return (
    <section
      className="relative overflow-hidden"
      style={{ backgroundColor: "var(--surface-dark)" }}
      aria-labelledby="duo-heading"
    >
      <div
        className="mx-auto px-4 py-16 md:py-20 flex flex-col md:flex-row items-center gap-10 md:gap-16"
        style={{ maxWidth: "var(--max-w-content)" }}
      >
        {/* Text */}
        <div className="flex-1">
          <p className="mb-3 text-[12px] font-semibold uppercase tracking-widest text-white/50">
            New
          </p>
          <h2
            id="duo-heading"
            className="text-[40px] md:text-[52px] font-semibold text-white tracking-[-0.03em] leading-[1.05]"
          >
            iPhone Duo.
            <br />
            It unfolds.
          </h2>
          <p className="mt-4 text-[17px] text-white/70">{statusLine}</p>
          <p
            className="mt-1 text-[21px] font-semibold text-white"
            style={{ fontFeatureSettings: '"tnum" 1' }}
          >
            {priceFrom}
          </p>
          <div className="mt-7">
            <Link href="/iphone-duo">
              <Button variant="secondary">{ctaLabel}</Button>
            </Link>
          </div>
        </div>

        {/* Duo fold silhouette */}
        <div className="flex-1 flex items-center justify-center" aria-hidden>
          <DuoSilhouette />
        </div>
      </div>
    </section>
  );
}

function DuoSilhouette() {
  return (
    <svg
      viewBox="0 0 280 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-[220px] md:w-[260px] opacity-60"
      role="img"
      aria-label="iPhone Duo foldable silhouette placeholder"
    >
      {/* Open book / clamshell shape */}
      {/* Left panel */}
      <rect x="4" y="4" width="130" height="312" rx="20" fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.15)" strokeWidth="2" />
      <rect x="14" y="14" width="110" height="292" rx="14" fill="rgba(255,255,255,.04)" />
      {/* Right panel */}
      <rect x="146" y="4" width="130" height="312" rx="20" fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.15)" strokeWidth="2" />
      <rect x="156" y="14" width="110" height="292" rx="14" fill="rgba(255,255,255,.04)" />
      {/* Hinge */}
      <rect x="131" y="4" width="18" height="312" rx="2" fill="rgba(255,255,255,.12)" />
      {/* Label */}
      <text x="140" y="168" textAnchor="middle" dominantBaseline="middle" fontSize="14" fill="rgba(255,255,255,.35)" fontFamily="system-ui, sans-serif">
        Duo
      </text>
    </svg>
  );
}
