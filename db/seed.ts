import { randomUUID } from "node:crypto";
import { fakerPT_BR as faker } from "@faker-js/faker";
import { eq, like, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import {
  addresses, businessHours, categories, coupons, deliveryZones, favorites,
  loyaltyTransactions, notifications, orderItemAddons, orderItems,
  orderStatusHistory, orders, payments, productAddons, products, reviews, user,
} from "./schema";
import {
  cancelNotes, orderNotes, reviewComments, SEED_EMAIL_DOMAIN,
  seedCategories, seedCoupons, seedZones,
} from "./seed-data";

const CUSTOMERS = 300;
const ORDERS = 3000;
const DAYS = 90;
const PEAK_HOURS = [11, 12, 12, 12, 13, 13, 14, 18, 19, 19, 20, 20, 21];

type OrderStatus = NonNullable<(typeof orders.$inferInsert)["status"]>;
type PayStatus = NonNullable<(typeof payments.$inferInsert)["status"]>;

faker.seed(42);

const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const pick = <T>(list: T[]): T => list[faker.number.int({ min: 0, max: list.length - 1 })];
const chance = (p: number) => faker.number.float() < p;
const addMinutes = (d: Date, m: number) => new Date(d.getTime() + m * 60_000);

async function batch<T>(rows: T[], insert: (rows: T[]) => Promise<unknown>) {
  for (let i = 0; i < rows.length; i += 500) await insert(rows.slice(i, i + 500));
}

const statusMessages: Record<OrderStatus, string> = {
  pending: "Recebemos seu pedido e estamos aguardando a confirmação.",
  confirmed: "Seu pedido foi confirmado.",
  preparing: "Seu pedido está sendo preparado.",
  ready: "Seu pedido está pronto.",
  out_for_delivery: "Seu pedido saiu para entrega.",
  delivered: "Seu pedido foi entregue. Bom apetite!",
  cancelled: "Seu pedido foi cancelado.",
};

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Seed bloqueado em produção.");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle({ client: pool });
  const now = new Date();
  const cap = (d: Date) => (d > now ? now : d);

  // ---------- limpeza (só ambiente de desenvolvimento) ----------
  await db.delete(orders); // cascata: itens, pagamentos, histórico
  await db.delete(user).where(like(user.email, `%@${SEED_EMAIL_DOMAIN}`)); // cascata: endereços, favoritos...
  await db.delete(coupons);

  // ---------- catálogo ----------
  await db
    .insert(categories)
    .values(seedCategories.map((c, i) => ({ name: c.name, slug: slugify(c.name), sortOrder: i })))
    .onConflictDoNothing();
  const catId = new Map((await db.select().from(categories)).map((c) => [c.name, c.id]));

  await db
    .insert(products)
    .values(
      seedCategories.flatMap((c) =>
        c.items.map(([name, price, description], idx) => ({
          categoryId: catId.get(c.name)!,
          name,
          slug: slugify(name),
          description,
          priceCents: Math.round(price * 100),
          imageUrl: "/prato.jpg",
          isFeatured: idx === 0,
        }))
      )
    )
    .onConflictDoNothing();
  const productList = await db
    .select({ id: products.id, slug: products.slug, name: products.name, priceCents: products.priceCents })
    .from(products);
  const idBySlug = new Map(productList.map((p) => [p.slug, p.id]));

  await db.delete(productAddons);
  const addonSeed = seedCategories.flatMap((c) =>
    c.items.flatMap(([name]) =>
      c.addons.map(([addonName, price]) => ({
        productId: idBySlug.get(slugify(name))!,
        name: addonName,
        priceCents: Math.round(price * 100),
      }))
    )
  );
  await batch(addonSeed, (b) => db.insert(productAddons).values(b));
  const addonsByProduct = new Map<string, { id: string; name: string; priceCents: number }[]>();
  for (const a of await db.select().from(productAddons)) {
    const list = addonsByProduct.get(a.productId) ?? [];
    list.push({ id: a.id, name: a.name, priceCents: a.priceCents });
    addonsByProduct.set(a.productId, list);
  }

  // ---------- loja ----------
  await db
    .insert(businessHours)
    .values([
      ...[1, 2, 3, 4, 5].map((weekday) => ({ weekday, opensAt: "11:00", closesAt: "22:00" })),
      { weekday: 6, opensAt: "11:00", closesAt: "23:00" },
      { weekday: 0, opensAt: "11:00", closesAt: "20:00" },
    ])
    .onConflictDoNothing();
  await db.insert(deliveryZones).values(seedZones).onConflictDoNothing();
  const zones = await db.select().from(deliveryZones);
  const zoneByNeighborhood = new Map(zones.map((z) => [z.neighborhood, z]));
  const couponRows = await db.insert(coupons).values(seedCoupons).returning();
  const activeCoupons = couponRows.filter((c) => c.active && !c.validUntil);

  // ---------- clientes e endereços ----------
  const CITY = faker.location.city();
  const UF = faker.location.state({ abbreviated: true }).slice(0, 2);

  const customers = Array.from({ length: CUSTOMERS }, (_, i) => {
    const first = faker.person.firstName();
    const last = faker.person.lastName();
    return {
      id: randomUUID(),
      name: `${first} ${last}`,
      email: `${slugify(`${first}.${last}`).replace(/-/g, ".")}${i}@${SEED_EMAIL_DOMAIN}`,
      emailVerified: true,
      phone: faker.helpers.replaceSymbols("(##) 9####-####"),
      role: "customer" as const,
      createdAt: faker.date.between({ from: new Date(Date.now() - 365 * 86_400_000), to: new Date(Date.now() - DAYS * 86_400_000) }),
    };
  });
  await batch(customers, (b) => db.insert(user).values(b));

  const addressRows = customers.flatMap((c) =>
    Array.from({ length: chance(0.35) ? 2 : 1 }, (_, k) => ({
      id: randomUUID(),
      userId: c.id,
      label: k === 0 ? "Casa" : "Trabalho",
      cep: `${faker.string.numeric(5)}-${faker.string.numeric(3)}`,
      street: faker.location.street(),
      number: String(faker.number.int({ min: 1, max: 2000 })),
      complement: chance(0.3) ? `Apto ${faker.number.int({ min: 101, max: 1204 })}` : null,
      neighborhood: pick(zones).neighborhood,
      city: CITY,
      state: UF,
      isDefault: k === 0,
    }))
  );
  await batch(addressRows, (b) => db.insert(addresses).values(b));
  const addressesByUser = new Map<string, typeof addressRows>();
  for (const a of addressRows) {
    const list = addressesByUser.get(a.userId) ?? [];
    list.push(a);
    addressesByUser.set(a.userId, list);
  }

  // ---------- pedidos ----------
  const orderRows: (typeof orders.$inferInsert)[] = [];
  const itemRows: (typeof orderItems.$inferInsert)[] = [];
  const itemAddonRows: (typeof orderItemAddons.$inferInsert)[] = [];
  const paymentRows: (typeof payments.$inferInsert)[] = [];
  const historyRows: (typeof orderStatusHistory.$inferInsert)[] = [];
  const reviewRows: (typeof reviews.$inferInsert)[] = [];
  const loyaltyRows: (typeof loyaltyTransactions.$inferInsert)[] = [];
  const notificationRows: (typeof notifications.$inferInsert)[] = [];
  const couponUse = new Map<string, number>();
  const userPoints = new Map<string, number>();

  for (let i = 0; i < ORDERS; i++) {
    const orderId = randomUUID();

    // data com picos de almoço e jantar
    let createdAt = new Date(now.getTime() - faker.number.int({ min: 0, max: DAYS - 1 }) * 86_400_000);
    createdAt.setHours(pick(PEAK_HOURS), faker.number.int({ min: 0, max: 59 }), 0, 0);
    if (createdAt > now) createdAt = addMinutes(now, -faker.number.int({ min: 5, max: 600 }));

    const customer = chance(0.9) ? pick(customers) : null; // 10% visitantes
    const isDelivery = chance(0.8);

    let zone: (typeof zones)[number] | null = null;
    let addressId: string | null = null;
    let deliveryAddress: string | null = null;
    if (isDelivery) {
      if (customer) {
        const a = pick(addressesByUser.get(customer.id)!);
        addressId = a.id;
        zone = zoneByNeighborhood.get(a.neighborhood)!;
        deliveryAddress = `${a.street}, ${a.number} - ${a.neighborhood}, ${a.city}/${a.state}`;
      } else {
        zone = pick(zones);
        deliveryAddress = `${faker.location.street()}, ${faker.number.int({ min: 1, max: 2000 })} - ${zone.neighborhood}, ${CITY}/${UF}`;
      }
    }

    // itens (garante o pedido mínimo da zona)
    const lines: {
      itemId: string; productId: string; name: string; unit: number; qty: number;
      addons: { id: string; name: string; priceCents: number }[];
    }[] = [];
    let subtotal = 0;
    const addLine = () => {
      const p = pick(productList);
      const qty = faker.helpers.weightedArrayElement([
        { weight: 6, value: 1 }, { weight: 3, value: 2 }, { weight: 1, value: 3 },
      ]);
      const opts = addonsByProduct.get(p.id) ?? [];
      const chosen = opts.length && chance(0.3)
        ? faker.helpers.arrayElements(opts, { min: 1, max: Math.min(2, opts.length) })
        : [];
      lines.push({ itemId: randomUUID(), productId: p.id, name: p.name, unit: p.priceCents, qty, addons: chosen });
      subtotal += qty * (p.priceCents + chosen.reduce((s, a) => s + a.priceCents, 0));
    };
    for (let n = faker.number.int({ min: 1, max: 4 }); n > 0; n--) addLine();
    for (let g = 0; subtotal < (zone?.minOrderCents ?? 0) && g < 10; g++) addLine();

    // cupom, taxa e total (respeita a regra total = subtotal + entrega - desconto)
    const eligible = activeCoupons.filter((c) => subtotal >= c.minOrderCents);
    const coupon = eligible.length && chance(0.25) ? pick(eligible) : null;
    const discount = !coupon
      ? 0
      : coupon.discountType === "percent"
        ? Math.round((subtotal * coupon.discountValue) / 100)
        : Math.min(coupon.discountValue, subtotal);
    const fee = isDelivery ? zone!.feeCents : 0;
    const total = subtotal + fee - discount;
    if (coupon) couponUse.set(coupon.id, (couponUse.get(coupon.id) ?? 0) + 1);

    // status: pedidos recentes em andamento, antigos finalizados
    const ageMin = (now.getTime() - createdAt.getTime()) / 60_000;
    const flow: OrderStatus[] = isDelivery
      ? ["pending", "confirmed", "preparing", "ready", "out_for_delivery", "delivered"]
      : ["pending", "confirmed", "preparing", "ready", "delivered"];
    const finalStatus: OrderStatus =
      ageMin < 120 ? pick(flow.slice(0, -1)) : chance(0.9) ? "delivered" : "cancelled";
    const steps: OrderStatus[] =
      finalStatus === "cancelled"
        ? chance(0.5) ? ["pending", "cancelled"] : ["pending", "confirmed", "cancelled"]
        : flow.slice(0, flow.indexOf(finalStatus) + 1);

    let t = createdAt;
    steps.forEach((status, idx) => {
      if (idx > 0) t = cap(addMinutes(t, faker.number.int({ min: 3, max: 25 })));
      historyRows.push({
        orderId, status, createdAt: t,
        note: status === "cancelled" ? pick(cancelNotes) : null,
      });
    });
    const lastAt = t;

    orderRows.push({
      id: orderId,
      userId: customer?.id ?? null,
      customerName: customer?.name ?? faker.person.fullName(),
      customerPhone: customer?.phone ?? faker.helpers.replaceSymbols("(##) 9####-####"),
      addressId, deliveryAddress,
      couponId: coupon?.id ?? null,
      deliveryZoneId: zone?.id ?? null,
      status: finalStatus,
      fulfillmentType: isDelivery ? "delivery" : "pickup",
      subtotalCents: subtotal, deliveryFeeCents: fee, discountCents: discount, totalCents: total,
      scheduledFor: chance(0.08) ? addMinutes(createdAt, faker.number.int({ min: 60, max: 300 })) : null,
      notes: chance(0.15) ? pick(orderNotes) : null,
      createdAt, updatedAt: lastAt,
    });

    for (const l of lines) {
      itemRows.push({ id: l.itemId, orderId, productId: l.productId, nameSnapshot: l.name, unitPriceCents: l.unit, quantity: l.qty });
      for (const a of l.addons) {
        itemAddonRows.push({ orderItemId: l.itemId, addonId: a.id, nameSnapshot: a.name, priceCents: a.priceCents });
      }
    }

    // pagamento
    const method = faker.helpers.weightedArrayElement([
      { weight: 45, value: "pix" as const },
      { weight: 25, value: "credit_card" as const },
      { weight: 15, value: "debit_card" as const },
      { weight: 15, value: "cash" as const },
    ]);
    const payStatus: PayStatus =
      finalStatus === "cancelled"
        ? method === "cash" ? "failed" : "refunded"
        : finalStatus === "pending" ? "pending"
        : method === "cash" && finalStatus !== "delivered" ? "pending"
        : "paid";
    paymentRows.push({
      orderId, method, status: payStatus, amountCents: total,
      providerRef: method === "cash" ? null : `PAY-${faker.string.alphanumeric(20).toUpperCase()}`,
      paidAt: payStatus === "paid" || payStatus === "refunded"
        ? cap(method === "cash" ? lastAt : addMinutes(createdAt, 2))
        : null,
      createdAt, updatedAt: lastAt,
    });

    if (customer) {
      notificationRows.push({
        userId: customer.id, orderId,
        channel: pick(["email", "whatsapp", "push"] as const),
        message: statusMessages[finalStatus],
        sentAt: lastAt,
        readAt: chance(0.6) ? cap(addMinutes(lastAt, faker.number.int({ min: 1, max: 600 }))) : null,
        createdAt: lastAt,
      });

      if (finalStatus === "delivered") {
        const points = Math.floor(total / 100);
        loyaltyRows.push({ userId: customer.id, orderId, type: "earn", points, createdAt: lastAt });
        userPoints.set(customer.id, (userPoints.get(customer.id) ?? 0) + points);

        if (chance(0.3)) {
          const line = pick(lines);
          reviewRows.push({
            userId: customer.id, productId: line.productId, orderId,
            rating: faker.helpers.weightedArrayElement([
              { weight: 45, value: 5 }, { weight: 30, value: 4 }, { weight: 12, value: 3 },
              { weight: 8, value: 2 }, { weight: 5, value: 1 },
            ]),
            status: faker.helpers.weightedArrayElement([
              { weight: 85, value: "approved" as const },
              { weight: 10, value: "pending" as const },
              { weight: 5, value: "rejected" as const },
            ]),
            createdAt: cap(addMinutes(lastAt, faker.number.int({ min: 60, max: 2880 }))),
          });
          const r = reviewRows[reviewRows.length - 1];
          r.comment = chance(0.8) ? pick(reviewComments[r.rating]) : null;
        }
      }
    }
  }

  // alguns resgates de pontos
  for (const [userId, pts] of userPoints) {
    if (pts >= 150 && chance(0.15)) {
      loyaltyRows.push({ userId, type: "redeem", points: -100, createdAt: cap(addMinutes(now, -faker.number.int({ min: 60, max: 20_000 }))) });
    }
  }

  // favoritos
  const favoriteRows = customers.flatMap((c) =>
    faker.helpers
      .arrayElements(productList, { min: 0, max: 6 })
      .map((p) => ({ userId: c.id, productId: p.id }))
  );

  // ---------- gravação em lotes (ordem respeita as chaves estrangeiras) ----------
  await batch(orderRows, (b) => db.insert(orders).values(b));
  await batch(itemRows, (b) => db.insert(orderItems).values(b));
  await batch(itemAddonRows, (b) => db.insert(orderItemAddons).values(b));
  await batch(paymentRows, (b) => db.insert(payments).values(b));
  await batch(historyRows, (b) => db.insert(orderStatusHistory).values(b));
  await batch(reviewRows, (b) => db.insert(reviews).values(b));
  await batch(loyaltyRows, (b) => db.insert(loyaltyTransactions).values(b));
  await batch(notificationRows, (b) => db.insert(notifications).values(b));
  await batch(favoriteRows, (b) => db.insert(favorites).values(b));

  // ---------- campos desnormalizados ----------
  await db.execute(sql`
    UPDATE products p
    SET rating_avg = r.avg, rating_count = r.cnt
    FROM (
      SELECT product_id, AVG(rating)::real AS avg, COUNT(*)::int AS cnt
      FROM reviews WHERE status = 'approved' GROUP BY product_id
    ) r
    WHERE p.id = r.product_id
  `);
  for (const [id, used] of couponUse) {
    await db.update(coupons).set({ usedCount: used }).where(eq(coupons.id, id));
  }

  await pool.end();
  console.log(
    `Seed concluído: ${productList.length} pratos, ${customers.length} clientes, ` +
      `${orderRows.length} pedidos, ${itemRows.length} itens, ${reviewRows.length} avaliações.`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});