"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { SpecRail } from "@/components/ui";
import { SectionReveal } from "@/components/pdp/SectionReveal";
import type { Family } from "@/lib/commerce/types";

function lowestPrice(family: Family): string {
  const prices = family.variants.filter((v) => !v.placeholder && v.price > 0).map((v) => v.price);
  if (prices.length === 0) return "From [PRICE]";
  return `From $${Math.min(...prices).toLocaleString()}`;
}

export function LineupRail({ families }: { families: Family[] }) {
  const railRef = useRef<HTMLUListElement>(null);

  function scrollBy(direction: "prev" | "next") {
    if (!railRef.current) return;
    const cardWidth = railRef.current.firstElementChild?.clientWidth ?? 220;
    railRef.current.scrollBy({ left: direction === "next" ? cardWidth + 16 : -(cardWidth + 16), behavior: "smooth" });
  }

  return (
    <SectionReveal>
      <section className="mx-auto px-4 py-14" style={{ maxWidth: "var(--max-w-content)" }} aria-labelledby="lineup-heading">
        <div className="flex items-baseline justify-between mb-6">
          <h2 id="lineup-heading" className="text-[28px] font-semibold text-ink tracking-[-0.02em]">
            The current lineup.
          </h2>
          <Link href="/iphone" className="text-[14px] text-accent hover:text-accent-press transition-colors duration-[120ms] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
            See all →
          </Link>
        </div>

        <div className="group relative">
          <ScrollArrow direction="prev" onClick={() => scrollBy("prev")} className="left-0 -translate-x-1/2" />
          <ul
            ref={railRef}
            className="flex gap-4 overflow-x-auto scroll-smooth pb-2 -mx-1 px-1"
            style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none" }}
            aria-label="Current iPhone lineup"
          >
            {families.map((family, i) => (
              <li key={family.slug} className="shrink-0 w-[200px]" style={{ scrollSnapAlign: "start" }}>
                <RailCard family={family} priority={i < 4} />
              </li>
            ))}
          </ul>
          <ScrollArrow direction="next" onClick={() => scrollBy("next")} className="right-0 translate-x-1/2" />
        </div>
      </section>
    </SectionReveal>
  );
}

function RailCard({ family, priority }: { family: Family; priority?: boolean }) {
  const specFacts = [
    { label: "Chip", value: family.specs.chip },
    { label: "Display", value: family.specs.display },
  ];

  const firstImageUrl = family.finishes[0]?.images?.[0];
  const hasRealImage = firstImageUrl && !firstImageUrl.startsWith("[");

  return (
    <Link
      href={`/iphone/${family.slug}`}
      className="flex flex-col rounded-[14px] border border-line bg-bg hover:border-ink-2 transition-colors duration-[120ms] overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent h-full"
    >
      <div className="relative aspect-square bg-surface overflow-hidden">
        {hasRealImage ? (
          <div className="absolute inset-4">
            <div className="relative w-full h-full">
              <Image
                src={firstImageUrl}
                alt={family.name}
                fill
                sizes="200px"
                className="object-contain"
                priority={priority}
              />
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <RailSilhouette name={family.name} />
          </div>
        )}
      </div>
      <div className="p-3 flex flex-col gap-1.5">
        <p className="text-[15px] font-semibold text-ink leading-tight">{family.name}</p>
        <SpecRail facts={specFacts} condensed className="text-[11px]" />
        <p className="text-[13px] font-semibold text-ink mt-1" style={{ fontFeatureSettings: '"tnum" 1' }}>
          {lowestPrice(family)}
        </p>
      </div>
    </Link>
  );
}

function RailSilhouette({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 120 240" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden className="h-[60%] w-auto">
      <rect x="3" y="3" width="114" height="234" rx="20" fill="var(--surface)" stroke="var(--line)" strokeWidth="2" />
      <rect x="10" y="16" width="100" height="208" rx="12" fill="var(--line)" />
      <rect x="44" y="22" width="32" height="9" rx="4.5" fill="var(--surface)" />
      <text x="60" y="128" textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="var(--ink-2)" fontFamily="system-ui, sans-serif">
        {name.replace("iPhone ", "")}
      </text>
    </svg>
  );
}

function ScrollArrow({ direction, onClick, className }: { direction: "prev" | "next"; onClick: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={direction === "prev" ? "Scroll left" : "Scroll right"}
      className={["absolute top-1/2 -translate-y-1/2 z-10", "hidden md:flex items-center justify-center", "w-10 h-10 rounded-full bg-bg border border-line shadow-sm", "text-ink hover:text-ink/70 transition-[opacity,colors] duration-[120ms]", "opacity-0 group-hover:opacity-100", "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent", className].filter(Boolean).join(" ")}
    >
      {direction === "prev" ? (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" /></svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden><path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" /></svg>
      )}
    </button>
  );
}
