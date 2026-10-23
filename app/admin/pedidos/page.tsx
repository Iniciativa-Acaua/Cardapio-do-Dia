import Link from "next/link";
import { and, asc, desc, eq, ilike, inArray, isNull, ne, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { orders, payments } from "@/db/schema";
import Icone from "@/components/admin/Icone";
import { CabecalhoPagina, EstadoVazio } from "@/components/admin/ui";
import AtualizarAutomaticamente from "@/components/pedido/AtualizarAutomaticamente";
import { exigirEquipe } from "@/lib/admin";
import {
  acentoStatus,
  corStatus,
  rotuloAdmin,
  rotuloPagamento,
  type StatusPedido,
} from "@/lib/admin-orders";
import { formatCents } from "@/lib/format";

export const dynamic = "force-dynamic";

const ABERTOS: StatusPedido[] = ["pending", "confirmed", "preparing", "ready", "out_for_delivery"];
const FINALIZADOS: StatusPedido[] = ["delivered", "cancelled"];

const quando = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

const filtros = [
  { chave: "abertos", rotulo: "Em aberto" },
  { chave: "aguardando", rotulo: "Aguardando pagamento" },
  { chave: "finalizados", rotulo: "Finalizados" },
  { chave: "todos", rotulo: "Todos" },
] as const;

function ha(data: Date, agora: number) {
  const min = Math.floor((agora - data.getTime()) / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h} h`;
  return quando.format(data);
}

export default async function AdminPedidos({
  searchParams,
}: {
  searchParams: Promise<{ filtro?: string; q?: string }>;
}) {
  await exigirEquipe();
  const { filtro: f, q: qBruto } = await searchParams;
  const filtro = filtros.find((x) => x.chave === f)?.chave ?? "abertos";
  const q = (qBruto ?? "").trim().slice(0, 60);
  const emBusca = q.length > 0;
  const agora = new Date().getTime();

  const emAberto = and(
    inArray(orders.status, ABERTOS),
    or(isNull(payments.id), ne(payments.method, "online"), eq(payments.status, "paid"))
  );
  const aguardando = and(
    eq(orders.status, "pending"),
    eq(payments.method, "online"),
    inArray(payments.status, ["pending", "failed"])
  );
  const finalizados = inArray(orders.status, FINALIZADOS);

  // a busca vale para todos os pedidos, independente da aba
  const numero = /^#?\d+$/.test(q) ? Number(q.replace("#", "")) : null;
  const busca: SQL | undefined = !emBusca
    ? undefined
    : numero !== null
      ? numero <= 2_147_483_647
        ? eq(orders.orderNumber, numero)
        : sql`false`
      : ilike(orders.customerName, `%${q.replace(/[\\%_]/g, "\\$&")}%`);

  const where = emBusca
    ? busca
    : filtro === "abertos"
      ? emAberto
      : filtro === "aguardando"
        ? aguardando
        : filtro === "finalizados"
          ? finalizados
          : undefined;

  const contar = async (w: SQL | undefined) => {
    const [r] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(orders)
      .leftJoin(payments, eq(payments.orderId, orders.id))
      .where(w);
    return r.n;
  };

  const [lista, nAbertos, nAguardando] = await Promise.all([
    db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        status: orders.status,
        fulfillmentType: orders.fulfillmentType,
        customerName: orders.customerName,
        totalCents: orders.totalCents,
        createdAt: orders.createdAt,
        metodo: payments.method,
        pagStatus: payments.status,
      })
      .from(orders)
      .leftJoin(payments, eq(payments.orderId, orders.id))
      .where(where)
      .orderBy(!emBusca && filtro === "abertos" ? asc(orders.createdAt) : desc(orders.createdAt))
      .limit(100),
    contar(emAberto),
    contar(aguardando),
  ]);

  const contagens: Record<string, number | undefined> = {
    abertos: nAbertos,
    aguardando: nAguardando,
  };
  const abertosSet = new Set<string>(ABERTOS);

  return (
    <main>
      <AtualizarAutomaticamente />

      <CabecalhoPagina
        titulo="Pedidos"
        subtitulo="A lista atualiza sozinha a cada 15 segundos."
        acao={
          <form action="/admin/pedidos" className="relative w-full sm:w-72">
            <Icone
              nome="busca"
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-500"
            />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Buscar nº ou nome do cliente"
              className="w-full rounded-xl border border-white/10 bg-neutral-900 py-2.5 pr-3 pl-9 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/40"
            />
          </form>
        }
      />

      <nav className="mb-6 flex flex-wrap gap-2">
        {filtros.map((x) => {
          const ativo = !emBusca && filtro === x.chave;
          return (
            <Link
              key={x.chave}
              href={`/admin/pedidos?filtro=${x.chave}`}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                ativo
                  ? "bg-orange-500 text-white"
                  : "border border-white/15 text-zinc-300 hover:bg-white/5"
              }`}
            >
              {x.rotulo}
              {contagens[x.chave] != null && (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${ativo ? "bg-black/20" : "bg-white/10"}`}
                >
                  {contagens[x.chave]}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {emBusca && (
        <p className="mb-4 flex items-center gap-3 text-sm text-zinc-400">
          {lista.length} {lista.length === 1 ? "resultado" : "resultados"} para “{q}”
          <Link href="/admin/pedidos" className="font-medium text-orange-500 hover:underline">
            Limpar busca
          </Link>
        </p>
      )}

      {lista.length === 0 ? (
        <EstadoVazio
          icone={emBusca ? "busca" : "pedidos"}
          titulo={emBusca ? "Nenhum pedido encontrado" : "Nenhum pedido aqui"}
          texto={
            emBusca
              ? "Confira o número ou o nome e tente de novo."
              : "Quando chegar um pedido, ele aparece nesta lista."
          }
        />
      ) : (
        <ul className="flex flex-col gap-2.5">
          {lista.map((o) => {
            const aguardandoPag =
              o.status === "pending" && o.metodo === "online" && o.pagStatus !== "paid";
            const novo = o.status === "pending" && !aguardandoPag;
            const andamento = abertosSet.has(o.status) && !aguardandoPag;
            const min = Math.floor((agora - o.createdAt.getTime()) / 60000);
            const corTempo =
              andamento && min >= 30 ? "text-red-400" : andamento && min >= 15 ? "text-amber-300" : "";
            const entrega = o.fulfillmentType === "delivery";

            return (
              <li key={o.id}>
                <Link
                  href={`/admin/pedidos/${o.id}`}
                  className={`grid items-center gap-3 rounded-xl border border-l-4 border-white/10 bg-neutral-900 p-4 transition-colors hover:bg-neutral-800/70 sm:grid-cols-[1fr_auto] ${
                    acentoStatus[o.status]
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {novo && (
                        <span className="relative flex size-2.5 shrink-0">
                          <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400 opacity-75" />
                          <span className="relative inline-flex size-2.5 rounded-full bg-amber-400" />
                        </span>
                      )}
                      <p className="font-semibold text-white">#{o.orderNumber}</p>
                      <p className="truncate text-sm text-zinc-300">{o.customerName}</p>
                    </div>

                    <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
                      <span className="inline-flex items-center gap-1.5">
                        <Icone nome={entrega ? "entrega" : "retirada"} className="size-3.5" />
                        {entrega ? "Entrega" : "Retirada"}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Icone nome="cartao" className="size-3.5" />
                        {rotuloPagamento({
                          method: o.metodo,
                          status: o.pagStatus,
                          fulfillmentType: o.fulfillmentType,
                        })}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 ${corTempo}`}>
                        <Icone nome="relogio" className="size-3.5" />
                        {ha(o.createdAt, agora)}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        aguardandoPag ? "bg-amber-500/15 text-amber-300" : corStatus[o.status]
                      }`}
                    >
                      {aguardandoPag ? "Aguardando pagamento" : rotuloAdmin[o.status]}
                    </span>
                    <span className="min-w-20 text-right font-semibold text-white">
                      {formatCents(o.totalCents)}
                    </span>
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