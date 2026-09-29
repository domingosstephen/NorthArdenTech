import Stripe from "stripe";

// Singleton Stripe server client — never import in client bundles.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-08-26.dahlia",
  typescript: true,
});
