import {
  Html, Head, Body, Container, Section, Text, Hr, Row, Column, Heading,
} from "@react-email/components";
import type { OrderFull } from "@/lib/actions/account";

interface OrderConfirmationProps {
  order: OrderFull;
  customerName?: string;
}

export default function OrderConfirmation({ order, customerName }: OrderConfirmationProps) {
  const greeting = customerName ? `Hi ${customerName},` : "Hi there,";

  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#f5f5f5", fontFamily: "Jost, sans-serif" }}>
        <Container style={{ maxWidth: 600, margin: "0 auto", backgroundColor: "#ffffff", padding: 32 }}>
          <Heading style={{ fontSize: 24, fontWeight: 700, color: "#111111", marginBottom: 8 }}>
            Order Confirmed
          </Heading>
          <Text style={{ color: "#757575", marginBottom: 24 }}>
            {greeting} Your Aero order has been confirmed and is being prepared.
          </Text>

          <Section style={{ backgroundColor: "#f5f5f5", padding: 16, marginBottom: 24 }}>
            <Row>
              <Column><Text style={{ color: "#757575", fontSize: 12 }}>Order ID</Text></Column>
              <Column><Text style={{ color: "#111111", fontSize: 12, fontWeight: 600 }}>{order.id.slice(0, 8).toUpperCase()}</Text></Column>
            </Row>
            <Row>
              <Column><Text style={{ color: "#757575", fontSize: 12 }}>Status</Text></Column>
              <Column><Text style={{ color: "#007d48", fontSize: 12, fontWeight: 600, textTransform: "capitalize" }}>{order.status}</Text></Column>
            </Row>
            {order.stripeTransactionId && (
              <Row>
                <Column><Text style={{ color: "#757575", fontSize: 12 }}>Payment Ref</Text></Column>
                <Column><Text style={{ color: "#111111", fontSize: 12 }}>{order.stripeTransactionId}</Text></Column>
              </Row>
            )}
          </Section>

          <Heading as="h2" style={{ fontSize: 16, fontWeight: 600, color: "#111111", marginBottom: 12 }}>
            Items Ordered
          </Heading>

          {order.items.map((item) => (
            <Row key={item.id} style={{ marginBottom: 12, borderBottom: "1px solid #e5e5e5", paddingBottom: 12 }}>
              <Column style={{ width: "60%" }}>
                <Text style={{ color: "#111111", fontSize: 14, fontWeight: 500, margin: 0 }}>{item.productName}</Text>
                <Text style={{ color: "#757575", fontSize: 12, margin: 0 }}>{item.colorName} · Size {item.sizeName}</Text>
                <Text style={{ color: "#757575", fontSize: 12, margin: 0 }}>Qty: {item.quantity}</Text>
              </Column>
              <Column style={{ textAlign: "right" }}>
                <Text style={{ color: "#111111", fontSize: 14, fontWeight: 500 }}>
                  ${(parseFloat(item.priceAtPurchase) * item.quantity).toFixed(2)}
                </Text>
              </Column>
            </Row>
          ))}

          <Hr style={{ borderColor: "#e5e5e5", margin: "16px 0" }} />

          <Row>
            <Column><Text style={{ color: "#111111", fontSize: 16, fontWeight: 700 }}>Total</Text></Column>
            <Column style={{ textAlign: "right" }}>
              <Text style={{ color: "#111111", fontSize: 16, fontWeight: 700 }}>${order.totalAmount}</Text>
            </Column>
          </Row>

          {order.shippingAddress && (
            <>
              <Hr style={{ borderColor: "#e5e5e5", margin: "16px 0" }} />
              <Heading as="h2" style={{ fontSize: 16, fontWeight: 600, color: "#111111", marginBottom: 8 }}>
                Shipping To
              </Heading>
              <Text style={{ color: "#757575", fontSize: 14, lineHeight: 1.6 }}>
                {order.shippingAddress.line1}<br />
                {order.shippingAddress.line2 && <>{order.shippingAddress.line2}<br /></>}
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
                {order.shippingAddress.country}
              </Text>
            </>
          )}

          <Hr style={{ borderColor: "#e5e5e5", margin: "24px 0" }} />
          <Text style={{ color: "#aaaaaa", fontSize: 12, textAlign: "center" }}>
            Estimated delivery: 3–5 business days · Free returns within 30 days
          </Text>
          <Text style={{ color: "#aaaaaa", fontSize: 12, textAlign: "center" }}>
            © {new Date().getFullYear()} Aero Store, London, UK
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
