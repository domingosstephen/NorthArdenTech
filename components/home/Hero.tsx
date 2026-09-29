import Link from "next/link";
import { Button } from "@/components/ui";

export function Hero() {
  return (
    <section
      className="mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center gap-10 md:gap-16"
      style={{ maxWidth: "var(--max-w-content)" }}
      aria-labelledby="hero-heading"
    >
      {/* Text side */}
      <div className="flex-1 md:max-w-[520px]">
        <h1
          id="hero-heading"
          className="text-[44px] md:text-[56px] font-semibold text-ink tracking-[-0.03em] leading-[1.05]"
        >
          Know the battery before you buy.
        </h1>
        <p className="mt-5 text-[19px] md:text-[21px] text-ink-2 leading-relaxed max-w-[440px]">
          Every iPhone from 14 to Duo. New or pre-owned, with condition and battery health shown
          upfront.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/iphone">
            <Button variant="primary">Shop iPhone</Button>
          </Link>
          <Link href="/iphone-duo">
            <Button variant="secondary">Explore iPhone Duo</Button>
          </Link>
        </div>
      </div>

      {/* Hero device silhouette */}
      <div className="w-full md:flex-1 flex items-center justify-center" aria-hidden>
        <HeroSilhouette />
      </div>
    </section>
  );
}

function HeroSilhouette() {
  return (
    <div className="relative w-[220px] md:w-[260px]">
      <svg
        viewBox="0 0 260 520"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full drop-shadow-[0_24px_48px_rgba(0,0,0,.08)]"
        role="img"
        aria-label="iPhone product image placeholder"
      >
        {/* Body */}
        <rect x="4" y="4" width="252" height="512" rx="40" fill="var(--surface)" stroke="var(--line)" strokeWidth="3" />
        {/* Screen */}
        <rect x="16" y="24" width="228" height="472" rx="28" fill="var(--line)" opacity="0.6" />
        {/* Dynamic Island */}
        <rect x="100" y="36" width="60" height="16" rx="8" fill="var(--surface)" />
        {/* Family label */}
        <text
          x="130" y="276"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="20"
          fill="var(--ink-2)"
          fontFamily="system-ui, sans-serif"
          fontWeight="500"
        >
          iPhone
        </text>
      </svg>
    </div>
  );
}
