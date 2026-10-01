/**
 * JSON-LD helpers — Product + Offer schema for PDPs.
 * Spec §10: "Structured data: Product + Offer (with itemCondition New/Refurbished/Used)
 * JSON-LD on PDPs."
 *
 * References:
 *   https://schema.org/Product
 *   https://schema.org/Offer
 *   https://schema.org/OfferItemCondition
 */

import type { Family, Variant } from "@/lib/commerce/types";

// schema.org condition mapping
const CONDITION_MAP: Record<string, string> = {
  new:       "https://schema.org/NewCondition",
  premium:   "https://schema.org/RefurbishedCondition",
  excellent: "https://schema.org/RefurbishedCondition",
  good:      "https://schema.org/UsedCondition",
  fair:      "https://schema.org/UsedCondition",
};

interface ProductJsonLdOptions {
  family: Family;
  /** Base URL, e.g. "https://northardentech.com" */
  siteUrl: string;
}

export function buildProductJsonLd({ family, siteUrl }: ProductJsonLdOptions): object {
  const pageUrl = `${siteUrl}/iphone/${family.slug}`;

  // Build one Offer per variant (condition × storage × finish)
  const offers = family.variants.map((v: Variant) => ({
    "@type": "Offer",
    url: pageUrl,
    priceCurrency: "USD",
    price: v.price === 0 ? undefined : (v.price / 100).toFixed(2),
    availability:
      (v.stock ?? 0) > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    itemCondition: CONDITION_MAP[v.condition] ?? "https://schema.org/UsedCondition",
    ...(v.batteryFloor
      ? { description: `Battery health ${v.batteryFloor}%+` }
      : {}),
  }));

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: family.name,
    url: pageUrl,
    description: `Shop ${family.name} — new and pre-owned, every storage and condition, with battery health shown upfront.`,
    brand: {
      "@type": "Brand",
      name: "Apple",
    },
    offers: offers.length === 1 ? offers[0] : offers,
  };
}

export function buildDuoJsonLd({ family, siteUrl }: ProductJsonLdOptions): object {
  const pageUrl = `${siteUrl}/iphone-duo`;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: family.name,
    url: pageUrl,
    description: "Apple's first foldable iPhone. Pre-order from NorthArdenTech.",
    brand: {
      "@type": "Brand",
      name: "Apple",
    },
    offers: {
      "@type": "Offer",
      url: pageUrl,
      priceCurrency: "USD",
      price: family.variants[0]?.price
        ? (family.variants[0].price / 100).toFixed(2)
        : undefined,
      availability:
        family.status === "preorder"
          ? "https://schema.org/PreOrder"
          : "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };
}

/** Renders JSON-LD as a <script> tag string — embed with dangerouslySetInnerHTML */
export function jsonLdScript(data: object): string {
  return JSON.stringify(data);
}
