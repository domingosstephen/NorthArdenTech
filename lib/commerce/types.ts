// Commerce adapter contract — /lib/commerce/types.ts
// Two implementations: mock (reads /data/catalog.json) and shopify (Storefront API, step 9).
// UI code must ONLY import from this file and /lib/commerce/index.ts — never from adapters directly.

export type Condition = "new" | "premium" | "excellent" | "good" | "fair";
export type Connectivity = "unlocked" | "carrier";
export type FamilyStatus = "current" | "discontinued" | "preorder";
export type Tier = "base" | "plus" | "mini" | "e" | "air" | "pro" | "pro-max" | "duo";

export interface FamilySpecs {
  chip: string;
  display: string;
  camera: string;
  batteryVideoHrs: string;
  weight: string;
  connector: string;
  releaseYear: string | number;
}

export interface Finish {
  name: string;
  /** Hex for swatch colour only — not for tinting UI */
  hex: string;
  images: string[];
}

export interface Variant {
  id: string;
  storage: string;
  finish: string;
  condition: Condition;
  connectivity: Connectivity;
  /** Dollars. 0 + placeholder:true means not yet set. */
  price: number;
  placeholder?: boolean;
  /** Original price if on sale */
  compareAt?: number;
  stock: number;
  /** Pre-owned only — e.g. "90%+" */
  batteryFloor?: string;
  /** Human-readable date or range — e.g. "[DATE]" */
  shipsBy?: string;
}

export interface Family {
  slug: string;
  name: string;
  generation: number;
  tier: Tier;
  status: FamilyStatus;
  specs: FamilySpecs;
  finishes: Finish[];
  variants: Variant[];
}

export interface Catalog {
  _schema: string;
  _note: string;
  families: Family[];
}

// ── Cart ────────────────────────────────────────────────────────

export interface CartItem {
  variantId: string;
  familySlug: string;
  familyName: string;
  finish: string;
  storage: string;
  condition: Condition;
  price: number;
  quantity: number;
  batteryFloor?: string;
  /** First image URL for the selected finish */
  image?: string;
}

export interface Cart {
  id: string;
  items: CartItem[];
}

// ── Adapter interface ───────────────────────────────────────────

export interface VariantSelection {
  storage: string;
  finish: string;
  condition: Condition;
  connectivity: Connectivity;
}

export interface CommerceAdapter {
  getFamilies(): Promise<Family[]>;
  getFamily(slug: string): Promise<Family | null>;
  /**
   * Find the best-matching variant for a (partial) selection.
   * Returns null when no variant matches.
   */
  getVariant(
    familySlug: string,
    selection: Partial<VariantSelection>
  ): Promise<Variant | null>;
  /**
   * Returns the URL to send the user to for checkout.
   * Mock → /bag; Shopify → hosted checkout URL.
   */
  getCheckoutUrl(cart: Cart): Promise<string>;
  cart: {
    get(): Promise<Cart>;
    add(
      item: Omit<CartItem, "quantity"> & { quantity?: number }
    ): Promise<Cart>;
    update(variantId: string, quantity: number): Promise<Cart>;
    remove(variantId: string): Promise<Cart>;
  };
}
