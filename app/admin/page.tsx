import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders, payments } from "@/db/schema";
import { exigirEquipe } from "@/lib/admin";
import { corStatus, rotuloAdmin } from "@/lib/admin-orders";
import { formatCents } from "@/lib/format";

export const dynamic = "force-dynamic";

const TZ = "America/Sao_Paulo";
const dataSP = new Intl.DateTimeFormat("en-CA", { timeZone: TZ }); // AAAA-MM-DD
const diaSemana = new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, weekday: "short" });
const horaSP = new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, hour: "numeric", hourCycle: "h23" });
const quando = new Intl.DateTimeFormat("pt-BR", {
  timeZone: TZ,
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

// pedido que conta como venda: não cancelado e, se for online, já pago
const valido = sql`(${orders.status} <> 'cancelled' and (${payments.id} is null or ${payments.method} <> 'online' or ${payments.status} = 'paid'))`;
const inicioHoje = sql`(date_trunc('day', now() at time zone 'America/Sao_Paulo') at time zone 'America/Sao_Paulo')`;
const inicioOntem = sql`((date_trunc('day', now() at time zone 'America/Sao_Paulo') - interval '1 day') at time zone 'America/Sao_Paulo')`;
const inicio7dias = sql`((date_trunc('day', now() at time zone 'America/Sao_Paulo') - interval '6 days') at time zone 'America/Sao_Paulo')`;

function Variacao({ atual, anterior }: { atual: number; anterior: number }) {
  if (anterior === 0) {
    return (
      <span className="text-xs text-zinc-500">{atual > 0 ? "Sem vendas ontem" : "Sem dados de ontem"}</span>
    );
  }
  const pct = Math.round(((atual - anterior) / anterior) * 100);
  const sobe = pct >= 0;
  return (
    <span className={`text-xs font-medium ${sobe ? "text-emerald-400" : "text-red-400"}`}>
      {sobe ? "▲" : "▼"} {Math.abs(pct)}% vs. ontem
    </span>
  );
}

function Indicador({
  rotulo,
  valor,
  children,
}: {
  rotulo: string;
  valor: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-neutral-900 p-5">
      <p className="text-xs font-medium text-zinc-400">{rotulo}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-white">{valor}</p>
      <div className="mt-1 min-h-4">{children}</div>
    </div>
  );
}

function Painel({
  titulo,
  acao,
  children,
}: {
  titulo: string;
  acao?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-neutral-900 p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-white">{titulo}</h2>
        {acao}
      </div>
      {children}
    </section>
  );
}

export default async function AdminResumo() {
  const { user } = await exigirEquipe();

  const [
    [kpi],
    serieBruta,
    topPratos,
    recentes,
  ] = await Promise.all([
    db
      .select({
        novos: sql<number>`count(*) filter (where ${orders.status} = 'pending' and ${valido})::int`,
        emAndamento: sql<number>`count(*) filter (where ${orders.status} in ('pending','confirmed','preparing','ready','out_for_delivery') and ${valido})::int`,
        pedidosHoje: sql<number>`count(*) filter (where ${orders.createdAt} >= ${inicioHoje} and ${valido})::int`,
        vendasHoje: sql<number>`coalesce(sum(${orders.totalCents}) filter (where ${orders.createdAt} >= ${inicioHoje} and ${valido}), 0)::int`,
        pedidosOntem: sql<number>`count(*) filter (where ${orders.createdAt} >= ${inicioOntem} and ${orders.createdAt} < ${inicioHoje} and ${valido})::int`,
        vendasOntem: sql<number>`coalesce(sum(${orders.totalCents}) filter (where ${orders.createdAt} >= ${inicioOntem} and ${orders.createdAt} < ${inicioHoje} and ${valido}), 0)::int`,
      })
      .from(orders)
      .leftJoin(payments, eq(payments.orderId, orders.id))
      .where(
        sql`${orders.createdAt} >= ${inicioOntem} or ${orders.status} in ('pending','confirmed','preparing','ready','out_for_delivery')`
      ),
    db
      .select({
        dia: sql<string>`to_char(date_trunc('day', ${orders.createdAt} at time zone 'America/Sao_Paulo'), 'YYYY-MM-DD')`,
        pedidos: sql<number>`count(*)::int`,
        vendas: sql<number>`coalesce(sum(${orders.totalCents}), 0)::int`,
      })
      .from(orders)
      .leftJoin(payments, eq(payments.orderId, orders.id))
      .where(sql`${orders.createdAt} >= ${inicio7dias} and ${valido}`)
      .groupBy(sql`1`),
    db
      .select({
        nome: orderItems.nameSnapshot,
        qtd: sql<number>`sum(${orderItems.quantity})::int`,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(sql`${orders.createdAt} >= now() - interval '30 days' and ${orders.status} <> 'cancelled'`)
      .groupBy(orderItems.nameSnapshot)
      .orderBy(desc(sql`sum(${orderItems.quantity})`))
      .limit(5),
    db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        status: orders.status,
        customerName: orders.customerName,
        totalCents: orders.totalCents,
        createdAt: orders.createdAt,
        metodo: payments.method,
        pagStatus: payments.status,
      })
      .from(orders)
      .leftJoin(payments, eq(payments.orderId, orders.id))
      .orderBy(desc(orders.createdAt))
      .limit(6),
  ]);

  // últimos 7 dias, incluindo os que não tiveram nenhuma venda
  const hojeSP = dataSP.format(new Date());
  const porDia = new Map(serieBruta.map((r) => [r.dia, r]));
  const serie = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(`${hojeSP}T12:00:00-03:00`);
    d.setUTCDate(d.getUTCDate() - (6 - i));
    const dia = dataSP.format(d);
    const r = porDia.get(dia);
    return {
      dia,
      hoje: i === 6,
      rotulo: diaSemana.format(d).replace(".", ""),
      vendas: r?.vendas ?? 0,
      pedidos: r?.pedidos ?? 0,
    };
  });
  const maxVendas = Math.max(...serie.map((d) => d.vendas), 0);
  const total7 = serie.reduce((s, d) => s + d.vendas, 0);
  const maxQtd = topPratos[0]?.qtd ?? 0;

  const h = Number(horaSP.format(new Date()));
  const saudacao = h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
  const ticket = kpi.pedidosHoje > 0 ? Math.round(kpi.vendasHoje / kpi.pedidosHoje) : 0;
  const ticketOntem = kpi.pedidosOntem > 0 ? Math.round(kpi.vendasOntem / kpi.pedidosOntem) : 0;

  return (
    <main className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">
          {saudacao}, {user.name.split(" ")[0]}
        </h1>
        <p className="text-sm text-zinc-400">Veja como está o movimento de hoje.</p>
      </header>

      {kpi.novos > 0 && (
        <Link
          href="/admin/pedidos"
          className="flex items-center justify-between gap-3 rounded-2xl border border-orange-500/40 bg-orange-500/10 px-5 py-4 transition-colors hover:bg-orange-500/15"
        >
          <span className="font-semibold text-orange-300">
            {kpi.novos} {kpi.novos === 1 ? "pedido novo aguardando" : "pedidos novos aguardando"}{" "}
            confirmação
          </span>
          <span className="text-sm font-medium text-orange-400">Abrir pedidos →</span>
        </Link>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Indicador rotulo="Vendas hoje" valor={formatCents(kpi.vendasHoje)}>
          <Variacao atual={kpi.vendasHoje} anterior={kpi.vendasOntem} />
        </Indicador>
        <Indicador rotulo="Pedidos hoje" valor={String(kpi.pedidosHoje)}>
          <Variacao atual={kpi.pedidosHoje} anterior={kpi.pedidosOntem} />
        </Indicador>
        <Indicador rotulo="Ticket médio" valor={formatCents(ticket)}>
          <Variacao atual={ticket} anterior={ticketOntem} />
        </Indicador>
        <Indicador rotulo="Em andamento" valor={String(kpi.emAndamento)}>
          <span className="text-xs text-zinc-500">Ainda não entregues</span>
        </Indicador>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Painel
          titulo="Vendas dos últimos 7 dias"
          acao={<span className="text-sm font-semibold text-white">{formatCents(total7)}</span>}
        >
          <div className="flex items-end gap-2">
            {serie.map((d) => {
              const altura = maxVendas > 0 ? Math.max((d.vendas / maxVendas) * 100, d.vendas > 0 ? 4 : 0) : 0;
              return (
                <div key={d.dia} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-[11px] text-zinc-500">
                    {d.vendas > 0 ? formatCents(d.vendas).replace(",00", "") : ""}
                  </span>
                  <div className="flex h-36 w-full items-end">
                    <div
                      title={`${d.rotulo}: ${formatCents(d.vendas)} em ${d.pedidos} ${d.pedidos === 1 ? "pedido" : "pedidos"}`}
                      className={`w-full rounded-t-lg ${d.hoje ? "bg-orange-500" : "bg-orange-500/35"}`}
                      style={{ height: `${altura}%` }}
                    />
                  </div>
                  <span className={`text-xs capitalize ${d.hoje ? "font-semibold text-white" : "text-zinc-500"}`}>
                    {d.hoje ? "Hoje" : d.rotulo}
                  </span>
                </div>
              );
            })}
          </div>
          {maxVendas === 0 && (
            <p className="mt-4 text-center text-sm text-zinc-500">Ainda não há vendas nesse período.</p>
          )}
        </Painel>

        <Painel titulo="Mais pedidos (30 dias)">
          {topPratos.length === 0 ? (
            <p className="text-sm text-zinc-500">Ainda não há pedidos suficientes.</p>
          ) : (
            <ol className="space-y-4">
              {topPratos.map((p, i) => (
                <li key={p.nome}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                    <span className="truncate text-zinc-200">
                      <span className="mr-2 text-zinc-500">{i + 1}.</span>
                      {p.nome}
                    </span>
                    <span className="shrink-0 font-semibold text-white">{p.qtd}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-orange-500"
                      style={{ width: `${maxQtd > 0 ? (p.qtd / maxQtd) * 100 : 0}%` }}
                    />
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Painel>
      </div>

      <Painel
        titulo="Pedidos recentes"
        acao={
          <Link href="/admin/pedidos?filtro=todos" className="text-sm font-medium text-orange-500 hover:underline">
            Ver todos
          </Link>
        }
      >
        {recentes.length === 0 ? (
          <p className="text-sm text-zinc-500">Nenhum pedido ainda.</p>
        ) : (
          <ul className="divide-y divide-white/10">
            {recentes.map((o) => {
              const aguardandoPag =
                o.status === "pending" && o.metodo === "online" && o.pagStatus !== "paid";
              return (
                <li key={o.id}>
                  <Link
                    href={`/admin/pedidos/${o.id}`}
                    className="flex items-center justify-between gap-3 py-3 transition-colors hover:text-orange-400"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">
                        #{o.orderNumber} · {o.customerName}
                      </p>
                      <p className="text-xs text-zinc-500">{quando.format(o.createdAt)}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          aguardandoPag ? "bg-amber-500/15 text-amber-300" : corStatus[o.status]
                        }`}
                      >
                        {aguardandoPag ? "Aguardando pagamento" : rotuloAdmin[o.status]}
                      </span>
                      <span className="text-sm font-semibold text-white">{formatCents(o.totalCents)}</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Painel>
    </main>
  );
}