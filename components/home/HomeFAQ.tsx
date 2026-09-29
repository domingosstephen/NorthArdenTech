import { Accordion } from "@/components/ui";
import { SectionReveal } from "@/components/pdp/SectionReveal";

const FAQ_ITEMS = [
  {
    question: "What's the difference between the grades?",
    answer: "[ANSWER]",
  },
  {
    question: "Are pre-owned iPhones unlocked?",
    answer: "[ANSWER]",
  },
  {
    question: "What comes in the box?",
    answer: "[ANSWER]",
  },
  {
    question: "How does the warranty work?",
    answer: "[ANSWER]",
  },
  {
    question: "When will my order ship?",
    answer: "[ANSWER]",
  },
  {
    question: "Can I return it?",
    answer: "[ANSWER]",
  },
] as const;

export function HomeFAQ() {
  return (
    <SectionReveal>
      <section
        className="mx-auto px-4 py-14"
        style={{ maxWidth: "var(--max-w-content)" }}
        aria-labelledby="faq-heading"
      >
        <h2
          id="faq-heading"
          className="text-[28px] font-semibold text-ink tracking-[-0.02em] mb-6"
        >
          Questions, answered.
        </h2>
        <div className="max-w-[720px] divide-y divide-line border-t border-b border-line">
          {FAQ_ITEMS.map((item) => (
            <Accordion key={item.question} question={item.question}>
              {item.answer}
            </Accordion>
          ))}
        </div>
      </section>
    </SectionReveal>
  );
}
