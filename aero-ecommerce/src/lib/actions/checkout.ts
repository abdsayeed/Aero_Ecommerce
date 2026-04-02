"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { checkRateLimit } from "@/lib/utils/rateLimit";
import { initiateCheckoutSchema } from "@/lib/validations/checkout";
import { CheckoutService } from "@/lib/services/checkout.service";
import { getCart } from "@/lib/actions/cart";

export async function createStripeCheckoutSession(couponCode?: string): Promise<
  { url: string } | { error: string }
> {
  // Rate limit by session/IP
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") ?? "unknown";
  const rateCheck = await checkRateLimit(`checkout:${ip}`, { maxRequests: 10, windowMs: 60_000 });
  if (!rateCheck.allowed) {
    return { error: `Too many requests. Try again in ${rateCheck.retryAfterSeconds}s.` };
  }

  const cartResult = await getCart();
  if (!cartResult || cartResult.items.length === 0) {
    return { error: "Your cart is empty." };
  }

  // Validate input
  const parsed = initiateCheckoutSchema.safeParse({ cartId: cartResult.cartId, couponCode });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  let userEmail: string | undefined;
  let userId: string | undefined;
  try {
    const session = await auth.api.getSession({ headers: headersList });
    userEmail = session?.user?.email ?? undefined;
    userId = session?.user?.id ?? undefined;
  } catch {
    // guest — continue
  }

  const result = await CheckoutService.initiateCheckout(
    parsed.data.cartId,
    userId,
    userEmail,
    parsed.data.couponCode
  );

  if (result.error) {
    if (result.error === "STRIPE_NOT_CONFIGURED") {
      return { error: "Payment is not configured yet. Please add your Stripe API key to .env.local." };
    }
    if (result.error.startsWith("INSUFFICIENT_STOCK:")) {
      const sku = result.error.split(":")[1];
      return { error: `Insufficient stock for item: ${sku}` };
    }
    return { error: result.error };
  }

  return { url: result.data!.url };
}
