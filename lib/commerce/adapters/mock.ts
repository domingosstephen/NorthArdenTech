// Mock commerce adapter — reads /data/catalog.json, in-memory cart.
// Cart state lives in module scope (single-user dev only; resets on cold start).
// Replace with cookie/session persistence in production or switch to Shopify adapter (step 9).

import type {
  Cart,
  CartItem,
  CommerceAdapter,
  Family,
  Variant,
  VariantSelection,
} from "../types";

// Next.js bundles JSON imports at build time — safe to import here.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const catalog = require("@/data/catalog.json") as {
  families: Family[];
};

// ── In-memory cart (dev only) ───────────────────────────────────
let _cart: Cart = { id: "mock-cart-001", items: [] };

function cloneCart(): Cart {
  return { id: _cart.id, items: _cart.items.map((i) => ({ ...i })) };
}

// ── Adapter ─────────────────────────────────────────────────────
export const mockAdapter: CommerceAdapter = {
  async getFamilies(): Promise<Family[]> {
    return catalog.families;
  },

  async getFamily(slug: string): Promise<Family | null> {
    return catalog.families.find((f) => f.slug === slug) ?? null;
  },

  async getVariant(
    familySlug: string,
    selection: Partial<VariantSelection>
  ): Promise<Variant | null> {
    const family = catalog.families.find((f) => f.slug === familySlug);
    if (!family) return null;

    // Exact match first
    const exact = family.variants.find((v) => {
      if (selection.condition && v.condition !== selection.condition) return false;
      if (selection.storage && v.storage !== selection.storage) return false;
      if (selection.finish && v.finish !== selection.finish) return false;
      if (selection.connectivity && v.connectivity !== selection.connectivity) return false;
      return true;
    });
    if (exact) return exact;

    // Partial match — relax finish then storage
    return (
      family.variants.find((v) => {
        if (selection.condition && v.condition !== selection.condition) return false;
        if (selection.storage && v.storage !== selection.storage) return false;
        return true;
      }) ??
      family.variants.find((v) => {
        if (selection.condition && v.condition !== selection.condition) return false;
        return true;
      }) ??
      family.variants[0] ??
      null
    );
  },

  async getCheckoutUrl(_cart: Cart): Promise<string> {
    // Mock: stay on site. Shopify adapter returns hosted checkout URL.
    return "/bag";
  },

  cart: {
    async get(): Promise<Cart> {
      return cloneCart();
    },

    async add(
      item: Omit<CartItem, "quantity"> & { quantity?: number }
    ): Promise<Cart> {
      const existing = _cart.items.find((i) => i.variantId === item.variantId);
      if (existing) {
        existing.quantity += item.quantity ?? 1;
      } else {
        _cart.items.push({ ...item, quantity: item.quantity ?? 1 });
      }
      return cloneCart();
    },

    async update(variantId: string, quantity: number): Promise<Cart> {
      if (quantity <= 0) {
        _cart.items = _cart.items.filter((i) => i.variantId !== variantId);
      } else {
        const item = _cart.items.find((i) => i.variantId === variantId);
        if (item) item.quantity = quantity;
      }
      return cloneCart();
    },

    async remove(variantId: string): Promise<Cart> {
      _cart.items = _cart.items.filter((i) => i.variantId !== variantId);
      return cloneCart();
    },
  },
};
