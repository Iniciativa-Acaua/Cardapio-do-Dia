// app/checkout/actions.ts
"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import {
  deliveryZones,
  orderItemAddons,
  orderItems,
  orderStatusHistory,
  orders,
  payments,
  productAddons,
  products,
} from "@/db/schema";
import { getOpenStatus } from "@/lib/queries/store";
import { formatCents } from "@/lib/format";
import { getSession } from "@/lib/session";

export type CheckoutState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
};

const itemSchema = z.object({
  productId: z.uuid(),
  addonIds: z.array(z.uuid()).max(20),
  quantity: z.number().int().min(1).max(50),
});

const formSchema = z.object({
  customerName: z.string().trim().min(2, "Informe seu nome.").max(80, "Nome muito longo."),
  customerPhone: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .pipe(
      z
        .string()
        .min(10, "Telefone inválido. Use DDD + número.")
        .max(11, "Telefone inválido. Use DDD + número.")
    ),
  fulfillmentType: z.enum(["delivery", "pickup"]),
  paymentMethod: z.enum(["pix", "credit_card", "debit_card", "cash"], "Escolha a forma de pagamento."),
  zoneId: z.string().optional(),
  street: z.string().trim().max(120).optional(),
  number: z.string().trim().max(20).optional(),
  complement: z.string().trim().max(80).optional(),
  notes: z.string().trim().max(300, "Observação muito longa.").optional(),
});

const text = (formData: FormData, key: string) => {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
};

export async function createOrder(
  _prev: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
  const values = {
    customerName: text(formData, "customerName"),
    customerPhone: text(formData, "customerPhone"),
    fulfillmentType: text(formData, "fulfillmentType"),
    paymentMethod: text(formData, "paymentMethod"),
    zoneId: text(formData, "zoneId"),
    street: text(formData, "street"),
    number: text(formData, "number"),
    complement: text(formData, "complement"),
    notes: text(formData, "notes"),
  };

  // 1) restaurante aberto?
  const status = await getOpenStatus();
  if (!status.open) {
    return { error: "No momento estamos fechados. Volte no horário de funcionamento.", values };
  }

  // 2) validação dos campos
  const parsed = formSchema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors = Object.fromEntries(
      Object.entries(z.flattenError(parsed.error).fieldErrors).map(([k, v]) => [k, v?.[0] ?? ""])
    );
    return { fieldErrors, values };
  }
  const data = parsed.data;

  if (data.fulfillmentType === "delivery") {
    const errs: Record<string, string> = {};
    if (!data.street || data.street.length < 2) errs.street = "Informe a rua.";
    if (!data.number) errs.number = "Informe o número.";
    if (!z.uuid().safeParse(data.zoneId).success) errs.zoneId = "Escolha o bairro de entrega.";
    if (Object.keys(errs).length) return { fieldErrors: errs, values };
  }

  // 3) itens do carrinho: só IDs e quantidades vêm do navegador
  let items: z.infer<typeof itemSchema>[];
  try {
    items = z.array(itemSchema).min(1).max(50).parse(JSON.parse(text(formData, "items") || "[]"));
  } catch {
    return { error: "Seu carrinho está vazio ou inválido. Volte ao carrinho e tente de novo.", values };
  }

  // 4) preços reais vêm do banco
  const productIds = [...new Set(items.map((i) => i.productId))];
  const addonIds = [...new Set(items.flatMap((i) => i.addonIds))];

  const [dbProducts, dbAddons] = await Promise.all([
    db
      .select({ id: products.id, name: products.name, priceCents: products.priceCents })
      .from(products)
      .where(and(inArray(products.id, productIds), eq(products.isAvailable, true))),
    addonIds.length
      ? db
          .select({
            id: productAddons.id,
            productId: productAddons.productId,
            name: productAddons.name,
            priceCents: productAddons.priceCents,
          })
          .from(productAddons)
          .where(and(inArray(productAddons.id, addonIds), eq(productAddons.active, true)))
      : Promise.resolve([]),
  ]);

  const productMap = new Map(dbProducts.map((p) => [p.id, p]));
  const addonMap = new Map(dbAddons.map((a) => [a.id, a]));

  const lines: {
    id: string;
    product: (typeof dbProducts)[number];
    addons: (typeof dbAddons)[number][];
    quantity: number;
  }[] = [];

  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) {
      return { error: "Um dos pratos do carrinho não está mais disponível. Revise o carrinho.", values };
    }
    const chosen: (typeof dbAddons)[number][] = [];
    for (const addonId of new Set(item.addonIds)) {
      const addon = addonMap.get(addonId);
      if (!addon || addon.productId !== product.id) {
        return { error: "Um adicional do carrinho não está mais disponível. Revise o carrinho.", values };
      }
      chosen.push(addon);
    }
    lines.push({ id: randomUUID(), product, addons: chosen, quantity: item.quantity });
  }

  const subtotalCents = lines.reduce(
    (sum, l) =>
      sum +
      (l.product.priceCents + l.addons.reduce((s, a) => s + a.priceCents, 0)) * l.quantity,
    0
  );

  // 5) frete
  let deliveryFeeCents = 0;
  let zoneId: string | null = null;
  let deliveryAddress: string | null = null;

  if (data.fulfillmentType === "delivery") {
    const [zone] = await db
      .select()
      .from(deliveryZones)
      .where(and(eq(deliveryZones.id, data.zoneId!), eq(deliveryZones.active, true)))
      .limit(1);

    if (!zone) return { fieldErrors: { zoneId: "Escolha o bairro de entrega." }, values };
    if (subtotalCents < zone.minOrderCents) {
      return {
        error: `O pedido mínimo para ${zone.name} é ${formatCents(zone.minOrderCents)}.`,
        values,
      };
    }

    deliveryFeeCents = zone.feeCents;
    zoneId = zone.id;
    deliveryAddress =
      `${data.street}, ${data.number}` +
      (data.complement ? ` - ${data.complement}` : "") +
      ` - ${zone.neighborhood}`;
  }

  const totalCents = subtotalCents + deliveryFeeCents;

  // quem está logado (visitante continua podendo comprar)
  const session = await getSession();

  // 6) grava tudo numa transação
  let orderId: string;
  try {
    orderId = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(orders)
        .values({
          userId: session?.user.id ?? null,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          fulfillmentType: data.fulfillmentType,
          deliveryAddress,
          deliveryZoneId: zoneId,
          status: "pending",
          subtotalCents,
          deliveryFeeCents,
          discountCents: 0,
          totalCents,
          notes: data.notes || null,
        })
        .returning({ id: orders.id });

      await tx.insert(orderItems).values(
        lines.map((l) => ({
          id: l.id,
          orderId: created.id,
          productId: l.product.id,
          nameSnapshot: l.product.name,
          unitPriceCents: l.product.priceCents,
          quantity: l.quantity,
        }))
      );

      const addonRows = lines.flatMap((l) =>
        l.addons.map((a) => ({
          orderItemId: l.id,
          addonId: a.id,
          nameSnapshot: a.name,
          priceCents: a.priceCents,
        }))
      );
      if (addonRows.length) await tx.insert(orderItemAddons).values(addonRows);

      await tx.insert(payments).values({
        orderId: created.id,
        method: data.paymentMethod,
        status: "pending",
        amountCents: totalCents,
      });

      await tx.insert(orderStatusHistory).values({
        orderId: created.id,
        status: "pending",
      });

      return created.id;
    });
  } catch (err) {
    console.error("Erro ao criar pedido:", err);
    return { error: "Não foi possível registrar o pedido agora. Tente novamente em instantes.", values };
  }

  // fora do try/catch: redirect() funciona lançando uma exceção interna
  redirect(`/pedido/${orderId}`);
}