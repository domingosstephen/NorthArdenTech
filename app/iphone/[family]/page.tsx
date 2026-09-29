import { notFound } from "next/navigation";
import { commerce } from "@/lib/commerce";
import { PDPClient } from "@/components/pdp/PDPClient";
import type { Tier } from "@/lib/commerce/types";

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

export async function generateMetadata(props: PageProps<"/iphone/[family]">) {
  const { family: slug } = await props.params;
  const family = await commerce.getFamily(slug);
  if (!family) return {};
  return {
    title: family.name,
    description: `Shop ${family.name} — new and pre-owned, every storage and condition, with battery health shown upfront.`,
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

  return (
    <main>
      <PDPClient family={family} siblings={siblings} />
    </main>
  );
}
