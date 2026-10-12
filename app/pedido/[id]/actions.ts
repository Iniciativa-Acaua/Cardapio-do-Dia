"use server";

import { notFound, redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { payments } from "@/db/schema";
import { getOrderConfirmation, podeAcessarPedido } from "@/lib/queries/orders";
import { criarCobrancaOnline, sincronizarPagamentoDoPedido } from "@/lib/payments";
import { getSession } from "@/lib/session";

export async function pagarPedidoOnline(orderId: string) {
  let data = await getOrderConfirmation(orderId);
  if (!data) notFound();

  const session = await getSession();
  if (!podeAcessarPedido(data.order.userId, session?.user)) notFound();

  const { order, payment } = data;
  if (
    !payment ||
    payment.method !== "online" ||
    order.status !== "pending" ||
    payment.status === "paid" ||
    payment.status === "refunded"
  ) {
    redirect(`/pedido/${orderId}`);
  }

  // se o cliente já pagou e a confirmação ainda não chegou, não cobra de novo
  try {
    await sincronizarPagamentoDoPedido(orderId);
  } catch (err) {
    console.error("Falha ao conferir pagamento antes de cobrar de novo", err);
  }
  data = (await getOrderConfirmation(orderId)) ?? data;
  if (data.payment?.status === "paid") redirect(`/pedido/${orderId}`);

  const items = [
    ...data.lines.map((l) => ({
      id: l.id,
      title: l.addons.length ? `${l.name} (+ ${l.addons.map((a) => a.name).join(", ")})` : l.name,
      quantity: l.quantity,
      unitPriceCents: l.lineTotalCents / l.quantity,
    })),
    ...(data.order.deliveryFeeCents > 0
      ? [{ id: "entrega", title: "Taxa de entrega", quantity: 1, unitPriceCents: data.order.deliveryFeeCents }]
      : []),
  ];

  // trava de segurança: nunca cobra um valor diferente do total do pedido
  const soma = items.reduce((s, i) => s + i.unitPriceCents * i.quantity, 0);
  if (soma !== data.order.totalCents) {
    console.error("Valor da cobrança difere do total do pedido", { orderId, soma });
    redirect(`/pedido/${orderId}?pagamento=erro`);
  }

  let url: string | null = null;
  try {
    url = await criarCobrancaOnline({ orderId, orderNumber: data.order.orderNumber, items });
  } catch (err) {
    console.error("Erro ao criar nova cobrança no Mercado Pago:", err);
  }
  if (!url) redirect(`/pedido/${orderId}?pagamento=erro`);

  // volta de "recusado" para "aguardando" enquanto o cliente tenta de novo
  await db
    .update(payments)
    .set({ status: "pending" })
    .where(
      and(eq(payments.orderId, orderId), eq(payments.method, "online"), eq(payments.status, "failed"))
    );

  redirect(url);
}