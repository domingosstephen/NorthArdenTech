import {
  pgTable,
  text,
  integer,
  boolean,
  jsonb,
  timestamp,
  pgEnum,
  uuid,
  varchar,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ── Enums ─────────────────────────────────────────────────────────────────────

export const familyStatusEnum = pgEnum("family_status", [
  "current",
  "discontinued",
  "preorder",
]);

export const conditionEnum = pgEnum("condition", [
  "new",
  "premium",
  "excellent",
  "good",
  "fair",
]);

export const connectivityEnum = pgEnum("connectivity", ["unlocked", "carrier"]);

export const unitStatusEnum = pgEnum("unit_status", [
  "available",
  "reserved",
  "sold",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending_payment",
  "paid",
  "fulfilled",
  "shipped",
  "delivered",
  "refunded",
  "partially_refunded",
  "canceled",
]);

export const staffRoleEnum = pgEnum("staff_role", ["owner", "ops"]);

// ── Catalog ───────────────────────────────────────────────────────────────────

export const families = pgTable("families", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 120 }).notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  generation: integer("generation").notNull(),
  tier: varchar("tier", { length: 32 }).notNull(),
  status: familyStatusEnum("status").notNull().default("current"),
  /** jsonb: { chip, display, camera, battery_video_hrs, weight, connector, release_year } */
  specs: jsonb("specs").notNull().default({}),
  sort: integer("sort").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [uniqueIndex("families_slug_idx").on(t.slug)]);

export const finishes = pgTable("finishes", {
  id: uuid("id").defaultRandom().primaryKey(),
  familyId: uuid("family_id").notNull().references(() => families.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 80 }).notNull(),
  swatchHex: varchar("swatch_hex", { length: 7 }).notNull(),
  /** jsonb: string[] of image URLs (square, 1:1) */
  images: jsonb("images").notNull().default([]),
}, (t) => [index("finishes_family_idx").on(t.familyId)]);

export const variants = pgTable("variants", {
  id: uuid("id").defaultRandom().primaryKey(),
  familyId: uuid("family_id").notNull().references(() => families.id, { onDelete: "cascade" }),
  finishId: uuid("finish_id").notNull().references(() => finishes.id, { onDelete: "cascade" }),
  storageGb: integer("storage_gb").notNull(),
  condition: conditionEnum("condition").notNull(),
  connectivity: connectivityEnum("connectivity").notNull().default("unlocked"),
  priceCents: integer("price_cents").notNull(),
  compareAtCents: integer("compare_at_cents"),
  sku: varchar("sku", { length: 80 }).notNull(),
  active: boolean("active").notNull().default(true),
  /** Only for pre-owned — minimum battery % for this condition/family combo */
  batteryFloor: integer("battery_floor"),
  shipsBy: varchar("ships_by", { length: 40 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("variants_family_idx").on(t.familyId),
  uniqueIndex("variants_sku_idx").on(t.sku),
]);

// ── Inventory ─────────────────────────────────────────────────────────────────

export const inventory = pgTable("inventory", {
  id: uuid("id").defaultRandom().primaryKey(),
  variantId: uuid("variant_id").notNull().references(() => variants.id, { onDelete: "cascade" }),
  onHand: integer("on_hand").notNull().default(0),
  reserved: integer("reserved").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [uniqueIndex("inventory_variant_idx").on(t.variantId)]);

/** Per-unit tracking for pre-owned devices only. */
export const units = pgTable("units", {
  id: uuid("id").defaultRandom().primaryKey(),
  variantId: uuid("variant_id").notNull().references(() => variants.id, { onDelete: "cascade" }),
  /** AES-256-GCM encrypted IMEI — format: "iv:tag:ciphertext" in hex */
  imeiEncrypted: text("imei_encrypted"),
  batteryPct: integer("battery_pct"),
  gradeNotes: text("grade_notes"),
  /** jsonb: string[] of photo URLs */
  photos: jsonb("photos").notNull().default([]),
  status: unitStatusEnum("status").notNull().default("available"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [index("units_variant_idx").on(t.variantId)]);

// ── Cart ──────────────────────────────────────────────────────────────────────

export const carts = pgTable("carts", {
  id: uuid("id").defaultRandom().primaryKey(),
  /** Cookie value — 32-char random hex */
  cookieId: varchar("cookie_id", { length: 64 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [uniqueIndex("carts_cookie_idx").on(t.cookieId)]);

export const cartItems = pgTable("cart_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  cartId: uuid("cart_id").notNull().references(() => carts.id, { onDelete: "cascade" }),
  variantId: uuid("variant_id").notNull().references(() => variants.id, { onDelete: "cascade" }),
  qty: integer("qty").notNull().default(1),
}, (t) => [
  index("cart_items_cart_idx").on(t.cartId),
  uniqueIndex("cart_items_cart_variant_idx").on(t.cartId, t.variantId),
]);

// ── Reservations ──────────────────────────────────────────────────────────────

export const reservations = pgTable("reservations", {
  id: uuid("id").defaultRandom().primaryKey(),
  cartId: uuid("cart_id").references(() => carts.id, { onDelete: "set null" }),
  variantId: uuid("variant_id").references(() => variants.id, { onDelete: "set null" }),
  unitId: uuid("unit_id").references(() => units.id, { onDelete: "set null" }),
  qty: integer("qty").notNull().default(1),
  expiresAt: timestamp("expires_at").notNull(),
  released: boolean("released").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("reservations_cart_idx").on(t.cartId),
  index("reservations_expires_idx").on(t.expiresAt),
]);

// ── Orders ────────────────────────────────────────────────────────────────────

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  /** Human-readable, e.g. NAT-10421 */
  number: varchar("number", { length: 20 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 30 }),
  /** jsonb: { name, line1, line2, city, state, zip, country } */
  shippingAddress: jsonb("shipping_address").notNull(),
  status: orderStatusEnum("status").notNull().default("pending_payment"),
  subtotalCents: integer("subtotal_cents").notNull(),
  taxCents: integer("tax_cents").notNull().default(0),
  shippingCents: integer("shipping_cents").notNull().default(0),
  totalCents: integer("total_cents").notNull(),
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 80 }),
  stripeTaxTransactionId: varchar("stripe_tax_transaction_id", { length: 80 }),
  /** "normal" | "elevated" | "highest" from Stripe Radar */
  riskLevel: varchar("risk_level", { length: 20 }).notNull().default("normal"),
  internalNotes: text("internal_notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  uniqueIndex("orders_number_idx").on(t.number),
  index("orders_email_idx").on(t.email),
  index("orders_stripe_pi_idx").on(t.stripePaymentIntentId),
]);

export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  variantId: uuid("variant_id").references(() => variants.id, { onDelete: "set null" }),
  unitId: uuid("unit_id").references(() => units.id, { onDelete: "set null" }),
  /** Snapshot of data at purchase time */
  familyName: varchar("family_name", { length: 120 }).notNull(),
  finish: varchar("finish", { length: 80 }).notNull(),
  storageGb: integer("storage_gb").notNull(),
  condition: conditionEnum("condition").notNull(),
  batteryFloor: integer("battery_floor"),
  priceCents: integer("price_cents").notNull(),
  qty: integer("qty").notNull().default(1),
}, (t) => [index("order_items_order_idx").on(t.orderId)]);

// ── Fulfillment ───────────────────────────────────────────────────────────────

export const shipments = pgTable("shipments", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  carrier: varchar("carrier", { length: 40 }),
  service: varchar("service", { length: 80 }),
  trackingNumber: varchar("tracking_number", { length: 120 }),
  labelUrl: text("label_url"),
  costCents: integer("cost_cents"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [index("shipments_order_idx").on(t.orderId)]);

export const refunds = pgTable("refunds", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  amountCents: integer("amount_cents").notNull(),
  reason: text("reason"),
  stripeRefundId: varchar("stripe_refund_id", { length: 80 }),
  staffId: uuid("staff_id").references(() => staff.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [index("refunds_order_idx").on(t.orderId)]);

// ── Staff ─────────────────────────────────────────────────────────────────────

export const staff = pgTable("staff", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  role: staffRoleEnum("role").notNull().default("ops"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [uniqueIndex("staff_email_idx").on(t.email)]);

// ── Audit ─────────────────────────────────────────────────────────────────────

export const auditLog = pgTable("audit_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  staffId: uuid("staff_id").references(() => staff.id, { onDelete: "set null" }),
  action: varchar("action", { length: 120 }).notNull(),
  entityType: varchar("entity_type", { length: 60 }),
  entityId: uuid("entity_id"),
  /** jsonb diff payload */
  payload: jsonb("payload"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("audit_log_staff_idx").on(t.staffId),
  index("audit_log_entity_idx").on(t.entityType, t.entityId),
]);
