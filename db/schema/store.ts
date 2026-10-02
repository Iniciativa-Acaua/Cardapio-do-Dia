// db/schema/store.ts
import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  integer,
  pgTable,
  text,
  time,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { discountType } from "./enums";
import { timestamps } from "./helpers";

export const coupons = pgTable(
  "coupons",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    code: text("code").notNull(),
    discountType: discountType("discount_type").notNull(),
    discountValue: integer("discount_value").notNull(), // % ou centavos
    minOrderCents: integer("min_order_cents").notNull().default(0),
    validFrom: timestamp("valid_from", { withTimezone: true }),
    validUntil: timestamp("valid_until", { withTimezone: true }),
    usageLimit: integer("usage_limit"), // nulo = sem limite
    usedCount: integer("used_count").notNull().default(0),
    active: boolean("active").notNull().default(true),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("coupons_code_idx").on(t.code),
    check(
      "coupons_percent_range",
      sql`${t.discountType} <> 'percent' or ${t.discountValue} between 1 and 100`
    ),
  ]
);

export const deliveryZones = pgTable(
  "delivery_zones",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    neighborhood: text("neighborhood").notNull(),
    feeCents: integer("fee_cents").notNull().default(0),
    minOrderCents: integer("min_order_cents").notNull().default(0),
    active: boolean("active").notNull().default(true),
  },
  (t) => [uniqueIndex("delivery_zones_neighborhood_idx").on(t.neighborhood)]
);

export const businessHours = pgTable(
  "business_hours",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    weekday: integer("weekday").notNull(), // 0 = domingo ... 6 = sábado
    opensAt: time("opens_at").notNull(),
    closesAt: time("closes_at").notNull(),
    isClosed: boolean("is_closed").notNull().default(false),
  },
  (t) => [
    check("business_hours_weekday_range", sql`${t.weekday} between 0 and 6`),
    uniqueIndex("business_hours_weekday_opens_idx").on(t.weekday, t.opensAt),
  ]
);