import Link from "next/link";
import { redirect } from "next/navigation";
import { count, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import BotaoSair from "@/components/auth/BotaoSair";
import { iniciais } from "@/lib/iniciais";
import { getSession } from "@/lib/session";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const desde = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
  timeZone: "America/Sao_Paulo",
});

function Resumo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-neutral-900 p-5">
      <dt className="text-xs text-zinc-400">{rotulo}</dt>
      <dd className="mt-1 text-2xl font-bold text-white">{valor}</dd>
    </div>
  );
}

export default async function PaginaConta() {
  const session = await getSession();
  if (!session) redirect("/entrar?redirect=/conta");
  const { user } = session;

  const [resumo] = await db
    .select({
      pedidos: count(),
      gastoCents: sql<number>`coalesce(sum(${orders.totalCents}) filter (where ${orders.status} <> 'cancelled'), 0)::int`,
    })
    .from(orders)
    .where(eq(orders.userId, user.id));

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <header className="flex items-center gap-5">
        <span className="grid size-16 shrink-0 place-items-center rounded-full bg-orange-500 text-xl font-bold text-white">
          {iniciais(user.name)}
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold text-white">{user.name}</h1>
          <p className="truncate text-sm text-zinc-400">{user.email}</p>
          <p className="mt-1 text-xs text-zinc-500">Cliente desde {desde.format(user.createdAt)}</p>
        </div>
      </header>

      <dl className="mt-8 grid grid-cols-2 gap-3">
        <Resumo rotulo="Pedidos feitos" valor={String(resumo.pedidos)} />
        <Resumo rotulo="Total gasto" valor={brl.format(resumo.gastoCents / 100)} />
      </dl>

      <nav className="mt-8 grid gap-3 sm:grid-cols-2">
        <Link
          href="/conta/pedidos"
          className="group rounded-xl border border-white/10 bg-neutral-900 p-5 transition-colors hover:border-orange-500/60"
        >
          <h2 className="font-semibold text-white">Meus pedidos</h2>
          <p className="mt-1 text-sm text-zinc-400">Acompanhe e consulte o histórico completo.</p>
          <span className="mt-4 inline-block text-sm font-medium text-orange-500 transition-transform group-hover:translate-x-0.5">
            Ver pedidos →
          </span>
        </Link>

        <Link
          href="/cardapio"
          className="group rounded-xl border border-white/10 bg-neutral-900 p-5 transition-colors hover:border-orange-500/60"
        >
          <h2 className="font-semibold text-white">Fazer um novo pedido</h2>
          <p className="mt-1 text-sm text-zinc-400">Veja o cardápio e escolha o que vai pedir hoje.</p>
          <span className="mt-4 inline-block text-sm font-medium text-orange-500 transition-transform group-hover:translate-x-0.5">
            Ver cardápio →
          </span>
        </Link>
      </nav>

      <div className="mt-10 border-t border-white/10 pt-6">
        <BotaoSair className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-red-500/60 hover:text-red-300" />
      </div>
    </main>
  );
}