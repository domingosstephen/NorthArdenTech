// Shown on Home and PLP only — never in the root layout.
// Three facts from COPY-DECK. All bracket values pending client.

const FACTS = [
  "[X]-day returns",
  "[X]-month warranty on every iPhone",
  "Free shipping over $[X]",
] as const;

export function TrustStrip() {
  return (
    <div
      className="border-b border-line"
      style={{ backgroundColor: "var(--surface)" }}
    >
      <ul className="mx-auto flex flex-wrap items-center justify-center gap-x-8 gap-y-2 px-6 py-2.5"
        style={{ maxWidth: "var(--max-w-content)" }}
      >
        {FACTS.map((fact) => (
          <li key={fact} className="text-[12px] text-ink-2">
            {fact}
          </li>
        ))}
      </ul>
    </div>
  );
}
