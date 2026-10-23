import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { orderStatusHistory, orders, payments } from "@/db/schema";
import { paymentApi, preferenceApi } from "@/lib/mercadopago";

type ItemCobranca = {
  id: string;
  title: string;
  quantity: number;
  unitPriceCents: number;
};

export async function criarCobrancaOnline(params: {
  orderId: string;
  orderNumber: number;
  items: ItemCobranca[];
}) {
  const siteUrl = (process.env.SITE_URL ?? "").replace(/\/$/, "");
  if (!siteUrl) throw new Error("SITE_URL não definido.");

  // o Mercado Pago só consegue avisar o seu servidor se ele for público e usar https
  const publico = siteUrl.startsWith("https://");
  if (!publico) {
    console.warn("SITE_URL sem https: webhook e retorno automático ficam desativados.");
  }
  const agora = Date.now();
  const voltar = `${siteUrl}/pedido/${params.orderId}`;

  const pref = await preferenceApi().create({
    body: {
      items: params.items.map((i) => ({
        id: i.id,
        title: i.title.slice(0, 250),
        quantity: i.quantity,
        unit_price: i.unitPriceCents / 100,
        currency_id: "BRL",
      })),
      // é por aqui que o webhook e a conferência descobrem de qual pedido é o pagamento
      external_reference: params.orderId,
      back_urls: { success: voltar, failure: voltar, pending: voltar },
      ...(publico
        ? {
            auto_return: "approved" as const,
            notification_url: `${siteUrl}/api/mercadopago/webhook`,
          }
        : {}),
      // boleto demora dias para compensar, não serve para um restaurante
      payment_methods: { excluded_payment_types: [{ id: "ticket" }] },
      // a cobrança expira em 1 hora
      expires: true,
      expiration_date_from: new Date(agora).toISOString(),
      expiration_date_to: new Date(agora + 60 * 60 * 1000).toISOString(),
    },
    requestOptions: { idempotencyKey: randomUUID() },
  });

  if (!pref.init_point) throw new Error("O Mercado Pago não devolveu o link de pagamento.");
  return pref.init_point;
}

type StatusPagamento = "pending" | "paid" | "failed" | "refunded";

function mapear(status?: string): StatusPagamento {
  switch (status) {
    case "approved":
      return "paid";
    case "rejected":
    case "cancelled":
      return "failed";
    case "refunded":
    case "charged_back":
      return "refunded";
    default:
      return "pending"; // pending, in_process, in_mediation, authorized
  }
}

export type PagamentoMP = {
  id?: number | string;
  status?: string;
  external_reference?: string;
  transaction_amount?: number;
  payment_type_id?: string;
  date_approved?: string;
};

// usada pelo webhook, pelo cron e pela conferência da página: pode rodar várias vezes sem duplicar nada
export async function aplicarPagamento(pagamento: PagamentoMP) {
  const orderId = pagamento.external_reference;
  if (!orderId || !z.uuid().safeParse(orderId).success) return;

  const paymentId = pagamento.id != null ? String(pagamento.id) : null;
  const valorCents = Math.round((pagamento.transaction_amount ?? 0) * 100);
  const novoStatus = mapear(pagamento.status);

  await db.transaction(async (tx) => {
    const [row] = await tx
      .select({
        id: payments.id,
        status: payments.status,
        amountCents: payments.amountCents,
        providerRef: payments.providerRef,
      })
      .from(payments)
      .where(and(eq(payments.orderId, orderId), eq(payments.method, "online")))
      .for("update") // evita que dois processos tratem o mesmo pagamento ao mesmo tempo
      .limit(1);

    if (!row) {
      console.warn("Pagamento MP: pedido sem pagamento online", { orderId, paymentId });
      return;
    }
    if (row.amountCents !== valorCents) {
      console.error("Pagamento MP: valor divergente", {
        orderId,
        paymentId,
        esperado: row.amountCents,
        recebido: valorCents,
      });
      return;
    }

    // estornado é final
    if (row.status === "refunded") return;

    if (row.status === "paid") {
      // já está pago: se o aviso é de OUTRO pagamento do mesmo pedido, não mexe no original
      const outroPagamento = !!paymentId && !!row.providerRef && row.providerRef !== paymentId;
      if (outroPagamento) {
        if (novoStatus === "paid") {
          console.error("PAGAMENTO DUPLICADO: estornar um deles no painel do Mercado Pago", {
            orderId,
            pagamentoOriginal: row.providerRef,
            pagamentoDuplicado: paymentId,
          });
        }
        return;
      }
      // pago só muda se o MESMO pagamento for estornado
      if (novoStatus !== "refunded") return;
    }

    await tx
      .update(payments)
      .set({
        status: novoStatus,
        providerRef: paymentId ?? row.providerRef,
        providerMethod: pagamento.payment_type_id ?? null,
        ...(novoStatus === "paid"
          ? { paidAt: new Date(pagamento.date_approved ?? Date.now()) }
          : {}),
      })
      .where(eq(payments.id, row.id));

    if (novoStatus === "paid") {
      const [pedido] = await tx
        .select({ status: orders.status })
        .from(orders)
        .where(eq(orders.id, orderId))
        .limit(1);

      if (pedido?.status === "pending") {
        await tx.update(orders).set({ status: "confirmed" }).where(eq(orders.id, orderId));
        await tx.insert(orderStatusHistory).values({
          orderId,
          status: "confirmed",
          note: "Pagamento online aprovado.",
        });
      } else if (pedido?.status === "cancelled") {
        console.error("Pagamento MP: aprovado em pedido CANCELADO, reembolsar ou reativar", {
          orderId,
          paymentId,
        });
      }
    }
  });
}

// pergunta ao Mercado Pago quais pagamentos existem para o pedido e aplica o resultado
export async function sincronizarPagamentoDoPedido(orderId: string) {
  const resposta = await paymentApi().search({
    options: { external_reference: orderId, sort: "date_created", criteria: "desc" },
  });
  const lista = resposta.results ?? [];
  if (lista.length === 0) return;

  // aprovado vence recusado; do mais antigo para o mais novo, assim o duplicado é que fica marcado
  const aprovados = lista.filter((p) => p.status === "approved").reverse();
  if (aprovados.length > 0) {
    for (const p of aprovados) await aplicarPagamento(p);
    return;
  }

  // sem aprovado: um Pix ainda pendente vale mais do que uma tentativa recusada
  const pendente = lista.find((p) => p.status === "pending" || p.status === "in_process");
  await aplicarPagamento(pendente ?? lista[0]);
}