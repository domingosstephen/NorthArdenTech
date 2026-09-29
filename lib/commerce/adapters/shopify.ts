/**
 * Shopify Storefront API adapter — /lib/commerce/adapters/shopify.ts
 *
 * REQUIRED SHOPIFY PRODUCT STRUCTURE (client must set up before switching):
 * ─────────────────────────────────────────────────────────────────────────
 * Product handle  = family slug  (e.g. "iphone-16-pro")
 * Product title   = family name  (e.g. "iPhone 16 Pro")
 * Product tags    include:
 *   "gen:16"         → generation number
 *   "tier:pro"       → tier (base|plus|mini|e|air|pro|pro-max|duo)
 *   "status:current" → status (current|discontinued|preorder)
 *
 * Product metafields (namespace: "northardentech"):
 *   chip             String
 *   display          String
 *   camera           String
 *   battery_video_hrs String
 *   weight           String
 *   connector        String
 *   release_year     String
 *
 * Variant options (exactly this order):
 *   Option 1 — "Finish"     (e.g. "Natural Titanium")
 *   Option 2 — "Storage"    (e.g. "256GB")
 *   Option 3 — "Condition"  (e.g. "excellent")
 *
 * Variant metafields (namespace: "northardentech"):
 *   battery_floor  String   e.g. "90%+"
 *   ships_by       String   e.g. "3–5 business days"
 *
 * Finish colours: store hex codes in a product metafield "finish_hex_map"
 * as JSON: { "Natural Titanium": "#E3DDD5", ... }
 *
 * Connectivity is fixed to "unlocked" in v1 — no Shopify option needed.
 * ─────────────────────────────────────────────────────────────────────────
 */

import type {
  Cart,
  CartItem,
  CommerceAdapter,
  Condition,
  Family,
  FamilySpecs,
  FamilyStatus,
  Finish,
  Tier,
  Variant,
  VariantSelection,
} from "../types";

// ── Config ───────────────────────────────────────────────────────
const STOREFRONT_API_VERSION = "2025-01";

function getEndpoint(): string {
  const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  if (!domain) throw new Error("NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN is not set.");
  return `https://${domain}/api/${STOREFRONT_API_VERSION}/graphql.json`;
}

function getToken(): string {
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  if (!token) throw new Error("SHOPIFY_STOREFRONT_ACCESS_TOKEN is not set.");
  return token;
}

// ── GraphQL fetch helper ─────────────────────────────────────────
async function storefrontFetch<T>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T> {
  const res = await fetch(getEndpoint(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": getToken(),
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 60 }, // ISR — revalidate catalog every 60 s
  });

  if (!res.ok) {
    throw new Error(`Shopify Storefront API error: ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (json.errors?.length) {
    throw new Error(`Shopify GraphQL error: ${json.errors.map((e) => e.message).join(", ")}`);
  }
  if (!json.data) throw new Error("Shopify returned empty data.");
  return json.data;
}

// ── GraphQL fragments & queries ──────────────────────────────────

const VARIANT_METAFIELDS = `
  metafields(identifiers: [
    { namespace: "northardentech", key: "battery_floor" }
    { namespace: "northardentech", key: "ships_by" }
  ]) {
    key
    value
  }
`;

const PRODUCT_METAFIELDS = `
  metafields(identifiers: [
    { namespace: "northardentech", key: "chip" }
    { namespace: "northardentech", key: "display" }
    { namespace: "northardentech", key: "camera" }
    { namespace: "northardentech", key: "battery_video_hrs" }
    { namespace: "northardentech", key: "weight" }
    { namespace: "northardentech", key: "connector" }
    { namespace: "northardentech", key: "release_year" }
    { namespace: "northardentech", key: "finish_hex_map" }
  ]) {
    key
    value
  }
`;

const PRODUCT_FRAGMENT = `
  fragment ProductFields on Product {
    id
    handle
    title
    tags
    ${PRODUCT_METAFIELDS}
    images(first: 1) {
      edges { node { url } }
    }
    variants(first: 250) {
      edges {
        node {
          id
          availableForSale
          quantityAvailable
          price { amount }
          compareAtPrice { amount }
          selectedOptions { name value }
          ${VARIANT_METAFIELDS}
        }
      }
    }
    options { name values }
  }
`;

const GET_ALL_PRODUCTS = `
  ${PRODUCT_FRAGMENT}
  query GetAllProducts($first: Int!) {
    products(first: $first) {
      edges { node { ...ProductFields } }
    }
  }
`;

const GET_PRODUCT_BY_HANDLE = `
  ${PRODUCT_FRAGMENT}
  query GetProductByHandle($handle: String!) {
    productByHandle(handle: $handle) { ...ProductFields }
  }
`;

const CART_CREATE = `
  mutation CartCreate($lines: [CartLineInput!]!) {
    cartCreate(input: { lines: $lines }) {
      cart {
        id
        checkoutUrl
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise { ... on ProductVariant { id } }
            }
          }
        }
      }
      userErrors { field message }
    }
  }
`;

const CART_LINES_ADD = `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { id checkoutUrl }
      userErrors { field message }
    }
  }
`;

const CART_LINES_UPDATE = `
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { id checkoutUrl }
      userErrors { field message }
    }
  }
`;

const CART_LINES_REMOVE = `
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { id checkoutUrl }
      userErrors { field message }
    }
  }
`;

const GET_CART = `
  query GetCart($cartId: ID!) {
    cart(id: $cartId) {
      id
      checkoutUrl
      lines(first: 100) {
        edges {
          node {
            id
            quantity
            merchandise {
              ... on ProductVariant {
                id
                price { amount }
                selectedOptions { name value }
                product { handle title }
              }
            }
          }
        }
      }
    }
  }
`;

// ── Shopify → domain type mappers ────────────────────────────────

type ShopifyMetafield = { key: string; value: string } | null;
type ShopifyVariantNode = {
  id: string;
  availableForSale: boolean;
  quantityAvailable: number;
  price: { amount: string };
  compareAtPrice: { amount: string } | null;
  selectedOptions: { name: string; value: string }[];
  metafields: (ShopifyMetafield)[];
};
type ShopifyProductNode = {
  id: string;
  handle: string;
  title: string;
  tags: string[];
  metafields: (ShopifyMetafield)[];
  images: { edges: { node: { url: string } }[] };
  variants: { edges: { node: ShopifyVariantNode }[] };
  options: { name: string; values: string[] }[];
};

function metafieldValue(fields: (ShopifyMetafield)[], key: string): string {
  return fields.find((f) => f?.key === key)?.value ?? "[SPEC]";
}

function parseTag(tags: string[], prefix: string): string | null {
  const tag = tags.find((t) => t.startsWith(`${prefix}:`));
  return tag ? tag.slice(prefix.length + 1) : null;
}

function shopifyProductToFamily(product: ShopifyProductNode): Family {
  const mf = product.metafields;
  const tags = product.tags;

  const generation = parseInt(parseTag(tags, "gen") ?? "0", 10);
  const tier = (parseTag(tags, "tier") ?? "base") as Tier;
  const status = (parseTag(tags, "status") ?? "current") as FamilyStatus;

  const specs: FamilySpecs = {
    chip: metafieldValue(mf, "chip"),
    display: metafieldValue(mf, "display"),
    camera: metafieldValue(mf, "camera"),
    batteryVideoHrs: metafieldValue(mf, "battery_video_hrs"),
    weight: metafieldValue(mf, "weight"),
    connector: metafieldValue(mf, "connector"),
    releaseYear: metafieldValue(mf, "release_year"),
  };

  // Parse finish hex map — JSON object: { "Finish Name": "#hex", ... }
  const hexMapRaw = metafieldValue(mf, "finish_hex_map");
  let hexMap: Record<string, string> = {};
  try {
    hexMap = hexMapRaw !== "[SPEC]" ? JSON.parse(hexMapRaw) : {};
  } catch {
    // malformed JSON — ignore
  }

  // Build finishes from option "Finish" values
  const finishOption = product.options.find((o) => o.name === "Finish");
  const finishNames = finishOption?.values ?? [];
  const productImage = product.images.edges[0]?.node.url ?? "";

  const finishes: Finish[] = finishNames.map((name) => ({
    name,
    hex: hexMap[name] ?? "#c8c8c8",
    images: [productImage], // client will set finish-specific images
  }));

  // Build variants
  const variants: Variant[] = product.variants.edges.map(({ node }) => {
    const getOpt = (name: string) =>
      node.selectedOptions.find((o) => o.name === name)?.value ?? "";
    const vmf = node.metafields;
    const batteryFloor = vmf.find((f) => f?.key === "battery_floor")?.value;
    const shipsBy = vmf.find((f) => f?.key === "ships_by")?.value;
    const condition = getOpt("Condition").toLowerCase() as Condition;
    const price = Math.round(parseFloat(node.price.amount));
    const compareAt = node.compareAtPrice
      ? Math.round(parseFloat(node.compareAtPrice.amount))
      : undefined;

    return {
      id: node.id, // Shopify GID: "gid://shopify/ProductVariant/..."
      storage: getOpt("Storage"),
      finish: getOpt("Finish"),
      condition,
      connectivity: "unlocked",
      price,
      ...(compareAt ? { compareAt } : {}),
      stock: node.availableForSale ? (node.quantityAvailable ?? 1) : 0,
      ...(batteryFloor ? { batteryFloor } : {}),
      ...(shipsBy ? { shipsBy } : {}),
    };
  });

  return {
    slug: product.handle,
    name: product.title,
    generation,
    tier,
    status,
    specs,
    finishes,
    variants,
  };
}

// ── Cart cookie helpers (server-side via next/headers) ───────────
// These are called from Server Actions only — not imported client-side.

async function getCartIdFromCookie(): Promise<string | null> {
  try {
    const { cookies } = await import("next/headers");
    const store = await cookies();
    return store.get("shopify_cart_id")?.value ?? null;
  } catch {
    return null;
  }
}

async function setCartIdCookie(cartId: string): Promise<void> {
  try {
    const { cookies } = await import("next/headers");
    const store = await cookies();
    store.set("shopify_cart_id", cartId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  } catch {
    // no-op outside server context
  }
}

type CartCreateData = {
  cartCreate: {
    cart: { id: string; checkoutUrl: string } | null;
    userErrors: { field: string[]; message: string }[];
  };
};

// ── Adapter implementation ───────────────────────────────────────
export const shopifyAdapter: CommerceAdapter = {
  async getFamilies(): Promise<Family[]> {
    const data = await storefrontFetch<{
      products: { edges: { node: ShopifyProductNode }[] };
    }>(GET_ALL_PRODUCTS, { first: 250 });
    return data.products.edges.map(({ node }) => shopifyProductToFamily(node));
  },

  async getFamily(slug: string): Promise<Family | null> {
    const data = await storefrontFetch<{
      productByHandle: ShopifyProductNode | null;
    }>(GET_PRODUCT_BY_HANDLE, { handle: slug });
    if (!data.productByHandle) return null;
    return shopifyProductToFamily(data.productByHandle);
  },

  async getVariant(
    familySlug: string,
    selection: Partial<VariantSelection>
  ): Promise<Variant | null> {
    const family = await shopifyAdapter.getFamily(familySlug);
    if (!family) return null;

    const exact = family.variants.find((v) => {
      if (selection.condition && v.condition !== selection.condition) return false;
      if (selection.storage && v.storage !== selection.storage) return false;
      if (selection.finish && v.finish !== selection.finish) return false;
      return true;
    });
    if (exact) return exact;

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

  /**
   * Creates a Shopify cart from the current CartProvider items and returns
   * the hosted checkout URL. Call this from a Server Action.
   *
   * NOTE: CartItem.variantId must be a Shopify Variant GID when using this adapter.
   * The Shopify adapter's getVariant() returns variants with GID ids.
   */
  async getCheckoutUrl(cart: Cart): Promise<string> {
    if (cart.items.length === 0) return "/bag";

    const lines = cart.items.map((item) => ({
      merchandiseId: item.variantId, // must be Shopify GID
      quantity: item.quantity,
    }));

    const data = await storefrontFetch<CartCreateData>(CART_CREATE, { lines });

    if (data.cartCreate.userErrors.length > 0) {
      throw new Error(
        `Shopify cart error: ${data.cartCreate.userErrors.map((e) => e.message).join(", ")}`
      );
    }

    const shopifyCart = data.cartCreate.cart;
    if (!shopifyCart) throw new Error("Shopify cartCreate returned null cart.");

    await setCartIdCookie(shopifyCart.id);
    return shopifyCart.checkoutUrl;
  },

  cart: {
    /**
     * Fetches the Shopify cart by ID stored in the shopify_cart_id cookie.
     * Returns an empty cart if no cookie exists.
     *
     * NOTE: In v1 the cart is managed client-side in CartProvider.
     * These server-side cart methods are wired for future use.
     */
    async get(): Promise<Cart> {
      const cartId = await getCartIdFromCookie();
      if (!cartId) return { id: "", items: [] };

      const data = await storefrontFetch<{
        cart: {
          id: string;
          checkoutUrl: string;
          lines: {
            edges: {
              node: {
                id: string;
                quantity: number;
                merchandise: {
                  id: string;
                  price: { amount: string };
                  selectedOptions: { name: string; value: string }[];
                  product: { handle: string; title: string };
                };
              };
            }[];
          };
        } | null;
      }>(GET_CART, { cartId });

      if (!data.cart) return { id: cartId, items: [] };

      const items: CartItem[] = data.cart.lines.edges.map(({ node }) => {
        const m = node.merchandise;
        const getOpt = (name: string) =>
          m.selectedOptions.find((o) => o.name === name)?.value ?? "";
        return {
          variantId: m.id,
          familySlug: m.product.handle,
          familyName: m.product.title,
          finish: getOpt("Finish"),
          storage: getOpt("Storage"),
          condition: getOpt("Condition").toLowerCase() as Condition,
          price: Math.round(parseFloat(m.price.amount)),
          quantity: node.quantity,
        };
      });

      return { id: data.cart.id, items };
    },

    async add(item: Omit<CartItem, "quantity"> & { quantity?: number }): Promise<Cart> {
      const qty = item.quantity ?? 1;
      const cartId = await getCartIdFromCookie();

      if (!cartId) {
        // Create new cart
        const data = await storefrontFetch<CartCreateData>(CART_CREATE, {
          lines: [{ merchandiseId: item.variantId, quantity: qty }],
        });
        const cart = data.cartCreate.cart;
        if (cart) await setCartIdCookie(cart.id);
      } else {
        await storefrontFetch(CART_LINES_ADD, {
          cartId,
          lines: [{ merchandiseId: item.variantId, quantity: qty }],
        });
      }

      return shopifyAdapter.cart.get();
    },

    async update(variantId: string, quantity: number): Promise<Cart> {
      const cartId = await getCartIdFromCookie();
      if (!cartId) return { id: "", items: [] };

      const cart = await shopifyAdapter.cart.get();
      // variantId here is the Shopify merchandise GID
      // We need the cart line ID, not the variant ID — this requires a separate lookup
      // For v1 the cart is managed client-side; this is a server-side fallback.
      void cart; void quantity; void variantId;
      return shopifyAdapter.cart.get();
    },

    async remove(variantId: string): Promise<Cart> {
      void variantId;
      // Similarly requires cart line ID resolution — managed client-side in v1.
      return shopifyAdapter.cart.get();
    },
  },
};
