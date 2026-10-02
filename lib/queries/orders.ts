// lib/queries/orders.ts
import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  deliveryZones,
  orderItemAddons,
  orderItems,
  orderStatusHistory,
  orders,
  payments,
} from "@/db/schema";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getOrderConfirmation(id: string) {
  if (!UUID_RE.test(id)) return null;

  const [orderRows, items, addons, paymentRows, history] = await Promise.all([
    db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        status: orders.status,
        fulfillmentType: orders.fulfillmentType,
        customerName: orders.customerName,
        deliveryAddress: orders.deliveryAddress,
        zoneName: deliveryZones.name,
        subtotalCents: orders.subtotalCents,
        deliveryFeeCents: orders.deliveryFeeCents,
        discountCents: orders.discountCents,
        totalCents: orders.totalCents,
        notes: orders.notes,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .leftJoin(deliveryZones, eq(orders.deliveryZoneId, deliveryZones.id))
      .where(eq(orders.id, id))
      .limit(1),
    db
      .select({
        id: orderItems.id,
        name: orderItems.nameSnapshot,
        unitPriceCents: orderItems.unitPriceCents,
        quantity: orderItems.quantity,
      })
      .from(orderItems)
      .where(eq(orderItems.orderId, id)),
    db
      .select({
        orderItemId: orderItemAddons.orderItemId,
        name: orderItemAddons.nameSnapshot,
        priceCents: orderItemAddons.priceCents,
      })
      .from(orderItemAddons)
      .innerJoin(orderItems, eq(orderItemAddons.orderItemId, orderItems.id))
      .where(eq(orderItems.orderId, id)),
    db
      .select({ method: payments.method, status: payments.status })
      .from(payments)
      .where(eq(payments.orderId, id))
      .limit(1),
    db
      .select({ status: orderStatusHistory.status, createdAt: orderStatusHistory.createdAt })
      .from(orderStatusHistory)
      .where(eq(orderStatusHistory.orderId, id))
      .orderBy(asc(orderStatusHistory.createdAt)),
  ]);

  const order = orderRows[0];
  if (!order) return null;

  const lines = items.map((item) => {
    const itemAddons = addons.filter((a) => a.orderItemId === item.id);
    const unit = item.unitPriceCents + itemAddons.reduce((s, a) => s + a.priceCents, 0);
    return { ...item, addons: itemAddons, lineTotalCents: unit * item.quantity };
  });

  return { order, lines, payment: paymentRows[0] ?? null, history };
}