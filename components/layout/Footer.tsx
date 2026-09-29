import Link from "next/link";

const SHOP_LINKS = [
  { label: "iPhone", href: "/iphone" },
  { label: "iPhone Duo", href: "/iphone-duo" },
  { label: "Compare", href: "/compare" },
  { label: "Pre-owned guide", href: "/pre-owned" },
];

const HELP_LINKS = [
  { label: "Shipping", href: "/support" },
  { label: "Returns", href: "/returns" },
  { label: "Warranty", href: "/warranty" },
  { label: "Order status", href: "/support" },
  { label: "Contact", href: "/support" },
];

const COMPANY_LINKS = [
  { label: "About", href: "/support" },
  { label: "Accessibility", href: "/accessibility" },
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
];

export function Footer() {
  return (
    <footer
      className="bg-surface-dark text-white/70"
      style={{ backgroundColor: "var(--surface-dark)" }}
    >
      {/* Main columns */}
      <div
        className="mx-auto px-6 pt-16 pb-10"
        style={{ maxWidth: "var(--max-w-content)" }}
      >
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Col 1 — Shop */}
          <div>
            <p className="mb-4 text-[12px] font-semibold uppercase tracking-widest text-white/40">
              Shop
            </p>
            <ul className="space-y-3">
              {SHOP_LINKS.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-[14px] hover:text-white transition-colors duration-[120ms]"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 2 — Help */}
          <div>
            <p className="mb-4 text-[12px] font-semibold uppercase tracking-widest text-white/40">
              Help
            </p>
            <ul className="space-y-3">
              {HELP_LINKS.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-[14px] hover:text-white transition-colors duration-[120ms]"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Company */}
          <div>
            <p className="mb-4 text-[12px] font-semibold uppercase tracking-widest text-white/40">
              Company
            </p>
            <ul className="space-y-3">
              {COMPANY_LINKS.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-[14px] hover:text-white transition-colors duration-[120ms]"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Contact */}
          <div>
            <p className="mb-4 text-[12px] font-semibold uppercase tracking-widest text-white/40">
              Contact
            </p>
            <ul className="space-y-3 text-[14px]">
              <li>[EMAIL]</li>
              <li>[PHONE]</li>
              <li className="text-white/40">[HOURS, TIME ZONE]</li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-12 border-t border-white/10" />

        {/* Trademark + legal */}
        <div className="mt-6 space-y-2">
          <p className="text-[12px] leading-relaxed text-white/40">
            iPhone is a trademark of Apple Inc., registered in the U.S. and other countries.
            NorthArdenTech is not affiliated with or endorsed by Apple Inc.
          </p>
          <p className="text-[12px] text-white/30">
            © {new Date().getFullYear()} [LEGAL ENTITY NAME]. [CITY, STATE].
          </p>
        </div>
      </div>
    </footer>
  );
}
