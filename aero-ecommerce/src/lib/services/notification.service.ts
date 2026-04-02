import { logger } from "@/lib/logger";
import { enqueueJob } from "@/lib/jobs";
import { sendOrderConfirmation as sendOrderConfirmationEmail } from "@/lib/email";
import type { OrderFull } from "@/lib/actions/account";

export const NotificationService = {
  async sendOrderConfirmation(to: string, order: OrderFull, customerName?: string) {
    try {
      await sendOrderConfirmationEmail(to, order, customerName);
    } catch (e) {
      logger.error({ err: e, orderId: order.id }, "sendOrderConfirmation failed — enqueuing retry");
      await enqueueJob("send-order-confirmation", { orderId: order.id, to, customerName });
    }
  },

  async sendShippingNotification(to: string, orderId: string) {
    try {
      const { Resend } = await import("resend");
      if (!process.env.RESEND_API_KEY) {
        logger.warn({ orderId }, "RESEND_API_KEY not set — skipping shipping notification");
        return;
      }
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "Aero Store <orders@aerostore.com>",
        to,
        subject: `Your order #${orderId.slice(0, 8).toUpperCase()} has shipped`,
        html: `<p>Great news! Your order has been shipped and is on its way.</p>`,
      });
    } catch (e) {
      logger.error({ err: e, orderId }, "sendShippingNotification failed");
    }
  },

  async sendLowStockAlert(variantId: string, sku: string, inStock: number) {
    try {
      await enqueueJob("send-low-stock-alert", {
        variantId,
        productName: sku,
        sku,
        inStock,
        threshold: 5,
      });
    } catch (e) {
      logger.error({ err: e, variantId }, "sendLowStockAlert failed");
    }
  },
};

// ─── Job handler helpers (called by BullMQ worker) ────────────────────────────

export async function sendOrderConfirmationById(
  orderId: string,
  to: string,
  customerName?: string
): Promise<void> {
  if (!to) {
    logger.warn({ orderId }, "sendOrderConfirmationById: no email address — skipping");
    return;
  }
  try {
    const { Resend } = await import("resend");
    if (!process.env.RESEND_API_KEY) {
      logger.warn({ orderId }, "RESEND_API_KEY not set — skipping order confirmation");
      return;
    }
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "Aero Store <orders@aerostore.com>",
      to,
      subject: `Order Confirmed — #${orderId.slice(0, 8).toUpperCase()}`,
      html: `<p>Thank you${customerName ? `, ${customerName}` : ""}! Your order <strong>#${orderId.slice(0, 8).toUpperCase()}</strong> has been confirmed.</p>`,
    });
  } catch (e) {
    logger.error({ err: e, orderId }, "sendOrderConfirmationById failed");
    throw e; // re-throw so BullMQ can retry
  }
}

export async function sendLowStockAlertById(data: {
  variantId: string;
  productName: string;
  sku: string;
  inStock: number;
  threshold: number;
}): Promise<void> {
  logger.warn(data, "Low stock alert");
  // In a real app, email the admin team here
}
