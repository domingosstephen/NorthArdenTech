import { Resend } from "resend";
import { render } from "@react-email/components";
import OrderConfirmation from "@/emails/OrderConfirmation";
import type { InferSelectModel } from "drizzle-orm";
import type { orders, orderItems } from "@/lib/db/schema";

type Order = InferSelectModel<typeof orders>;
type OrderItem = InferSelectModel<typeof orderItems>;

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderConfirmation(
  order: Order,
  items?: OrderItem[]
) {
  const address = order.shippingAddress as Record<string, string> | null ?? {};

  const html = await render(
    OrderConfirmation({
      orderNumber: order.number,
      email: order.email,
      items: (items ?? []).map((i) => ({
        familyName: i.familyName,
        finish: i.finish,
        storageGb: i.storageGb,
        condition: i.condition,
        batteryFloor: i.batteryFloor,
        priceCents: i.priceCents,
        qty: i.qty,
      })),
      subtotalCents: order.subtotalCents,
      taxCents: order.taxCents,
      shippingCents: order.shippingCents,
      totalCents: order.totalCents,
      shippingAddress: {
        name: address.name ?? "",
        line1: address.line1 ?? "",
        line2: address.line2 ?? "",
        city: address.city ?? "",
        state: address.state ?? "",
        zip: address.zip ?? "",
      },
    })
  );

  await resend.emails.send({
    from: "[FROM_EMAIL]", // e.g. "NorthArdenTech <orders@northardentech.com>"
    to: order.email,
    subject: `Your NorthArdenTech order ${order.number}`,
    html,
  });
}

export async function sendOrderShipped(
  order: Order,
  tracking: {
    carrier: string;
    trackingNumber: string;
    trackingUrl: string;
    estimatedDelivery?: string;
  }
) {
  const { render: _render } = await import("@react-email/components");
  const OrderShipped = (await import("@/emails/OrderShipped")).default;

  const html = await _render(
    OrderShipped({
      orderNumber: order.number,
      email: order.email,
      ...tracking,
    })
  );

  await resend.emails.send({
    from: "[FROM_EMAIL]",
    to: order.email,
    subject: "Your iPhone is on its way",
    html,
  });
}
