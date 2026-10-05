import Link from "next/link";
import { redirect } from "next/navigation";
import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { formatCents } from "@/lib/format";
import { getSession } from "@/lib/session";

const dataHora = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});

const statusInfo: Record<
  (typeof orders.$inferSelect)["status"],
  { rotulo: string; classe: string }
> = {
  pending: { rotulo: "Aguardando confirmação", classe: "bg-amber-500/15 text-amber-300" },
  confirmed: { rotulo: "Confirmado", classe: "bg-sky-500/15 text-sky-300" },
  preparing: { rotulo: "Em preparo", classe: "bg-orange-500/15 text-orange-300" },
  ready: { rotulo: "Pronto", classe: "bg-emerald-500/15 text-emerald-300" },
  out_for_delivery: { rotulo: "Saiu para entrega", classe: "bg-violet-500/15 text-violet-300" },
  delivered: { rotulo: "Entregue", classe: "bg-emerald-500/15 text-emerald-300" },
  cancelled: { rotulo: "Cancelado", classe: "bg-red-500/15 text-red-300" },
};

export default async function PaginaPedidos() {
  const session = await getSession();
  if (!session) redirect("/entrar?redirect=/conta/pedidos");

  const meusPedidos = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      fulfillmentType: orders.fulfillmentType,
      totalCents: orders.totalCents,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(eq(orders.userId, session.user.id))
    .orderBy(desc(orders.createdAt))
    .limit(50);

  const ids = meusPedidos.map((p) => p.id);
  const itens = ids.length
    ? await db
        .select({
          orderId: orderItems.orderId,
          name: orderItems.nameSnapshot,
          quantity: orderItems.quantity,
        })
        .from(orderItems)
        .where(inArray(orderItems.orderId, ids))
    : [];

  const itensPorPedido = new Map<string, { name: string; quantity: number }[]>();
  for (const i of itens) {
    const lista = itensPorPedido.get(i.orderId) ?? [];
    lista.push({ name: i.name, quantity: i.quantity });
    itensPorPedido.set(i.orderId, lista);
  }

  function resumoDosItens(orderId: string) {
    const lista = itensPorPedido.get(orderId) ?? [];
    const primeiros = lista.slice(0, 2).map((i) => `${i.quantity}× ${i.name}`);
    const resto = lista.length - 2;
    return resto > 0 ? `${primeiros.join(", ")} e mais ${resto}` : primeiros.join(", ");
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/conta" className="text-sm text-zinc-400 transition-colors hover:text-orange-500">
        ← Minha conta
      </Link>

      <div className="mt-4 mb-8 flex items-end justify-between gap-4">
        <h1 className="text-3xl font-bold text-white">Meus pedidos</h1>
        {meusPedidos.length > 0 && (
          <p className="text-sm text-zinc-400">
            {meusPedidos.length} {meusPedidos.length === 1 ? "pedido" : "pedidos"}
          </p>
        )}
      </div>

      {meusPedidos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/15 px-6 py-14 text-center">
          <p className="text-lg font-semibold text-white">Você ainda não fez nenhum pedido</p>
          <p className="mt-1 text-sm text-zinc-400">Quando fizer, ele vai aparecer aqui.</p>
          <Link
            href="/cardapio"
            className="mt-6 inline-block rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
          >
            Ver cardápio
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {meusPedidos.map((p) => {
            const status = statusInfo[p.status];
            return (
              <li key={p.id}>
                <Link
                  href={`/pedido/${p.id}`}
                  className="block rounded-xl border border-white/10 bg-neutral-900 p-5 transition-colors hover:border-orange-500/60"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-white">Pedido #{p.orderNumber}</p>
                      <p className="text-xs text-zinc-500">
                        {dataHora.format(p.createdAt)} ·{" "}
                        {p.fulfillmentType === "delivery" ? "Entrega" : "Retirada"}
                      </p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${status.classe}`}>
                      {status.rotulo}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-zinc-300">{resumoDosItens(p.id)}</p>

                  <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                    <span className="text-sm text-zinc-400">Total</span>
                    <span className="font-semibold text-white">{formatCents(p.totalCents)}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}