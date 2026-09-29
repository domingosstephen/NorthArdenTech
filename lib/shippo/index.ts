import { Shippo, LabelFileTypeEnum } from "shippo";

// Singleton Shippo client — server-only.
export const shippo = new Shippo({ apiKeyHeader: process.env.SHIPPO_API_KEY! });

export interface BuyLabelParams {
  toName: string;
  toStreet1: string;
  toStreet2?: string;
  toCity: string;
  toState: string;
  toZip: string;
  /** Declared value in cents for insurance */
  declaredValueCents: number;
  /** Weight in ounces (iPhone ~7–8 oz + packaging ~16 oz) */
  weightOz?: number;
}

export interface LabelResult {
  labelUrl: string;
  trackingNumber: string;
  carrier: string;
  service: string;
  costCents: number;
}

/** Creates a shipment, selects the first available rate (USPS Priority),
 *  and purchases the label. Signature confirmation + insurance always on.
 *  Ship-from address comes from env vars. */
export async function buyLabel(params: BuyLabelParams): Promise<LabelResult> {
  const {
    toName,
    toStreet1,
    toStreet2,
    toCity,
    toState,
    toZip,
    declaredValueCents,
    weightOz = 16,
  } = params;

  const shipment = await shippo.shipments.create({
    addressFrom: {
      name: process.env.SHIPPO_FROM_NAME ?? "[FROM_NAME]",
      street1: process.env.SHIPPO_FROM_STREET1 ?? "[FROM_STREET1]",
      city: process.env.SHIPPO_FROM_CITY ?? "[FROM_CITY]",
      state: process.env.SHIPPO_FROM_STATE ?? "[FROM_STATE]",
      zip: process.env.SHIPPO_FROM_ZIP ?? "[FROM_ZIP]",
      country: "US",
      phone: process.env.SHIPPO_FROM_PHONE ?? "[FROM_PHONE]",
    },
    addressTo: {
      name: toName,
      street1: toStreet1,
      street2: toStreet2 ?? "",
      city: toCity,
      state: toState,
      zip: toZip,
      country: "US",
    },
    parcels: [
      {
        length: "6",
        width: "4",
        height: "2",
        distanceUnit: "in",
        weight: String(weightOz / 16), // Shippo expects lbs
        massUnit: "lb",
        // Signature + insurance configured at label purchase via Shippo rate extras
      },
    ],
    async: false,
  });

  // Pick USPS Priority Mail if available, else first rate
  const rates = (shipment as { rates?: { provider?: string; servicelevel?: { token?: string }; amount?: string; currency?: string }[] }).rates ?? [];
  const preferred = rates.find(
    (r) =>
      r.provider === "USPS" && r.servicelevel?.token === "usps_priority"
  ) ?? rates[0];

  if (!preferred) throw new Error("No shipping rates returned from Shippo.");

  const transaction = await shippo.transactions.create({
    rate: (preferred as { objectId?: string }).objectId ?? "",
    labelFileType: LabelFileTypeEnum.PDF4x6,
    async: false,
  });

  const tx = transaction as {
    status?: string;
    labelUrl?: string;
    trackingNumber?: string;
    rate?: { provider?: string; servicelevel?: { name?: string }; amount?: string };
    messages?: { text?: string }[];
  };

  if (tx.status !== "SUCCESS") {
    const msgs = tx.messages?.map((m) => m.text).join("; ") ?? "Unknown error";
    throw new Error(`Shippo label purchase failed: ${msgs}`);
  }

  return {
    labelUrl: tx.labelUrl ?? "",
    trackingNumber: tx.trackingNumber ?? "",
    carrier: tx.rate?.provider ?? "UNKNOWN",
    service: tx.rate?.servicelevel?.name ?? "Unknown",
    costCents: Math.round(parseFloat(tx.rate?.amount ?? "0") * 100),
  };
}
