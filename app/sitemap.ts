import type { MetadataRoute } from "next";
import { commerce } from "@/lib/commerce";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://northardentech.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const families = await commerce.getFamilies();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/iphone`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/iphone-duo`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/compare`,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/pre-owned`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/support`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/order-status`,
      changeFrequency: "never",
      priority: 0.3,
    },
  ];

  const familyRoutes: MetadataRoute.Sitemap = families
    .filter((f) => f.tier !== "duo") // duo has its own static route
    .map((f) => ({
      url: `${SITE_URL}/iphone/${f.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    }));

  return [...staticRoutes, ...familyRoutes];
}
