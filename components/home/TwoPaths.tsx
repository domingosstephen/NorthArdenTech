import Link from "next/link";
import { Button } from "@/components/ui";
import { SectionReveal } from "@/components/pdp/SectionReveal";

export function TwoPaths() {
  return (
    <SectionReveal>
      <section
        className="mx-auto px-4 py-14"
        style={{ maxWidth: "var(--max-w-content)" }}
        aria-labelledby="twopaths-heading"
      >
        <h2
          id="twopaths-heading"
          className="text-[28px] font-semibold text-ink tracking-[-0.02em] mb-6"
        >
          Two ways to buy.
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* New */}
          <div className="rounded-[20px] border border-line bg-surface p-8 flex flex-col gap-4">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-widest text-ink-2 mb-2">
                New
              </p>
              <h3 className="text-[22px] font-semibold text-ink leading-tight">
                Sealed, current models.
              </h3>
              <p className="mt-2 text-[15px] text-ink-2">
                Full manufacturer warranty. Ships directly from NorthArdenTech.
              </p>
            </div>
            <div className="mt-auto">
              <Link href="/iphone?condition=new">
                <Button variant="secondary" size="sm">Shop new</Button>
              </Link>
            </div>
          </div>

          {/* Pre-owned */}
          <div className="rounded-[20px] border border-line bg-surface p-8 flex flex-col gap-4">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-widest text-ink-2 mb-2">
                Pre-owned
              </p>
              <h3 className="text-[22px] font-semibold text-ink leading-tight">
                Previous generations, inspected and graded.
              </h3>
              <p className="mt-2 text-[15px] text-ink-2">
                [X]-month NorthArdenTech warranty included on every device.
              </p>
            </div>
            <div className="mt-auto">
              <Link href="/iphone?condition=pre-owned">
                <Button variant="secondary" size="sm">Shop pre-owned</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SectionReveal>
  );
}
