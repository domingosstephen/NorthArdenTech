// Active commerce adapter — switch via NEXT_PUBLIC_COMMERCE_PROVIDER env var.
// Default: "mock". Set to "shopify" once Shopify store and metafields are configured.
//
// See /lib/commerce/adapters/shopify.ts for the required Shopify product structure.

import { mockAdapter } from "./adapters/mock";
import type { CommerceAdapter } from "./types";

const provider = process.env.NEXT_PUBLIC_COMMERCE_PROVIDER ?? "mock";

function getAdapter(): CommerceAdapter {
  if (provider === "shopify") {
    // Dynamic import keeps the Shopify adapter (and its fetch calls) out of the
    // mock bundle. Index.ts is always evaluated server-side.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { shopifyAdapter } = require("./adapters/shopify") as {
      shopifyAdapter: CommerceAdapter;
    };
    return shopifyAdapter;
  }
  return mockAdapter;
}

export const commerce: CommerceAdapter = getAdapter();

// Re-export all types so callers only need one import path.
export type {
  Cart,
  CartItem,
  CommerceAdapter,
  Condition,
  Connectivity,
  Family,
  FamilySpecs,
  FamilyStatus,
  Finish,
  Tier,
  Variant,
  VariantSelection,
} from "./types";
