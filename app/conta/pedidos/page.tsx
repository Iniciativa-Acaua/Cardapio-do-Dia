import Link from "next/link";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { getSession } from "@/lib/session";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const dataHora = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

const statusLabel = {
  pending: "Aguardando confirmação",
  confirmed: "Confirmado",
  preparing: "Em preparo",
  ready: "Pronto",
  out_for_delivery: "Saiu para entrega",
  delivered: "Entregue",
  cancelled: "Cancelado",
} as const;

export default async function PaginaPedidos() {
  const session = await getSession();
  if (!session) redirect("/entrar?redirect=/conta/pedidos");

  const meusPedidos = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      totalCents: orders.totalCents,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(eq(orders.userId, session.user.id))
    .orderBy(desc(orders.createdAt))
    .limit(50);

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold">Meus pedidos</h1>

      {meusPedidos.length === 0 ? (
        <p>
          Você ainda não fez nenhum pedido. <Link href="/cardapio">Ver cardápio</Link>
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {meusPedidos.map((p) => (
            <li key={p.id}>
              <Link href={`/pedido/${p.id}`} className="flex justify-between gap-4">
                <span>
                  Pedido #{p.orderNumber} · {dataHora.format(p.createdAt)}
                </span>
                <span>
                  {statusLabel[p.status]} · {brl.format(p.totalCents / 100)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}