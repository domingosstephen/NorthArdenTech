import Link from "next/link";
import { SectionReveal } from "@/components/pdp/SectionReveal";

export const metadata = {
  title: "Support",
  description: "Shipping, returns, warranty, payment, and order status — NorthArdenTech support.",
};

const TILES = [
  {
    title: "Shipping",
    body: "[CLIENT TO SUPPLY]",
    href: "#shipping",
    icon: "shipping",
  },
  {
    title: "Returns",
    body: "[CLIENT TO SUPPLY]",
    href: "#returns",
    icon: "returns",
  },
  {
    title: "Warranty",
    body: "[CLIENT TO SUPPLY]",
    href: "#warranty",
    icon: "warranty",
  },
  {
    title: "Payment",
    body: "[CLIENT TO SUPPLY]",
    href: "#payment",
    icon: "payment",
  },
  {
    title: "Order status",
    body: "[CLIENT TO SUPPLY — link to order tracking]",
    href: "#order-status",
    icon: "order",
  },
  {
    title: "Contact us",
    body: "[EMAIL] · [PHONE] · [HOURS, TIME ZONE]",
    href: "#contact",
    icon: "contact",
  },
] as const;

export default function SupportPage() {
  return (
    <main>
      <div className="mx-auto px-4 py-12 md:py-16" style={{ maxWidth: "var(--max-w-content)" }}>
        <SectionReveal>
          <h1 className="text-[40px] md:text-[48px] font-semibold text-ink tracking-[-0.02em] mb-2">
            How can we help?
          </h1>
          <p className="text-[17px] text-ink-2 mb-10">
            Find answers below, or reach us directly.
          </p>
        </SectionReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TILES.map((tile, i) => (
            <SectionReveal key={tile.title} delay={Math.min(i, 3) * 0.06}>
              <div
                id={tile.href.slice(1)}
                className="rounded-[16px] border border-line bg-surface p-6 flex flex-col gap-3 h-full"
              >
                <SupportIcon type={tile.icon} />
                <h2 className="text-[18px] font-semibold text-ink">{tile.title}</h2>
                <p className="text-[15px] text-ink-2 flex-1">{tile.body}</p>
              </div>
            </SectionReveal>
          ))}
        </div>

        <SectionReveal delay={0.1}>
          <div className="mt-10 text-[14px] text-ink-2 flex flex-wrap gap-4">
            <Link href="/returns" className="underline hover:text-ink transition-colors duration-[120ms]">
              Returns policy
            </Link>
            <Link href="/warranty" className="underline hover:text-ink transition-colors duration-[120ms]">
              Warranty terms
            </Link>
            <Link href="/terms" className="underline hover:text-ink transition-colors duration-[120ms]">
              Terms of service
            </Link>
          </div>
        </SectionReveal>
      </div>
    </main>
  );
}

function SupportIcon({ type }: { type: string }) {
  const cls = "text-ink-2 mb-1";
  if (type === "shipping") return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className={cls} aria-hidden>
      <path d="M1 3h15v13H1V3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M16 8h4l3 4v4h-7V8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="5.5" cy="18.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="18.5" cy="18.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
  if (type === "returns") return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className={cls} aria-hidden>
      <path d="M3 12a9 9 0 1 0 9-9 9 9 0 0 1-6.36 2.64L3 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M3 3v5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  if (type === "warranty") return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className={cls} aria-hidden>
      <path d="M12 2L3 6v6c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V6l-9-4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M8.5 12l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  if (type === "payment") return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className={cls} aria-hidden>
      <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 10h20" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
  if (type === "order") return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className={cls} aria-hidden>
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
  // contact
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className={cls} aria-hidden>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.06 6.06l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
