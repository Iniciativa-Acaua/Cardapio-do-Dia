import { and, asc, eq, inArray, lt } from "drizzle-orm";
import { db } from "@/db";
import { orderStatusHistory, orders, payments } from "@/db/schema";
import { sincronizarPagamentoDoPedido } from "@/lib/payments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MINUTOS_ANTES_DE_CONFERIR = 5;
// a preferência expira em 1h, mas um Pix já gerado pode continuar válido por mais tempo:
// por isso a folga grande antes de cancelar (confirme o prazo do Pix na documentação do Mercado Pago)
const HORAS_PARA_CANCELAR = 24;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("não autorizado", { status: 401 });
  }

  const agora = Date.now();
  const limiteConferir = new Date(agora - MINUTOS_ANTES_DE_CONFERIR * 60 * 1000);
  const limiteCancelar = new Date(agora - HORAS_PARA_CANCELAR * 60 * 60 * 1000);

  const pendentes = await db
    .select({ id: orders.id, createdAt: orders.createdAt })
    .from(orders)
    .innerJoin(payments, eq(payments.orderId, orders.id))
    .where(
      and(
        eq(orders.status, "pending"),
        eq(payments.method, "online"),
        inArray(payments.status, ["pending", "failed"]),
        lt(orders.createdAt, limiteConferir)
      )
    )
    .orderBy(asc(orders.createdAt))
    .limit(50);

  let conferidos = 0;
  let cancelados = 0;

  for (const p of pendentes) {
    try {
      await sincronizarPagamentoDoPedido(p.id);
      conferidos++;
    } catch (err) {
      // se não conseguiu conferir, NÃO cancela
      console.error("Cron: falha ao conferir pagamento", p.id, err);
      continue;
    }

    if (p.createdAt >= limiteCancelar) continue;

    // só cancela se, depois de conferir, o pedido continua pendente e sem pagamento aprovado
    await db.transaction(async (tx) => {
      const [pag] = await tx
        .select({ status: payments.status })
        .from(payments)
        .where(and(eq(payments.orderId, p.id), eq(payments.method, "online")))
        .limit(1);
      if (!pag || pag.status === "paid" || pag.status === "refunded") return;

      const [cancelado] = await tx
        .update(orders)
        .set({ status: "cancelled" })
        .where(and(eq(orders.id, p.id), eq(orders.status, "pending")))
        .returning({ id: orders.id });

      if (cancelado) {
        await tx.insert(orderStatusHistory).values({
          orderId: p.id,
          status: "cancelled",
          note: "Cancelado automaticamente: pagamento online não concluído.",
        });
        cancelados++;
      }
    });
  }

  return Response.json({ analisados: pendentes.length, conferidos, cancelados });
}