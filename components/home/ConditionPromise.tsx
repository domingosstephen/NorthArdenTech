import Link from "next/link";
import { Button } from "@/components/ui";
import { SectionReveal } from "@/components/pdp/SectionReveal";

const GRADES = [
  { name: "Premium", definition: "[DEFINITION]", battery: "[X]%+" },
  { name: "Excellent", definition: "[DEFINITION]", battery: "[X]%+" },
  { name: "Good", definition: "[DEFINITION]", battery: "[X]%+" },
  { name: "Fair", definition: "[DEFINITION]", battery: "[X]%+" },
] as const;

export function ConditionPromise() {
  return (
    <SectionReveal>
      <section
        className="py-14 border-t border-b border-line"
        style={{ backgroundColor: "var(--surface)" }}
        aria-labelledby="grades-heading"
      >
        <div
          className="mx-auto px-4"
          style={{ maxWidth: "var(--max-w-content)" }}
        >
          <h2
            id="grades-heading"
            className="text-[28px] font-semibold text-ink tracking-[-0.02em]"
          >
            Five grades. No surprises.
          </h2>
          <p className="mt-2 text-[17px] text-ink-2 max-w-[560px]">
            Every pre-owned iPhone is tested before it&apos;s listed. The grade tells you exactly
            how it looks. The battery floor tells you how it lasts.
          </p>

          {/* Grade table */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {GRADES.map((grade, i) => (
              <SectionReveal key={grade.name} delay={i * 0.06}>
                <div className="rounded-[14px] border border-line bg-bg p-5">
                  <p className="text-[16px] font-semibold text-ink">{grade.name}</p>
                  <p className="mt-1 text-[14px] text-ink-2">{grade.definition}</p>
                  <p
                    className="mt-3 text-[13px] font-medium text-ok"
                    style={{ fontFeatureSettings: '"tnum" 1' }}
                  >
                    Battery {grade.battery}
                  </p>
                </div>
              </SectionReveal>
            ))}
          </div>

          <div className="mt-7">
            <Link href="/pre-owned">
              <Button variant="ghost" size="sm">How we grade →</Button>
            </Link>
          </div>
        </div>
      </section>
    </SectionReveal>
  );
}
