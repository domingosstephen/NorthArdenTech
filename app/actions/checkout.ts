"use server";

import { commerce } from "@/lib/commerce";
import type { CartItem } from "@/lib/commerce/types";

/**
 * Creates a Shopify cart from the client-side cart items and returns the
 * hosted checkout URL. With the mock adapter it returns "/bag".
 *
 * Called from BagClient via useTransition — runs server-side so the
 * Storefront access token never reaches the browser.
 */
export async function createCheckoutUrl(items: CartItem[]): Promise<string> {
  const cart = { id: "checkout-request", items };
  return commerce.getCheckoutUrl(cart);
}
