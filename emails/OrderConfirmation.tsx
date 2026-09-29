import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Hr,
  Section,
  Row,
  Column,
  Link,
} from "@react-email/components";

interface OrderItem {
  familyName: string;
  finish: string;
  storageGb: number;
  condition: string;
  batteryFloor?: number | null;
  priceCents: number;
  qty: number;
}

interface Address {
  name?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
}

interface Props {
  orderNumber: string;
  email: string;
  items: OrderItem[];
  subtotalCents: number;
  taxCents: number;
  shippingCents: number;
  totalCents: number;
  shippingAddress: Address;
  shipsBy?: string;
}

const fmt = (cents: number) =>
  (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });

export default function OrderConfirmation({
  orderNumber,
  email,
  items,
  subtotalCents,
  taxCents,
  shippingCents,
  totalCents,
  shippingAddress,
  shipsBy,
}: Props) {
  return (
    <Html lang="en">
      <Head />
      <Body style={{ backgroundColor: "#FFFFFF", fontFamily: "Inter, system-ui, sans-serif" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "40px 24px" }}>
          {/* Header */}
          <Heading
            style={{
              fontSize: "24px",
              fontWeight: "600",
              color: "#121214",
              letterSpacing: "-0.02em",
              marginBottom: "8px",
            }}
          >
            NorthArdenTech
          </Heading>

          <Hr style={{ borderColor: "#E2E3E8", margin: "24px 0" }} />

          {/* Confirmation */}
          <Heading
            as="h2"
            style={{ fontSize: "20px", fontWeight: "600", color: "#121214", marginBottom: "4px" }}
          >
            Thank you. Your order is in.
          </Heading>
          <Text style={{ color: "#62626B", fontSize: "15px", margin: "0 0 4px" }}>
            Order {orderNumber}. A confirmation is on its way to {email}.
          </Text>
          {shipsBy && (
            <Text style={{ color: "#62626B", fontSize: "15px", margin: "0" }}>
              Ships {shipsBy}. We&#39;ll email tracking as soon as it leaves.
            </Text>
          )}

          <Hr style={{ borderColor: "#E2E3E8", margin: "24px 0" }} />

          {/* Items */}
          <Heading
            as="h3"
            style={{ fontSize: "16px", fontWeight: "600", color: "#121214", marginBottom: "16px" }}
          >
            Order summary
          </Heading>

          {items.map((item, i) => (
            <Section key={i} style={{ marginBottom: "16px" }}>
              <Row>
                <Column style={{ flex: 1 }}>
                  <Text style={{ fontSize: "15px", fontWeight: "600", color: "#121214", margin: "0 0 2px" }}>
                    {item.familyName}
                  </Text>
                  <Text style={{ fontSize: "13px", color: "#62626B", margin: "0" }}>
                    {item.finish} · {item.storageGb} GB ·{" "}
                    {item.condition.charAt(0).toUpperCase() + item.condition.slice(1)}
                    {item.batteryFloor ? ` · Battery ${item.batteryFloor}%+` : ""}
                  </Text>
                </Column>
                <Column style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                  <Text style={{ fontSize: "15px", fontWeight: "600", color: "#121214", margin: "0" }}>
                    {fmt(item.priceCents * item.qty)}
                  </Text>
                  {item.qty > 1 && (
                    <Text style={{ fontSize: "12px", color: "#62626B", margin: "0" }}>
                      Qty: {item.qty}
                    </Text>
                  )}
                </Column>
              </Row>
            </Section>
          ))}

          <Hr style={{ borderColor: "#E2E3E8", margin: "16px 0" }} />

          {/* Totals */}
          <Section>
            {[
              ["Subtotal", fmt(subtotalCents)],
              ["Shipping", shippingCents === 0 ? "Free" : fmt(shippingCents)],
              ["Tax", fmt(taxCents)],
            ].map(([label, value]) => (
              <Row key={label} style={{ marginBottom: "6px" }}>
                <Column>
                  <Text style={{ fontSize: "14px", color: "#62626B", margin: 0 }}>{label}</Text>
                </Column>
                <Column style={{ textAlign: "right" }}>
                  <Text style={{ fontSize: "14px", color: "#62626B", margin: 0 }}>{value}</Text>
                </Column>
              </Row>
            ))}
            <Row>
              <Column>
                <Text style={{ fontSize: "16px", fontWeight: "600", color: "#121214", margin: "8px 0 0" }}>
                  Total
                </Text>
              </Column>
              <Column style={{ textAlign: "right" }}>
                <Text style={{ fontSize: "16px", fontWeight: "600", color: "#121214", margin: "8px 0 0" }}>
                  {fmt(totalCents)}
                </Text>
              </Column>
            </Row>
          </Section>

          <Hr style={{ borderColor: "#E2E3E8", margin: "24px 0" }} />

          {/* Shipping address */}
          <Heading
            as="h3"
            style={{ fontSize: "16px", fontWeight: "600", color: "#121214", marginBottom: "8px" }}
          >
            Shipping to
          </Heading>
          <Text style={{ fontSize: "14px", color: "#62626B", margin: "0", lineHeight: "1.6" }}>
            {shippingAddress.name && <>{shippingAddress.name}<br /></>}
            {shippingAddress.line1}<br />
            {shippingAddress.line2 && <>{shippingAddress.line2}<br /></>}
            {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zip}
          </Text>

          <Hr style={{ borderColor: "#E2E3E8", margin: "24px 0" }} />

          {/* Footer */}
          <Text style={{ fontSize: "13px", color: "#62626B", lineHeight: "1.6" }}>
            Questions? Visit{" "}
            <Link href="[SUPPORT_URL]" style={{ color: "#0B5FD9" }}>
              our support page
            </Link>{" "}
            or reply to this email.
          </Text>
          <Text style={{ fontSize: "11px", color: "#62626B", marginTop: "16px" }}>
            iPhone is a trademark of Apple Inc., registered in the U.S. and other countries.
            NorthArdenTech is not affiliated with or endorsed by Apple Inc.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

OrderConfirmation.PreviewProps = {
  orderNumber: "NAT-10421",
  email: "customer@example.com",
  items: [
    {
      familyName: "iPhone 15 Pro",
      finish: "Natural Titanium",
      storageGb: 256,
      condition: "excellent",
      batteryFloor: 90,
      priceCents: 69900,
      qty: 1,
    },
  ],
  subtotalCents: 69900,
  taxCents: 5951,
  shippingCents: 0,
  totalCents: 75851,
  shippingAddress: {
    name: "Jane Smith",
    line1: "123 Main St",
    city: "Austin",
    state: "TX",
    zip: "78701",
  },
  shipsBy: "[DATE RANGE]",
} satisfies Props;
