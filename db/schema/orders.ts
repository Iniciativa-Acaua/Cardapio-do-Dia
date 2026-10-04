// db/schema/orders.ts
import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { fulfillmentType, orderStatus, paymentMethod, paymentStatus } from "./enums";
import { timestamps } from "./helpers";
import { addresses } from "./addresses";
import { products, productAddons } from "./catalog";
import { coupons, deliveryZones } from "./store";
import { user } from "./auth-schema";

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    // número amigável para o cliente ("Pedido #1001")
    orderNumber: integer("order_number").generatedAlwaysAsIdentity({ startWith: 1001 }),
    // opcional: permite pedido sem login, e o histórico sobrevive à exclusão da conta
    userId: uuid("user_id").references(() => user.id, { onDelete: "set null" }),
    customerName: text("customer_name").notNull(),
    customerPhone: text("customer_phone").notNull(),
    addressId: uuid("address_id").references(() => addresses.id, { onDelete: "set null" }),
    deliveryAddress: text("delivery_address"), // cópia do endereço no momento do pedido
    couponId: uuid("coupon_id").references(() => coupons.id, { onDelete: "set null" }),
    deliveryZoneId: uuid("delivery_zone_id").references(() => deliveryZones.id, {
      onDelete: "set null",
    }),
    status: orderStatus("status").notNull().default("pending"),
    fulfillmentType: fulfillmentType("fulfillment_type").notNull().default("delivery"),
    subtotalCents: integer("subtotal_cents").notNull(),
    deliveryFeeCents: integer("delivery_fee_cents").notNull().default(0),
    discountCents: integer("discount_cents").notNull().default(0),
    totalCents: integer("total_cents").notNull(),
    scheduledFor: timestamp("scheduled_for", { withTimezone: true }),
    notes: text("notes"),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("orders_order_number_idx").on(t.orderNumber),
    index("orders_user_created_idx").on(t.userId, t.createdAt.desc()),
    index("orders_status_created_idx").on(t.status, t.createdAt),
    index("orders_coupon_id_idx").on(t.couponId),
    check(
      "orders_total_matches",
      sql`${t.totalCents} = ${t.subtotalCents} + ${t.deliveryFeeCents} - ${t.discountCents}`
    ),
  ]
);

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
    nameSnapshot: text("name_snapshot").notNull(),
    unitPriceCents: integer("unit_price_cents").notNull(),
    quantity: integer("quantity").notNull(),
  },
  (t) => [
    index("order_items_order_id_idx").on(t.orderId),
    index("order_items_product_id_idx").on(t.productId),
    check("order_items_quantity_positive", sql`${t.quantity} > 0`),
  ]
);

export const orderItemAddons = pgTable(
  "order_item_addons",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderItemId: uuid("order_item_id")
      .notNull()
      .references(() => orderItems.id, { onDelete: "cascade" }),
    addonId: uuid("addon_id").references(() => productAddons.id, { onDelete: "set null" }),
    nameSnapshot: text("name_snapshot").notNull(),
    priceCents: integer("price_cents").notNull().default(0),
  },
  (t) => [index("order_item_addons_item_id_idx").on(t.orderItemId)]
);

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    method: paymentMethod("method").notNull(),
    status: paymentStatus("status").notNull().default("pending"),
    providerRef: text("provider_ref"), // id da transação no gateway
    amountCents: integer("amount_cents").notNull(),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    index("payments_order_id_idx").on(t.orderId),
    uniqueIndex("payments_provider_ref_idx").on(t.providerRef),
  ]
);

export const orderStatusHistory = pgTable(
  "order_status_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    status: orderStatus("status").notNull(),
    changedBy: uuid("changed_by").references(() => user.id, { onDelete: "set null" }),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("order_status_history_order_idx").on(t.orderId, t.createdAt)]
);