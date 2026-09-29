import { commerce } from "@/lib/commerce";
import { TrustStrip } from "@/components/layout/TrustStrip";
import { Hero } from "@/components/home/Hero";
import { DuoBand } from "@/components/home/DuoBand";
import { LineupRail } from "@/components/home/LineupRail";
import { TwoPaths } from "@/components/home/TwoPaths";
import { ConditionPromise } from "@/components/home/ConditionPromise";
import { PrevGenGrid } from "@/components/home/PrevGenGrid";
import { ServiceRow } from "@/components/home/ServiceRow";
import { HomeFAQ } from "@/components/home/HomeFAQ";

export const metadata = {
  title: "NorthArdenTech — Every iPhone, graded honestly",
  description:
    "Shop iPhone — new and pre-owned, every model from 14 to Duo, with condition and battery health shown upfront.",
};

export default async function HomePage() {
  const families = await commerce.getFamilies();

  const duoFamily = families.find((f) => f.tier === "duo") ?? null;

  // Lineup rail: current + preorder, excluding Duo (has its own feature band)
  const railFamilies = families.filter(
    (f) => (f.status === "current" || f.status === "preorder") && f.tier !== "duo"
  );

  // Previous generations grid: discontinued, gens 14–16
  const prevFamilies = families
    .filter((f) => f.status === "discontinued" && f.generation <= 16)
    .sort((a, b) =>
      b.generation !== a.generation ? b.generation - a.generation : a.tier.localeCompare(b.tier)
    );

  return (
    <main>
      <TrustStrip />
      <Hero />
      <DuoBand duo={duoFamily} />
      <LineupRail families={railFamilies} />
      <TwoPaths />
      <ConditionPromise />
      <PrevGenGrid families={prevFamilies} />
      <ServiceRow />
      <HomeFAQ />
    </main>
  );
}
