// Active commerce adapter — switch via NEXT_PUBLIC_COMMERCE_PROVIDER env var.
// Default: "mock". Set to "shopify" after step 9.

import { mockAdapter } from "./adapters/mock";
import type { CommerceAdapter } from "./types";

const provider = process.env.NEXT_PUBLIC_COMMERCE_PROVIDER ?? "mock";

function getAdapter(): CommerceAdapter {
  if (provider === "shopify") {
    throw new Error(
      "Shopify adapter not yet implemented — see BUILD-SPEC §8 and build step 9."
    );
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
