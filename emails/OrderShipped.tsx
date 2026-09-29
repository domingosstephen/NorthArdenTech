import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Hr,
  Link,
  Button,
} from "@react-email/components";

interface Props {
  orderNumber: string;
  email: string;
  carrier: string;
  trackingNumber: string;
  trackingUrl: string;
  estimatedDelivery?: string;
}

export default function OrderShipped({
  orderNumber,
  carrier,
  trackingNumber,
  trackingUrl,
  estimatedDelivery,
}: Props) {
  return (
    <Html lang="en">
      <Head />
      <Body style={{ backgroundColor: "#FFFFFF", fontFamily: "Inter, system-ui, sans-serif" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "40px 24px" }}>
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

          <Heading
            as="h2"
            style={{ fontSize: "20px", fontWeight: "600", color: "#121214", marginBottom: "4px" }}
          >
            Your iPhone is on its way.
          </Heading>
          <Text style={{ color: "#62626B", fontSize: "15px", margin: "0 0 16px" }}>
            Order {orderNumber} has shipped.
            {estimatedDelivery ? ` Estimated delivery: ${estimatedDelivery}.` : ""}
          </Text>

          <Text style={{ fontSize: "14px", color: "#62626B", margin: "0 0 4px" }}>
            <strong style={{ color: "#121214" }}>Carrier:</strong> {carrier}
          </Text>
          <Text style={{ fontSize: "14px", color: "#62626B", margin: "0 0 20px" }}>
            <strong style={{ color: "#121214" }}>Tracking:</strong> {trackingNumber}
          </Text>

          <Button
            href={trackingUrl}
            style={{
              backgroundColor: "#0B5FD9",
              color: "#FFFFFF",
              borderRadius: "980px",
              padding: "14px 28px",
              fontSize: "15px",
              fontWeight: "600",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Track your order
          </Button>

          <Hr style={{ borderColor: "#E2E3E8", margin: "32px 0 24px" }} />

          <Text style={{ fontSize: "13px", color: "#62626B", lineHeight: "1.6" }}>
            A signature is required on delivery. If you have questions, visit{" "}
            <Link href="[SUPPORT_URL]" style={{ color: "#0B5FD9" }}>
              our support page
            </Link>.
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

OrderShipped.PreviewProps = {
  orderNumber: "NAT-10421",
  email: "customer@example.com",
  carrier: "UPS",
  trackingNumber: "1Z999AA10123456784",
  trackingUrl: "https://www.ups.com/track?tracknum=1Z999AA10123456784",
  estimatedDelivery: "[DATE]",
} satisfies Props;
