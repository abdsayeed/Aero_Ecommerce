import { Resend } from "resend";
import { render } from "@react-email/render";
import OrderConfirmation from "./templates/OrderConfirmation";
import type { OrderFull } from "@/lib/actions/account";

const resend = new Resend(process.env.RESEND_API_KEY ?? "");

export async function sendOrderConfirmation(
  to: string,
  order: OrderFull,
  customerName?: string
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not set — skipping order confirmation email");
    return;
  }

  try {
    const html = await render(OrderConfirmation({ order, customerName }));
    await resend.emails.send({
      from: "Aero Store <orders@aerostore.com>",
      to,
      subject: `Order Confirmed — #${order.id.slice(0, 8).toUpperCase()}`,
      html,
    });
    console.log(`[email] Order confirmation sent to ${to} for order ${order.id}`);
  } catch (e) {
    // Fire-and-forget — log but don't throw so webhook isn't blocked
    console.error("[email] sendOrderConfirmation failed:", e);
  }
}
