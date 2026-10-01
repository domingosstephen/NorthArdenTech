import { commerce } from "@/lib/commerce";
import { CompareClient } from "@/components/compare/CompareClient";

import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://northardentech.com";
const DESC = "Compare any three iPhones side-by-side — display, chip, camera, battery, and more.";

export const metadata: Metadata = {
  title: "Compare iPhone models",
  description: DESC,
  alternates: { canonical: `${SITE_URL}/compare` },
  openGraph: {
    title: "Compare iPhone models | NorthArdenTech",
    description: DESC,
    url: `${SITE_URL}/compare`,
    type: "website",
    siteName: "NorthArdenTech",
  },
  twitter: {
    card: "summary_large_image",
    title: "Compare iPhone models | NorthArdenTech",
    description: DESC,
  },
};

export default async function ComparePage() {
  const families = await commerce.getFamilies();

  return (
    <main>
      <div className="mx-auto px-4 py-10 md:py-14" style={{ maxWidth: "var(--max-w-content)" }}>
        <h1 className="text-[34px] font-semibold text-ink tracking-[-0.02em] mb-2">
          Compare iPhone models.
        </h1>
        <p className="text-[17px] text-ink-2 mb-8">
          Up to three models side-by-side.
        </p>
        <CompareClient families={families} />
      </div>
    </main>
  );
}
