// db/schema/enums.ts
import { pgEnum } from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["customer", "staff", "admin"]);
export const reviewStatus = pgEnum("review_status", ["pending", "approved", "rejected"]);
export const fulfillmentType = pgEnum("fulfillment_type", ["delivery", "pickup"]);
export const orderStatus = pgEnum("order_status", [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "out_for_delivery",
  "delivered",
  "cancelled",
]);
export const paymentMethod = pgEnum("payment_method", ["pix", "credit_card", "debit_card", "cash"]);
export const paymentStatus = pgEnum("payment_status", ["pending", "paid", "failed", "refunded"]);
export const discountType = pgEnum("discount_type", ["percent", "fixed"]);
export const loyaltyType = pgEnum("loyalty_type", ["earn", "redeem", "adjust"]);
export const notificationChannel = pgEnum("notification_channel", ["email", "whatsapp", "push"]);