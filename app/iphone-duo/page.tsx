import { notFound } from "next/navigation";
import { commerce } from "@/lib/commerce";
import { PDPClient } from "@/components/pdp/PDPClient";
import { SectionReveal } from "@/components/pdp/SectionReveal";
import { buildDuoJsonLd, jsonLdScript } from "@/lib/seo/jsonLd";
import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://northardentech.com";

export const metadata: Metadata = {
  title: "iPhone Duo",
  description:
    "Apple's first foldable iPhone. Pre-order today from NorthArdenTech — every storage and finish, unlocked.",
  openGraph: {
    title: "iPhone Duo | NorthArdenTech",
    description: "Apple's first foldable iPhone. Pre-order today — unlocked.",
    url: `${SITE_URL}/iphone-duo`,
    type: "website",
    siteName: "NorthArdenTech",
  },
  twitter: {
    card: "summary_large_image",
    title: "iPhone Duo | NorthArdenTech",
    description: "Apple's first foldable iPhone. Pre-order today — unlocked.",
  },
  alternates: { canonical: `${SITE_URL}/iphone-duo` },
};

export default async function IPhoneDuoPage() {
  const duo = await commerce.getFamily("iphone-duo");
  if (!duo) notFound();

  const isPreorder = duo.status === "preorder";
  const isBackorder = duo.status === "current" && duo.variants.every((v) => v.stock === 0);
  const statusLine = isPreorder
    ? `Pre-order today. Ships from ${duo.variants[0]?.shipsBy ?? "[DATE]"}.`
    : isBackorder
    ? `Currently on backorder. Ships ${duo.variants[0]?.shipsBy ?? "[DATE RANGE]"}.`
    : `In stock. Ships ${duo.variants[0]?.shipsBy ?? "[DATE RANGE]"}.`;

  const prices = duo.variants.filter((v) => !v.placeholder && v.price > 0).map((v) => v.price);
  const lowestPrice = prices.length > 0 ? `From $${Math.min(...prices).toLocaleString()}` : "From $[PRICE]";

  const jsonLd = buildDuoJsonLd({ family: duo, siteUrl: SITE_URL });

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      {/* ── Dark hero ─────────────────────────────────────────────── */}
      <section
        className="py-16 md:py-24"
        style={{ backgroundColor: "var(--surface-dark)" }}
        aria-labelledby="duo-hero-heading"
      >
        <div
          className="mx-auto px-4 flex flex-col md:flex-row items-center gap-12"
          style={{ maxWidth: "var(--max-w-content)" }}
        >
          <div className="flex-1">
            <p className="mb-3 text-[12px] font-semibold uppercase tracking-widest text-white/50">
              {isPreorder ? "Pre-order" : "New"}
            </p>
            <h1
              id="duo-hero-heading"
              className="text-[52px] md:text-[64px] font-semibold text-white tracking-[-0.03em] leading-[1.02]"
            >
              iPhone Duo.
            </h1>
            <p className="mt-3 text-[21px] text-white/70">
              Apple&apos;s first foldable iPhone.
            </p>
            <p className="mt-2 text-[17px] text-white/50">{statusLine}</p>
            <p
              className="mt-3 text-[24px] font-semibold text-white"
              style={{ fontFeatureSettings: '"tnum" 1' }}
            >
              {lowestPrice}
            </p>
          </div>

          {/* Fold silhouette */}
          <div className="flex-1 flex items-center justify-center" aria-hidden>
            <svg
              viewBox="0 0 320 380"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-[200px] md:w-[260px]"
              aria-label="iPhone Duo open foldable silhouette"
            >
              <rect x="4" y="4" width="148" height="372" rx="22" fill="rgba(255,255,255,.07)" stroke="rgba(255,255,255,.14)" strokeWidth="2" />
              <rect x="14" y="16" width="128" height="348" rx="16" fill="rgba(255,255,255,.04)" />
              <rect x="168" y="4" width="148" height="372" rx="22" fill="rgba(255,255,255,.07)" stroke="rgba(255,255,255,.14)" strokeWidth="2" />
              <rect x="178" y="16" width="128" height="348" rx="16" fill="rgba(255,255,255,.04)" />
              <rect x="150" y="4" width="20" height="372" rx="3" fill="rgba(255,255,255,.10)" />
              <text x="160" y="196" textAnchor="middle" dominantBaseline="middle" fontSize="15" fill="rgba(255,255,255,.30)" fontFamily="system-ui, sans-serif">Duo</text>
            </svg>
          </div>
        </div>
      </section>

      {/* ── Configurator (same PDPClient as /iphone/[family]) ─────── */}
      <PDPClient family={duo} siblings={[]} />

      {/* ── Key specs ─────────────────────────────────────────────── */}
      <SectionReveal>
        <section
          className="mx-auto px-4 py-14 border-t border-line"
          style={{ maxWidth: "var(--max-w-content)" }}
          aria-labelledby="duo-specs-heading"
        >
          <h2
            id="duo-specs-heading"
            className="text-[28px] font-semibold text-ink tracking-[-0.02em] mb-4"
          >
            Key specs.
          </h2>
          <table className="w-full max-w-xl text-[15px] border-collapse">
            <tbody>
              {(
                [
                  ["Chip", duo.specs.chip],
                  ["Display", duo.specs.display],
                  ["Camera", duo.specs.camera],
                  ["Battery (video)", `${duo.specs.batteryVideoHrs} hrs`],
                  ["Weight", duo.specs.weight],
                  ["Connector", duo.specs.connector],
                  ["Release year", String(duo.specs.releaseYear)],
                ] as [string, string][]
              ).map(([label, value]) => (
                <tr key={label} className="border-t border-line">
                  <td className="py-3 pr-4 text-ink-2 w-1/2">{label}</td>
                  <td className="py-3 text-ink font-medium" style={{ fontFeatureSettings: '"tnum" 1' }}>
                    {value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 text-[13px] text-ink-2">
            All spec values [SPEC] until supplied and verified by client.
          </p>
        </section>
      </SectionReveal>
    </main>
  );
}
