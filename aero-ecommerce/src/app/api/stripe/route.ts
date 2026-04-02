import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { logger } from "@/lib/logger";
import { OrderService } from "@/lib/services/order.service";
import { StockReservationRepository } from "@/lib/repositories/stockReservation.repository";
import { db } from "@/lib/db";
import { eq, sql } from "drizzle-orm";
import { productVariants } from "@/lib/db/schema/products";
import type Stripe from "stripe";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    logger.error("[stripe webhook] Missing stripe-signature header");
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET);
  } catch (err) {
    logger.error({ err }, "[stripe webhook] Signature verification failed");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logger.info({ eventId: event.id, sessionId: session.id }, "checkout.session.completed");

        const result = await OrderService.createFromStripeSession(session);
        if (result.error) {
          logger.error({ error: result.error, sessionId: session.id }, "Order creation failed");
        } else {
          logger.info({ orderId: result.data, sessionId: session.id }, "Order created successfully");
        }
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        logger.info({ eventId: event.id, sessionId: session.id }, "checkout.session.expired — restoring stock");

        if (db) {
          const reservations = await StockReservationRepository.findBySessionId(session.id);

          for (const reservation of reservations) {
            await db
              .update(productVariants)
              .set({ inStock: sql`${productVariants.inStock} + ${reservation.quantity}` })
              .where(eq(productVariants.id, reservation.productVariantId));
          }

          await StockReservationRepository.deleteBySessionId(session.id);
          logger.info(
            { sessionId: session.id, restoredCount: reservations.length },
            "Stock restored after session expiry"
          );
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const intent = event.data.object as Stripe.PaymentIntent;
        logger.error(
          { intentId: intent.id, reason: intent.last_payment_error?.message },
          "payment_intent.payment_failed"
        );
        break;
      }

      default:
        break;
    }
  } catch (e) {
    logger.error({ err: e, eventType: event.type, eventId: event.id }, "Webhook handler error");
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
