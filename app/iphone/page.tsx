import { commerce } from "@/lib/commerce";
import { ShopClient } from "@/components/shop/ShopClient";
import { TrustStrip } from "@/components/layout/TrustStrip";

import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://northardentech.com";
const DESC =
  "Every iPhone from 14 to Duo — new and pre-owned, every model, storage, and condition with battery health shown upfront.";

export const metadata: Metadata = {
  title: "Shop iPhone",
  description: DESC,
  alternates: { canonical: `${SITE_URL}/iphone` },
  openGraph: {
    title: "Shop iPhone | NorthArdenTech",
    description: DESC,
    url: `${SITE_URL}/iphone`,
    type: "website",
    siteName: "NorthArdenTech",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop iPhone | NorthArdenTech",
    description: DESC,
  },
};

export default async function ShopAllPage() {
  const families = await commerce.getFamilies();

  return (
    <main>
      <TrustStrip />
      {/* Page header */}
      <div
        className="mx-auto px-4 pt-10 pb-4"
        style={{ maxWidth: "var(--max-w-content)" }}
      >
        <h1 className="text-[34px] font-semibold text-ink tracking-[-0.02em]">
          Shop iPhone
        </h1>
        <p className="mt-1 text-[17px] text-ink-2">
          Every model — new and pre-owned.
        </p>
      </div>

      <ShopClient families={families} />
    </main>
  );
}
