import Link from "next/link";
import { redirect } from "next/navigation";
import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders, payments } from "@/db/schema";
import { formatCents } from "@/lib/format";
import { botaoPrimario, cartao, eyebrow } from "@/lib/estilos";
import { estadoParaCliente, STATUS_ABERTOS } from "@/lib/pedido-cliente";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

const dataHora = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});

type Pedido = {
  id: string;
  orderNumber: number;
  status: (typeof orders.$inferSelect)["status"];
  fulfillmentType: "delivery" | "pickup";
  totalCents: number;
  createdAt: Date;
  metodo: string | null;
  pagStatus: string | null;
};

function CartaoPedido({ p, resumo }: { p: Pedido; resumo: string }) {
  const e = estadoParaCliente(p);

  return (
    <li>
      <Link href={`/pedido/${p.id}`} className={`${cartao} block transition hover:border-orange-500`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xl font-extrabold text-white">
              Pedido <span className="text-orange-500">#{p.orderNumber}</span>
            </p>
            <p className="text-xs text-neutral-400">
              {dataHora.format(p.createdAt)} · {p.fulfillmentType === "delivery" ? "Entrega" : "Retirada"}
            </p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${e.classe}`}>{e.rotulo}</span>
        </div>

        {resumo && <p className="mt-3 text-sm text-neutral-300">{resumo}</p>}

        <div className="mt-4 flex items-center justify-between gap-4 border-t border-white/10 pt-4">
          <span className="text-sm font-semibold text-orange-500">
            {e.pagar ? "Finalizar pagamento →" : "Ver pedido →"}
          </span>
          <span className="text-lg font-extrabold text-white">{formatCents(p.totalCents)}</span>
        </div>
      </Link>
    </li>
  );
}

export default async function PaginaPedidos() {
  const session = await getSession();
  if (!session) redirect("/entrar?redirect=/conta/pedidos");

  const meusPedidos: Pedido[] = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      fulfillmentType: orders.fulfillmentType,
      totalCents: orders.totalCents,
      createdAt: orders.createdAt,
      metodo: payments.method,
      pagStatus: payments.status,
    })
    .from(orders)
    .leftJoin(payments, eq(payments.orderId, orders.id))
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

  const abertos = new Set<string>(STATUS_ABERTOS);
  const emAndamento = meusPedidos.filter((p) => abertos.has(p.status));
  const anteriores = meusPedidos.filter((p) => !abertos.has(p.status));

  return (
    <section className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/conta" className="text-sm text-neutral-400 transition-colors hover:text-orange-500">
        ← Minha conta
      </Link>

      <p className={`${eyebrow} mt-6`}>Histórico</p>
      <h1 className="mb-2 text-4xl font-extrabold text-white">
        Meus <span className="text-orange-500">pedidos</span>
      </h1>
      <p className="mb-8 text-neutral-300">
        {meusPedidos.length === 0
          ? "Quando você fizer um pedido, ele aparece aqui."
          : `${meusPedidos.length} ${meusPedidos.length === 1 ? "pedido" : "pedidos"} até agora.`}
      </p>

      {meusPedidos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 px-6 py-14 text-center">
          <p className="text-lg font-extrabold text-white">Você ainda não fez nenhum pedido</p>
          <p className="mt-1 text-sm text-neutral-400">Que tal começar pelo cardápio?</p>
          <Link href="/cardapio" className={`${botaoPrimario} mt-6`}>
            Ver cardápio
          </Link>
        </div>
      ) : (
        <div className="space-y-10">
          {emAndamento.length > 0 && (
            <div>
              <h2 className="mb-4 text-xl font-extrabold text-white">Em andamento</h2>
              <ul className="space-y-3">
                {emAndamento.map((p) => (
                  <CartaoPedido key={p.id} p={p} resumo={resumoDosItens(p.id)} />
                ))}
              </ul>
            </div>
          )}

          {anteriores.length > 0 && (
            <div>
              <h2 className="mb-4 text-xl font-extrabold text-white">Anteriores</h2>
              <ul className="space-y-3">
                {anteriores.map((p) => (
                  <CartaoPedido key={p.id} p={p} resumo={resumoDosItens(p.id)} />
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}