import { notFound } from "next/navigation";
import { commerce } from "@/lib/commerce";
import { PDPClient } from "@/components/pdp/PDPClient";
import type { Tier } from "@/lib/commerce/types";
import { buildProductJsonLd, jsonLdScript } from "@/lib/seo/jsonLd";

/** Tiers that form a size-line pair (e.g. Pro + Pro Max, Base + Plus) */
const SIZE_LINE_GROUPS: Tier[][] = [
  ["base", "plus"],
  ["pro", "pro-max"],
];

function getSiblingTiers(tier: Tier): Tier[] {
  for (const group of SIZE_LINE_GROUPS) {
    if (group.includes(tier)) return group.filter((t) => t !== tier);
  }
  return [];
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://northardentech.com";

export async function generateMetadata(props: PageProps<"/iphone/[family]">) {
  const { family: slug } = await props.params;
  const family = await commerce.getFamily(slug);
  if (!family) return {};

  const lowestPrice = family.variants.reduce(
    (min, v) => (v.price > 0 && v.price < min ? v.price : min),
    Infinity
  );
  const priceStr =
    lowestPrice < Infinity
      ? ` from $${(lowestPrice / 100).toLocaleString("en-US")}`
      : "";

  const description = `Buy ${family.name}${priceStr}. New and pre-owned, every storage and condition, with battery health shown upfront.`;

  return {
    title: `Buy ${family.name}`,
    description,
    openGraph: {
      title: `Buy ${family.name} | NorthArdenTech`,
      description,
      url: `${SITE_URL}/iphone/${slug}`,
      type: "website",
      siteName: "NorthArdenTech",
    },
    twitter: {
      card: "summary_large_image",
      title: `Buy ${family.name} | NorthArdenTech`,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/iphone/${slug}`,
    },
  };
}

export default async function ProductPage(props: PageProps<"/iphone/[family]">) {
  const { family: slug } = await props.params;

  const [family, allFamilies] = await Promise.all([
    commerce.getFamily(slug),
    commerce.getFamilies(),
  ]);

  if (!family) notFound();

  // Siblings = same generation, complementary tier in a size line
  const siblingTiers = getSiblingTiers(family.tier);
  const siblings = allFamilies.filter(
    (f) => f.generation === family.generation && siblingTiers.includes(f.tier)
  );

  const jsonLd = buildProductJsonLd({ family, siteUrl: SITE_URL });

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      <PDPClient family={family} siblings={siblings} />
    </main>
  );
}
