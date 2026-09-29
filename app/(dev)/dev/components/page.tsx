"use client";

import { useState } from "react";
import {
  Accordion,
  Button,
  Chip,
  Drawer,
  OptionTile,
  Price,
  Sheet,
  SpecRail,
  Swatch,
  SwatchGroup,
  Tooltip,
  useAddToBag,
} from "@/components/ui";

export default function DevComponentsPage() {
  return (
    <div className="min-h-screen bg-bg px-8 py-12 space-y-16">
      <header>
        <h1 className="text-[40px] font-semibold text-ink tracking-[-0.02em]">
          Component Sandbox
        </h1>
        <p className="mt-2 text-[17px] text-ink-2">
          Every primitive · all states · default / hover / selected / disabled / focus / reduced-motion
        </p>
      </header>

      <Section title="Button — primary">
        <ButtonDemo />
      </Section>

      <Section title="Button — variants">
        <div className="flex flex-wrap gap-4 items-center">
          <Button variant="primary">Shop iPhone</Button>
          <Button variant="secondary">Learn more</Button>
          <Button variant="ghost">How we grade</Button>
          <Button variant="primary" size="sm">Small</Button>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <Button variant="primary" disabled>Disabled primary</Button>
          <Button variant="secondary" disabled>Disabled secondary</Button>
        </div>
      </Section>

      <Section title="Chip">
        <ChipDemo />
      </Section>

      <Section title="OptionTile — condition">
        <OptionTileDemo />
      </Section>

      <Section title="Swatch + SwatchGroup">
        <SwatchDemo />
      </Section>

      <Section title="SpecRail">
        <SpecRailDemo />
      </Section>

      <Section title="Price — digit roll">
        <PriceDemo />
      </Section>

      <Section title="Accordion">
        <AccordionDemo />
      </Section>

      <Section title="Tooltip">
        <TooltipDemo />
      </Section>

      <Section title="Drawer">
        <DrawerDemo />
      </Section>

      <Section title="Sheet (mobile bottom sheet)">
        <SheetDemo />
      </Section>
    </div>
  );
}

/* ── Section wrapper ───────────────────────────────────────── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-6">
      <h2 className="text-[21px] font-semibold text-ink border-b border-line pb-3">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

/* ── Button demo ────────────────────────────────────────────── */
function ButtonDemo() {
  const addToBag = useAddToBag();
  return (
    <div className="flex flex-wrap gap-4 items-center">
      <Button variant="primary" loading={addToBag.loading} success={addToBag.success} onClick={addToBag.trigger}>
        Add to Bag
      </Button>
      <Button variant="primary" loading>Loading…</Button>
      <Button variant="primary" success>Added</Button>
      <span className="text-[14px] text-ink-2">← click "Add to Bag" to see sequence</span>
    </div>
  );
}

/* ── Chip demo ──────────────────────────────────────────────── */
function ChipDemo() {
  const filters = ["iPhone 16", "iPhone 15", "iPhone 14", "Pre-owned", "Under $500"];
  const [active, setActive] = useState<string[]>([]);

  const toggle = (f: string) =>
    setActive((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((f) => (
        <Chip key={f} selected={active.includes(f)} onClick={() => toggle(f)}>
          {f}
        </Chip>
      ))}
      <Chip disabled>Disabled</Chip>
    </div>
  );
}

/* ── OptionTile demo ────────────────────────────────────────── */
function OptionTileDemo() {
  const [selected, setSelected] = useState("excellent");

  const conditions = [
    { id: "new", label: "New", price: "$1,099" },
    { id: "premium", label: "Premium", price: "$849", badge: "Battery 95%+" },
    { id: "excellent", label: "Excellent", price: "$749", badge: "Battery 90%+" },
    { id: "good", label: "Good", price: "$649", badge: "Battery 85%+" },
    { id: "fair", label: "Fair", price: "$549", badge: "Battery 80%+", disabled: true },
  ] as const;

  return (
    <div role="radiogroup" aria-label="Condition" className="flex flex-wrap gap-3">
      {conditions.map((c) => (
        <OptionTile
          key={c.id}
          selected={selected === c.id}
          disabled={"disabled" in c && c.disabled}
          price={c.price}
          badge={"badge" in c ? c.badge : undefined}
          onClick={() => setSelected(c.id)}
        >
          {c.label}
        </OptionTile>
      ))}
    </div>
  );
}

/* ── Swatch demo ────────────────────────────────────────────── */
function SwatchDemo() {
  const [finish, setFinish] = useState("Black Titanium");
  const finishes = [
    { name: "Black Titanium", color: "#2C2C2E" },
    { name: "White Titanium", color: "#F0EDE8" },
    { name: "Natural Titanium", color: "#C4B59B" },
    { name: "Desert Titanium", color: "#C5A368" },
  ];
  return (
    <div className="space-y-4">
      <p className="text-[14px] text-ink-2">Individual swatches</p>
      <div className="flex gap-3">
        {finishes.map((f) => (
          <Swatch
            key={f.name}
            color={f.color}
            name={f.name}
            selected={finish === f.name}
            onClick={() => setFinish(f.name)}
          />
        ))}
      </div>
      <p className="text-[14px] text-ink-2 mt-4">SwatchGroup (with name label)</p>
      <SwatchGroup options={finishes} selected={finish} onChange={setFinish} />
    </div>
  );
}

/* ── SpecRail demo ──────────────────────────────────────────── */
function SpecRailDemo() {
  const full = [
    { value: "A17 Pro" },
    { value: '6.1″' },
    { value: "48 MP" },
    { value: "Excellent · Battery 90%+", color: "ok" as const },
    { value: "from 128 GB" },
  ];
  const condensed = [{ value: "A17 Pro" }, { value: '6.1″' }, { value: "48 MP" }];
  const withWarn = [
    { value: "A15 Bionic" },
    { value: '6.1″' },
    { value: "12 MP" },
    { value: "Good · Battery 85%+", color: "warn" as const },
    { value: "from 64 GB" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[12px] text-ink-2 mb-1">Full (5 facts) — PDP</p>
        <SpecRail facts={full} />
      </div>
      <div>
        <p className="text-[12px] text-ink-2 mb-1">Condensed (3 facts) — grid card</p>
        <SpecRail facts={condensed} condensed />
      </div>
      <div>
        <p className="text-[12px] text-ink-2 mb-1">Warn colour on battery</p>
        <SpecRail facts={withWarn} />
      </div>
    </div>
  );
}

/* ── Price demo ─────────────────────────────────────────────── */
function PriceDemo() {
  const prices = [799, 899, 999, 1099, 1299, 1099];
  const [idx, setIdx] = useState(0);

  return (
    <div className="space-y-4">
      <Price value={prices[idx]} className="text-[40px] font-semibold" />
      <div className="flex flex-wrap gap-2">
        {prices.map((p, i) => (
          <Chip key={i} selected={idx === i} onClick={() => setIdx(i)}>
            ${p}
          </Chip>
        ))}
      </div>
      <p className="text-[14px] text-ink-2">Click a price to see digit roll animation.</p>
    </div>
  );
}

/* ── Accordion demo ─────────────────────────────────────────── */
function AccordionDemo() {
  const faqs = [
    { q: "What's the difference between the grades?", a: "[ANSWER]" },
    { q: "Are pre-owned iPhones unlocked?", a: "[ANSWER]" },
    { q: "What comes in the box?", a: "[ANSWER]" },
    { q: "How does the warranty work?", a: "[ANSWER]" },
    { q: "When will my order ship?", a: "[ANSWER]" },
    { q: "Can I return it?", a: "[ANSWER]" },
  ];

  return (
    <div className="max-w-2xl divide-y-0 border-t border-line">
      {faqs.map((f) => (
        <Accordion key={f.q} question={f.q}>
          {f.a}
        </Accordion>
      ))}
    </div>
  );
}

/* ── Tooltip demo ───────────────────────────────────────────── */
function TooltipDemo() {
  return (
    <div className="flex flex-wrap gap-4 items-center">
      <Tooltip content="Out of stock in this configuration." delay={300}>
        <OptionTile disabled price="$649">
          Fair
        </OptionTile>
      </Tooltip>
      <Tooltip content="Hover for 300 ms to see me." delay={300}>
        <Button variant="secondary">Hover me</Button>
      </Tooltip>
      <p className="text-[14px] text-ink-2">← hover / focus to trigger (300 ms delay)</p>
    </div>
  );
}

/* ── Drawer demo ────────────────────────────────────────────── */
function DrawerDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        Open bag drawer
      </Button>
      <Drawer open={open} onClose={() => setOpen(false)} title="Your Bag">
        <div className="p-6 space-y-4">
          <p className="text-[17px] text-ink-2">Your bag is empty.</p>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Shop iPhone
          </Button>
        </div>
      </Drawer>
    </>
  );
}

/* ── Sheet demo ─────────────────────────────────────────────── */
function SheetDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Open filter sheet (mobile)
      </Button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Filter">
        <div className="space-y-4">
          <p className="text-[14px] text-ink-2 font-medium">Generation</p>
          <div className="flex flex-wrap gap-2">
            {["16", "15", "14"].map((g) => (
              <Chip key={g}>iPhone {g}</Chip>
            ))}
          </div>
          <p className="text-[14px] text-ink-2 font-medium mt-4">Condition</p>
          <div className="flex flex-wrap gap-2">
            {["New", "Pre-owned"].map((c) => (
              <Chip key={c}>{c}</Chip>
            ))}
          </div>
        </div>
      </Sheet>
    </>
  );
}
