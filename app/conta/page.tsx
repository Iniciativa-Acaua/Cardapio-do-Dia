import Link from "next/link";
import { redirect } from "next/navigation";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { orders, payments } from "@/db/schema";
import BotaoSair from "@/components/auth/BotaoSair";
import { formatCents } from "@/lib/format";
import { iniciais } from "@/lib/iniciais";
import { botaoSecundario, cartao, eyebrow } from "@/lib/estilos";
import { estadoParaCliente, STATUS_ABERTOS } from "@/lib/pedido-cliente";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

const desde = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
  timeZone: "America/Sao_Paulo",
});
const dia = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  timeZone: "America/Sao_Paulo",
});

// conta como compra: não cancelado e, se for online, já pago
const valido = sql`(${orders.status} <> 'cancelled' and (${payments.id} is null or ${payments.method} <> 'online' or ${payments.status} = 'paid'))`;

const campos = {
  id: orders.id,
  orderNumber: orders.orderNumber,
  status: orders.status,
  totalCents: orders.totalCents,
  createdAt: orders.createdAt,
  metodo: payments.method,
  pagStatus: payments.status,
};

export default async function PaginaConta() {
  const session = await getSession();
  if (!session) redirect("/entrar?redirect=/conta");
  const { user } = session;

  const [[resumo], [ativo], recentes] = await Promise.all([
    db
      .select({
        pedidos: sql<number>`count(*) filter (where ${valido})::int`,
        gastoCents: sql<number>`coalesce(sum(${orders.totalCents}) filter (where ${valido}), 0)::int`,
      })
      .from(orders)
      .leftJoin(payments, eq(payments.orderId, orders.id))
      .where(eq(orders.userId, user.id)),
    db
      .select(campos)
      .from(orders)
      .leftJoin(payments, eq(payments.orderId, orders.id))
      .where(and(eq(orders.userId, user.id), inArray(orders.status, STATUS_ABERTOS)))
      .orderBy(desc(orders.createdAt))
      .limit(1),
    db
      .select(campos)
      .from(orders)
      .leftJoin(payments, eq(payments.orderId, orders.id))
      .where(eq(orders.userId, user.id))
      .orderBy(desc(orders.createdAt))
      .limit(3),
  ]);

  const estadoAtivo = ativo ? estadoParaCliente(ativo) : null;

  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <p className={eyebrow}>Minha conta</p>

      <div className="mb-8 flex items-center gap-5">
        <span className="grid size-16 shrink-0 place-items-center rounded-full bg-orange-500 text-xl font-extrabold text-white">
          {iniciais(user.name)}
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-4xl font-extrabold text-white">
            Olá, <span className="text-orange-500">{user.name.split(" ")[0]}</span>
          </h1>
          <p className="truncate text-neutral-300">
            {user.email} · cliente desde {desde.format(user.createdAt)}
          </p>
        </div>
      </div>

      {ativo && estadoAtivo && (
        <Link
          href={`/pedido/${ativo.id}`}
          className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-orange-500/40 bg-orange-500/10 p-5 transition hover:bg-orange-500/15"
        >
          <div>
            <p className="font-extrabold text-white">
              Pedido <span className="text-orange-500">#{ativo.orderNumber}</span> em andamento
            </p>
            <p className="text-sm text-neutral-300">{estadoAtivo.rotulo}</p>
          </div>
          <span className="text-sm font-semibold text-orange-500">
            {estadoAtivo.pagar ? "Finalizar pagamento →" : "Acompanhar →"}
          </span>
        </Link>
      )}

      <dl className="mb-8 grid gap-4 sm:grid-cols-2">
        <div className={cartao}>
          <dt className="text-sm text-neutral-400">Pedidos feitos</dt>
          <dd className="mt-1 text-3xl font-extrabold text-white">{resumo.pedidos}</dd>
        </div>
        <div className={cartao}>
          <dt className="text-sm text-neutral-400">Total gasto</dt>
          <dd className="mt-1 text-3xl font-extrabold text-white">{formatCents(resumo.gastoCents)}</dd>
        </div>
      </dl>

      <nav className="mb-8 grid gap-4 sm:grid-cols-2">
        <Link href="/conta/pedidos" className={`${cartao} group transition hover:border-orange-500`}>
          <h2 className="text-xl font-extrabold text-white">Meus pedidos</h2>
          <p className="mt-1 text-sm text-neutral-300">Acompanhe e consulte o histórico completo.</p>
          <span className="mt-4 inline-block text-sm font-semibold text-orange-500 transition-transform group-hover:translate-x-0.5">
            Ver pedidos →
          </span>
        </Link>
        <Link href="/cardapio" className={`${cartao} group transition hover:border-orange-500`}>
          <h2 className="text-xl font-extrabold text-white">Fazer um novo pedido</h2>
          <p className="mt-1 text-sm text-neutral-300">Veja o cardápio e escolha o que vai pedir hoje.</p>
          <span className="mt-4 inline-block text-sm font-semibold text-orange-500 transition-transform group-hover:translate-x-0.5">
            Ver cardápio →
          </span>
        </Link>
      </nav>

      {recentes.length > 0 && (
        <div className={`${cartao} mb-10`}>
          <div className="mb-2 flex items-center justify-between gap-3">
            <h2 className="text-xl font-extrabold text-white">Últimos pedidos</h2>
            <Link href="/conta/pedidos" className="text-sm font-semibold text-orange-500 hover:underline">
              Ver todos
            </Link>
          </div>
          <ul className="divide-y divide-white/10">
            {recentes.map((p) => {
              const e = estadoParaCliente(p);
              return (
                <li key={p.id}>
                  <Link
                    href={`/pedido/${p.id}`}
                    className="flex flex-wrap items-center justify-between gap-3 py-4 transition hover:text-orange-400"
                  >
                    <span className="font-semibold text-white">
                      #{p.orderNumber}
                      <span className="ml-3 text-sm font-normal text-neutral-400">
                        {dia.format(p.createdAt)}
                      </span>
                    </span>
                    <span className="flex items-center gap-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${e.classe}`}>
                        {e.rotulo}
                      </span>
                      <span className="font-semibold text-white">{formatCents(p.totalCents)}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <BotaoSair className={botaoSecundario} />
    </section>
  );
}