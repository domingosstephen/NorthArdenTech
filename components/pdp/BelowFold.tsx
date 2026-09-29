"use client";

import { Accordion } from "@/components/ui";
import { SectionReveal } from "./SectionReveal";
import type { Condition, Family } from "@/lib/commerce/types";

interface BelowFoldProps {
  family: Family;
  selectedCondition: Condition;
}

interface ConditionInfo {
  cosmetic: string;
  battery: string;
  tested: string;
  included: string;
}

const CONDITION_DETAIL: Partial<Record<Condition, ConditionInfo>> = {
  premium: {
    cosmetic: "Like new — imperceptible signs of use at any viewing distance.",
    battery: "[SPEC]% or better",
    tested: "[SPEC]",
    included: "[SPEC]",
  },
  excellent: {
    cosmetic: "Minor micro-scratches only, invisible at arm's length.",
    battery: "[SPEC]% or better",
    tested: "[SPEC]",
    included: "[SPEC]",
  },
  good: {
    cosmetic: "Light scratches visible up close; no cracks or deep marks.",
    battery: "[SPEC]% or better",
    tested: "[SPEC]",
    included: "[SPEC]",
  },
  fair: {
    cosmetic: "Visible scuffs or scratches; fully functional.",
    battery: "[SPEC]% or better",
    tested: "[SPEC]",
    included: "[SPEC]",
  },
};

const FAQ_ITEMS = [
  {
    question: "Does this come with a warranty?",
    answer:
      "[X]-month NorthArdenTech warranty included. Extended options available at checkout.",
  },
  {
    question: "Can I return it?",
    answer:
      "[X]-day no-questions return policy. Ship it back and we'll process your refund within [X] business days.",
  },
  {
    question: "Is it carrier-unlocked?",
    answer:
      "Yes — all NorthArdenTech devices are fully unlocked and compatible with all major carriers.",
  },
  {
    question: "How is battery health determined?",
    answer:
      "We use Apple diagnostics to measure maximum capacity. Every device meets or exceeds the listed battery floor.",
  },
  {
    question: "What's the difference between conditions?",
    answer:
      "Premium is like-new. Excellent has micro-scratches invisible at arm's length. Good has light scratches visible up close. Fair shows visible marks but is fully functional. All grades are 100% functional.",
  },
];

export function BelowFold({ family, selectedCondition }: BelowFoldProps) {
  const isPreOwned = selectedCondition !== "new";
  const conditionInfo = CONDITION_DETAIL[selectedCondition];

  return (
    <div className="mt-12 space-y-16">
      {/* What's in the box */}
      <SectionReveal>
        <section aria-labelledby="inbox-heading">
          <h2 id="inbox-heading" className="text-[22px] font-semibold text-ink mb-4">
            What&apos;s in the box
          </h2>
          {selectedCondition === "new" ? (
            <ul className="space-y-2 text-[15px] text-ink-2 list-disc list-inside">
              <li>iPhone</li>
              <li>USB&#8209;C Cable (1&nbsp;m)</li>
              <li>Documentation</li>
            </ul>
          ) : (
            <ul className="space-y-2 text-[15px] text-ink-2 list-disc list-inside">
              <li>iPhone (inspected &amp; certified)</li>
              <li>[SPEC] — cable / charger inclusion varies by grade</li>
              <li>NorthArdenTech warranty card</li>
            </ul>
          )}
        </section>
      </SectionReveal>

      {/* Key specs */}
      <SectionReveal delay={0.06}>
        <section aria-labelledby="specs-heading">
          <h2 id="specs-heading" className="text-[22px] font-semibold text-ink mb-4">
            Key specs
          </h2>
          <table className="w-full text-[15px] border-collapse">
            <tbody>
              {(
                [
                  ["Chip", family.specs.chip],
                  ["Display", family.specs.display],
                  ["Camera", family.specs.camera],
                  ["Battery (video)", `${family.specs.batteryVideoHrs} hrs`],
                  ["Weight", family.specs.weight],
                  ["Connector", family.specs.connector],
                  ["Release year", String(family.specs.releaseYear)],
                ] as [string, string][]
              ).map(([label, value]) => (
                <tr key={label} className="border-t border-line">
                  <td className="py-3 pr-4 text-ink-2 w-1/2">{label}</td>
                  <td
                    className="py-3 text-ink font-medium"
                    style={{ fontFeatureSettings: '"tnum" 1' }}
                  >
                    {value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </SectionReveal>

      {/* Condition explainer — pre-owned only */}
      {isPreOwned && conditionInfo && (
        <SectionReveal delay={0.06}>
          <section aria-labelledby="condition-heading">
            <h2 id="condition-heading" className="text-[22px] font-semibold text-ink mb-4">
              About{" "}
              {selectedCondition.charAt(0).toUpperCase() + selectedCondition.slice(1)} condition
            </h2>
            <div className="rounded-[16px] border border-line p-5 space-y-3">
              <ConditionRow label="Cosmetic" value={conditionInfo.cosmetic} />
              <ConditionRow label="Battery floor" value={conditionInfo.battery} />
              <ConditionRow label="What&apos;s tested" value={conditionInfo.tested} />
              <ConditionRow label="What&apos;s included" value={conditionInfo.included} />
            </div>
            <p className="mt-3 text-[13px] text-ink-2">
              All grades are 100% functional. Cosmetic grading is consistent but subjective —{" "}
              <a
                href="/pre-owned"
                className="underline hover:text-ink transition-colors duration-[120ms]"
              >
                see the full grading guide
              </a>
              .
            </p>
          </section>
        </SectionReveal>
      )}

      {/* FAQ */}
      <SectionReveal delay={0.06}>
        <section aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="text-[22px] font-semibold text-ink mb-4">
            Frequently asked questions
          </h2>
          <div className="divide-y divide-line border-t border-b border-line">
            {FAQ_ITEMS.map((item) => (
              <Accordion key={item.question} question={item.question}>
                {item.answer}
              </Accordion>
            ))}
          </div>
        </section>
      </SectionReveal>
    </div>
  );
}

function ConditionRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 text-[14px]">
      <span className="text-ink-2 w-32 shrink-0">{label}</span>
      <span className="text-ink">{value}</span>
    </div>
  );
}
