import Link from "next/link";
import { SectionReveal } from "@/components/pdp/SectionReveal";

export const metadata = {
  title: "Pre-owned guide",
  description:
    "How NorthArdenTech grades pre-owned iPhone — five conditions, battery floors, what we test.",
};

const GRADES = [
  { name: "Premium", definition: "[COSMETIC DEFINITION]", battery: "[X]% or higher" },
  { name: "Excellent", definition: "[COSMETIC DEFINITION]", battery: "[X]% or higher" },
  { name: "Good", definition: "[COSMETIC DEFINITION]", battery: "[X]% or higher" },
  { name: "Fair", definition: "[COSMETIC DEFINITION]", battery: "[X]% or higher" },
] as const;

const SECTIONS = [
  {
    id: "battery",
    title: "Battery health",
    body: "[CLIENT TO SUPPLY — explain how battery floor is measured, what the percentage means, Apple diagnostics process.]",
  },
  {
    id: "tested",
    title: "What we test",
    body: "[CLIENT TO SUPPLY — list every function tested: display, touch, Face ID / Touch ID, cameras, speakers, microphone, cellular, Wi-Fi, Bluetooth, charging, buttons.]",
  },
  {
    id: "inbox",
    title: "What's in the box",
    body: "[CLIENT TO SUPPLY — list what comes with each grade level.]",
  },
  {
    id: "warranty",
    title: "Warranty",
    body: "[CLIENT TO SUPPLY — NorthArdenTech warranty length, what's covered, how to claim.]",
  },
] as const;

export default function PreOwnedGuidePage() {
  return (
    <main>
      <div className="mx-auto px-4 py-12 md:py-16" style={{ maxWidth: "var(--max-w-content)" }}>
        {/* Header */}
        <SectionReveal>
          <h1 className="text-[40px] md:text-[48px] font-semibold text-ink tracking-[-0.02em] mb-3">
            How we grade pre-owned iPhone.
          </h1>
          <p className="text-[17px] text-ink-2 max-w-[600px] mb-12">
            [CLIENT TO SUPPLY — 2 sentences, facts only: inspection process, who does it.]
          </p>
        </SectionReveal>

        {/* Grades */}
        <SectionReveal delay={0.06}>
          <section aria-labelledby="grades-heading">
            <h2 id="grades-heading" className="text-[24px] font-semibold text-ink mb-5">
              Grades
            </h2>
            <div className="space-y-4">
              {GRADES.map((grade, i) => (
                <SectionReveal key={grade.name} delay={i * 0.06}>
                  <div className="flex flex-col sm:flex-row gap-4 rounded-[16px] border border-line bg-surface p-6">
                    {/* Photo placeholder — 4:3 ratio per spec */}
                    <div
                      className="shrink-0 w-full sm:w-[160px] rounded-[10px] bg-[var(--line)] flex items-center justify-center text-[12px] text-ink-2"
                      style={{ aspectRatio: "4/3" }}
                    >
                      [PHOTO — {grade.name}]
                    </div>
                    {/* Info */}
                    <div className="flex-1 space-y-1.5">
                      <p className="text-[18px] font-semibold text-ink">{grade.name}</p>
                      <p className="text-[15px] text-ink-2">{grade.definition}</p>
                      <p className="text-[14px] font-medium text-ok">
                        Battery: {grade.battery}
                      </p>
                    </div>
                  </div>
                </SectionReveal>
              ))}
            </div>
          </section>
        </SectionReveal>

        {/* Detail sections */}
        <div className="mt-14 space-y-12">
          {SECTIONS.map((section, i) => (
            <SectionReveal key={section.id} delay={0.04 * i}>
              <section id={section.id} aria-labelledby={`${section.id}-heading`}>
                <h2
                  id={`${section.id}-heading`}
                  className="text-[24px] font-semibold text-ink mb-3"
                >
                  {section.title}
                </h2>
                <p className="text-[15px] text-ink-2 max-w-[680px]">{section.body}</p>
              </section>
            </SectionReveal>
          ))}
        </div>

        {/* CTA */}
        <SectionReveal delay={0.08}>
          <div className="mt-12 pt-8 border-t border-line flex flex-wrap gap-4 items-center">
            <Link
              href="/iphone"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent text-white text-[15px] font-medium hover:bg-accent-press transition-colors duration-[120ms] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Shop pre-owned iPhone
            </Link>
            <Link
              href="/support"
              className="text-[15px] text-accent hover:text-accent-press underline-offset-2 hover:underline transition-colors duration-[120ms]"
            >
              Questions? Contact support →
            </Link>
          </div>
        </SectionReveal>
      </div>
    </main>
  );
}
