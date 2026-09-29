import { SectionReveal } from "@/components/pdp/SectionReveal";

const SERVICES = [
  { icon: "shipping", label: "Free shipping over $[X]" },
  { icon: "returns", label: "[X]-day returns" },
  { icon: "warranty", label: "[X]-month warranty" },
  { icon: "secure", label: "Secure checkout" },
] as const;

export function ServiceRow() {
  return (
    <SectionReveal>
      <section
        className="border-t border-line"
        style={{ backgroundColor: "var(--surface)" }}
        aria-label="Service highlights"
      >
        <ul
          className="mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6"
          style={{ maxWidth: "var(--max-w-content)" }}
        >
          {SERVICES.map((s, i) => (
            <SectionReveal key={s.label} delay={i * 0.06}>
              <li className="flex flex-col items-center text-center gap-2">
                <ServiceIcon type={s.icon} />
                <p className="text-[14px] text-ink-2">{s.label}</p>
              </li>
            </SectionReveal>
          ))}
        </ul>
      </section>
    </SectionReveal>
  );
}

function ServiceIcon({ type }: { type: string }) {
  const cls = "text-ink-2";
  if (type === "shipping") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden className={cls}>
        <path d="M1 3h15v13H1V3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M16 8h4l3 4v4h-7V8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="5.5" cy="18.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="18.5" cy="18.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  }
  if (type === "returns") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden className={cls}>
        <path d="M3 12a9 9 0 1 0 9-9 9 9 0 0 1-6.36 2.64L3 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M3 3v5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === "warranty") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden className={cls}>
        <path d="M12 2L3 6v6c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V6l-9-4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M8.5 12l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  // secure
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden className={cls}>
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
