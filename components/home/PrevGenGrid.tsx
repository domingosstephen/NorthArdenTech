import Image from "next/image";
import Link from "next/link";
import { SectionReveal } from "@/components/pdp/SectionReveal";
import type { Family } from "@/lib/commerce/types";

interface PrevGenGridProps {
  families: Family[];
}

function lowestPrice(family: Family): string {
  const prices = family.variants
    .filter((v) => !v.placeholder && v.price > 0)
    .map((v) => v.price);
  if (prices.length === 0) return "From [PRICE]";
  return `From $${Math.min(...prices).toLocaleString()}`;
}

export function PrevGenGrid({ families }: PrevGenGridProps) {
  if (families.length === 0) return null;

  return (
    <SectionReveal>
      <section
        className="mx-auto px-4 py-14"
        style={{ maxWidth: "var(--max-w-content)" }}
        aria-labelledby="prevgen-heading"
      >
        <div className="flex items-baseline justify-between mb-6">
          <h2
            id="prevgen-heading"
            className="text-[28px] font-semibold text-ink tracking-[-0.02em]"
          >
            Previous generations. Still brilliant.
          </h2>
          <Link
            href="/iphone"
            className="text-[14px] text-accent hover:text-accent-press transition-colors duration-[120ms] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            See all →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {families.map((family, i) => {
            const firstImageUrl = family.finishes[0]?.images?.[0];
            const hasRealImage = firstImageUrl && !firstImageUrl.startsWith("[");

            return (
              <SectionReveal key={family.slug} delay={Math.min(i, 3) * 0.06}>
                <Link
                  href={`/iphone/${family.slug}`}
                  className="flex flex-col items-center rounded-[14px] border border-line bg-surface p-5 text-center hover:border-ink-2 transition-colors duration-[120ms] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <div className="relative w-12 h-16 mb-3">
                    {hasRealImage ? (
                      <Image
                        src={firstImageUrl}
                        alt={family.name}
                        fill
                        sizes="48px"
                        className="object-contain"
                      />
                    ) : (
                      <MiniSilhouette name={family.name} />
                    )}
                  </div>
                  <p className="text-[14px] font-semibold text-ink leading-tight">{family.name}</p>
                  <p
                    className="mt-1 text-[13px] text-ink-2"
                    style={{ fontFeatureSettings: '"tnum" 1' }}
                  >
                    {lowestPrice(family)}
                  </p>
                </Link>
              </SectionReveal>
            );
          })}
        </div>
      </section>
    </SectionReveal>
  );
}

function MiniSilhouette({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 48 96" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden className="w-full h-full">
      <rect x="2" y="2" width="44" height="92" rx="8" fill="var(--bg)" stroke="var(--line)" strokeWidth="1.5" />
      <rect x="6" y="8" width="36" height="80" rx="5" fill="var(--line)" />
      <text x="24" y="52" textAnchor="middle" dominantBaseline="middle" fontSize="7" fill="var(--ink-2)" fontFamily="system-ui, sans-serif">
        {name.replace("iPhone ", "").slice(0, 6)}
      </text>
    </svg>
  );
}
