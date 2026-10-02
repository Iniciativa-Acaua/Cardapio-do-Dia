// db/relations.ts
import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  users: {
    addresses: r.many.addresses(),
    orders: r.many.orders(),
    reviews: r.many.reviews(),
    loyaltyTransactions: r.many.loyaltyTransactions(),
    notifications: r.many.notifications(),
    favoriteProducts: r.many.products({
      from: r.users.id.through(r.favorites.userId),
      to: r.products.id.through(r.favorites.productId),
    }),
  },
  addresses: {
    user: r.one.users({ from: r.addresses.userId, to: r.users.id, optional: false }),
  },

  categories: {
    products: r.many.products(),
  },
  products: {
    category: r.one.categories({
      from: r.products.categoryId,
      to: r.categories.id,
      optional: false,
    }),
    addons: r.many.productAddons(),
    reviews: r.many.reviews(),
  },
  productAddons: {
    product: r.one.products({
      from: r.productAddons.productId,
      to: r.products.id,
      optional: false,
    }),
  },

  orders: {
    user: r.one.users({ from: r.orders.userId, to: r.users.id }),
    address: r.one.addresses({ from: r.orders.addressId, to: r.addresses.id }),
    coupon: r.one.coupons({ from: r.orders.couponId, to: r.coupons.id }),
    deliveryZone: r.one.deliveryZones({
      from: r.orders.deliveryZoneId,
      to: r.deliveryZones.id,
    }),
    items: r.many.orderItems(),
    payments: r.many.payments(),
    statusHistory: r.many.orderStatusHistory(),
  },
  coupons: { orders: r.many.orders() },
  deliveryZones: { orders: r.many.orders() },
  orderItems: {
    order: r.one.orders({ from: r.orderItems.orderId, to: r.orders.id, optional: false }),
    product: r.one.products({ from: r.orderItems.productId, to: r.products.id }),
    addons: r.many.orderItemAddons(),
  },
  orderItemAddons: {
    orderItem: r.one.orderItems({
      from: r.orderItemAddons.orderItemId,
      to: r.orderItems.id,
      optional: false,
    }),
    addon: r.one.productAddons({
      from: r.orderItemAddons.addonId,
      to: r.productAddons.id,
    }),
  },
  payments: {
    order: r.one.orders({ from: r.payments.orderId, to: r.orders.id, optional: false }),
  },
  orderStatusHistory: {
    order: r.one.orders({
      from: r.orderStatusHistory.orderId,
      to: r.orders.id,
      optional: false,
    }),
    changedByUser: r.one.users({
      from: r.orderStatusHistory.changedBy,
      to: r.users.id,
    }),
  },

  reviews: {
    user: r.one.users({ from: r.reviews.userId, to: r.users.id, optional: false }),
    product: r.one.products({ from: r.reviews.productId, to: r.products.id, optional: false }),
    order: r.one.orders({ from: r.reviews.orderId, to: r.orders.id }),
  },
  loyaltyTransactions: {
    user: r.one.users({
      from: r.loyaltyTransactions.userId,
      to: r.users.id,
      optional: false,
    }),
    order: r.one.orders({ from: r.loyaltyTransactions.orderId, to: r.orders.id }),
  },
  notifications: {
    user: r.one.users({ from: r.notifications.userId, to: r.users.id, optional: false }),
    order: r.one.orders({ from: r.notifications.orderId, to: r.orders.id }),
  },
}));