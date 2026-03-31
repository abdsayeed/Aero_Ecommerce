import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { createOrder } from "@/lib/actions/orders";
import type Stripe from "stripe";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    console.error("[stripe webhook] Missing stripe-signature header");
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET);
  } catch (err) {
    console.error("[stripe webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`[stripe webhook] checkout.session.completed: ${session.id}`);

        const orderId = await createOrder(session);

        // Fire-and-forget order confirmation email — do not block webhook response
        if (orderId && session.customer_details?.email) {
          const email = session.customer_details.email;
          const name = session.customer_details.name ?? undefined;

          import("@/lib/actions/orders")
            .then(({ getOrder }) => getOrder(orderId))
            .then(async (orderDetail) => {
              if (!orderDetail) return;
              // Build a minimal OrderFull for the email template
              const { sendOrderConfirmation } = await import("@/lib/email");
              const { getMyOrder } = await import("@/lib/actions/account");
              // getMyOrder requires auth — use getOrder for webhook context
              // Build a compatible shape from orderDetail
              const orderFull = {
                id: orderDetail.id,
                status: orderDetail.status,
                totalAmount: orderDetail.totalAmount,
                createdAt: orderDetail.createdAt,
                couponCode: null,
                stripeTransactionId: orderDetail.stripeSessionId
                  ? `...${orderDetail.stripeSessionId.slice(-8)}`
                  : null,
                shippingAddress: null,
                items: orderDetail.items.map((i) => ({
                  id: i.id,
                  productName: "Item",
                  colorName: "",
                  sizeName: "",
                  quantity: i.quantity,
                  priceAtPurchase: i.priceAtPurchase,
                  image: null,
                })),
              };
              await sendOrderConfirmation(email, orderFull, name);
            })
            .catch((e) => {
              console.error(`[stripe webhook] Email send failed for order ${orderId}:`, e);
            });
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const intent = event.data.object as Stripe.PaymentIntent;
        console.error(
          `[stripe webhook] payment_intent.payment_failed: ${intent.id} — ${intent.last_payment_error?.message ?? "unknown error"}`
        );
        break;
      }

      default:
        break;
    }
  } catch (e) {
    console.error(`[stripe webhook] Handler error for event ${event.type} (${event.id}):`, e);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
