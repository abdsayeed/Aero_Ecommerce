"use server";

import { stripe } from "@/lib/stripe/client";
import { getCart } from "@/lib/actions/cart";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const BASE_URL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

export async function createStripeCheckoutSession(couponCode?: string): Promise<
  { url: string } | { error: string }
> {
  try {
    const cartResult = await getCart();

    if (!cartResult || cartResult.items.length === 0) {
      return { error: "Your cart is empty." };
    }

    let userEmail: string | undefined;
    let userId: string | undefined;
    try {
      const session = await auth.api.getSession({ headers: await headers() });
      userEmail = session?.user?.email ?? undefined;
      userId = session?.user?.id ?? undefined;
    } catch {
      // guest — continue
    }

    const lineItems: import("stripe").Stripe.Checkout.SessionCreateParams.LineItem[] =
      cartResult.items.map((item) => {
        const unitPrice = parseFloat(item.salePrice ?? item.price);
        return {
          price_data: {
            currency: "usd",
            unit_amount: Math.round(unitPrice * 100),
            product_data: {
              name: item.productName,
              description: `${item.colorName} · Size ${item.sizeName}`,
              ...(item.image ? { images: [item.image] } : {}),
            },
          },
          quantity: item.quantity,
        };
      });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      shipping_address_collection: { allowed_countries: ["US", "GB", "CA", "AU", "AE"] },
      billing_address_collection: "required",
      ...(userEmail ? { customer_email: userEmail } : {}),
      metadata: {
        cartId: cartResult.cartId,
        ...(userId ? { userId } : {}),
        ...(couponCode ? { couponCode } : {}),
      },
      success_url: `${BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/cart`,
    });

    if (!session.url) return { error: "Failed to create checkout session." };
    return { url: session.url };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Something went wrong.";
    console.error("[checkout] createStripeCheckoutSession error:", msg);
    // Surface Stripe auth errors clearly
    if (msg.includes("No API key") || msg.includes("Invalid API Key") || msg.includes("placeholder")) {
      return { error: "Payment is not configured yet. Please add your Stripe API key to .env.local." };
    }
    return { error: msg };
  }
}
