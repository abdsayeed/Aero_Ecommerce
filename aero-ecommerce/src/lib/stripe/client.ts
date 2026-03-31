import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY ?? "";

export const stripe = new Stripe(key || "sk_test_placeholder", {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});
