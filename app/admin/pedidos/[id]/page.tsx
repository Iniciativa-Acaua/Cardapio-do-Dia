import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders, payments } from "@/db/schema";
import BotaoAcao from "@/components/admin/BotaoAcao";
import Icone from "@/components/admin/Icone";
import { CabecalhoPagina, Cartao } from "@/components/admin/ui";
import AtualizarAutomaticamente from "@/components/pedido/AtualizarAutomaticamente";
import { exigirEquipe } from "@/lib/admin";
import {
  corStatus,
  proximosStatus,
  rotuloAcao,
  rotuloAdmin,
  rotuloPagamento,
  type StatusPedido,
} from "@/lib/admin-orders";
import { formatCents } from "@/lib/format";
import { getOrderConfirmation } from "@/lib/queries/orders";
import { mudarStatus } from "../actions";

export const dynamic = "force-dynamic";

const quando = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});
const horaCurta = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  hour: "2-digit",
  minute: "2-digit",
});

function formatarTelefone(t: string) {
  const d = t.replace(/\D/g, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return t;
}

const botaoLink =
  "inline-flex items-center gap-2 rounded-xl border border-white/15 px-3.5 py-2 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/5";

export default async function PedidoAdmin({ params }: { params: Promise<{ id: string }> }) {
  await exigirEquipe();
  const { id } = await params;

  const data = await getOrderConfirmation(id);
  if (!data) notFound();
  const { order, lines, payment, history } = data;

  const [extra] = await db
    .select({ phone: orders.customerPhone, scheduledFor: orders.scheduledFor })
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);
  const [pag] = await db
    .select({ providerRef: payments.providerRef, paidAt: payments.paidAt })
    .from(payments)
    .where(eq(payments.orderId, id))
    .limit(1);

  const isDelivery = order.fulfillmentType === "delivery";
  const cancelado = order.status === "cancelled";

  const acoes = proximosStatus({
    status: order.status,
    fulfillmentType: order.fulfillmentType,
    paymentMethod: payment?.method ?? null,
    paymentStatus: payment?.status ?? null,
  });
  const avancos = acoes.filter((s) => s !== "cancelled");
  const podeCancelar = acoes.includes("cancelled");

  const onlineNaoPago =
    payment?.method === "online" && payment.status !== "paid" && order.status === "pending";
  const pagoOnline = payment?.method === "online" && payment.status === "paid";

  // linha do tempo
  const etapas: StatusPedido[] = isDelivery
    ? ["pending", "confirmed", "preparing", "ready", "out_for_delivery", "delivered"]
    : ["pending", "confirmed", "preparing", "ready", "delivered"];
  const rotuloEtapa: Record<StatusPedido, string> = {
    pending: "Recebido",
    confirmed: "Confirmado",
    preparing: "Em preparo",
    ready: "Pronto",
    out_for_delivery: "A caminho",
    delivered: isDelivery ? "Entregue" : "Retirado",
    cancelled: "Cancelado",
  };
  const idxAtual = etapas.indexOf(order.status);
  const entrou = (s: StatusPedido) => [...history].reverse().find((h) => h.status === s);

  const digitos = (extra?.phone ?? "").replace(/\D/g, "");
  const mapa = order.deliveryAddress
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.deliveryAddress)}`
    : null;

  return (
    <main>
      {onlineNaoPago && <AtualizarAutomaticamente intervaloMs={10000} />}

      <CabecalhoPagina
        voltar={{ href: "/admin/pedidos", rotulo: "Pedidos" }}
        titulo={
          <span className="inline-flex flex-wrap items-center gap-3">
            Pedido #{order.orderNumber}
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                onlineNaoPago ? "bg-amber-500/15 text-amber-300" : corStatus[order.status]
              }`}
            >
              {onlineNaoPago ? "Aguardando pagamento" : rotuloAdmin[order.status]}
            </span>
          </span>
        }
        subtitulo={`Feito em ${quando.format(order.createdAt)}`}
      />

      {cancelado && (
        <p
          role="status"
          className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          Este pedido foi cancelado.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Cartao titulo="Andamento">
            <ol
              className="grid"
              style={{ gridTemplateColumns: `repeat(${etapas.length}, minmax(0, 1fr))` }}
            >
              {etapas.map((e, i) => {
                const feita = Boolean(entrou(e));
                const finalizado = order.status === "delivered";
                const atual = !cancelado && !finalizado && i === idxAtual;
                const concluida = feita && !atual;
                const h = entrou(e);

                return (
                  <li key={e} className="relative flex flex-col items-center text-center">
                    {i > 0 && (
                      <span
                        aria-hidden="true"
                        className={`absolute top-4 right-1/2 h-0.5 w-full -translate-y-1/2 ${
                          feita || atual ? "bg-orange-500" : "bg-white/10"
                        }`}
                      />
                    )}
                    <span
                      className={`relative z-10 grid size-8 place-items-center rounded-full border-2 ${
                        concluida
                          ? "border-orange-500 bg-orange-500 text-white"
                          : atual
                            ? "border-orange-500 bg-neutral-900 text-orange-400"
                            : "border-white/15 bg-neutral-900 text-zinc-600"
                      }`}
                    >
                      {concluida ? (
                        <Icone nome="check" className="size-4" />
                      ) : (
                        <span className="size-2 rounded-full bg-current" />
                      )}
                    </span>
                    <span
                      className={`mt-2 text-xs font-medium ${
                        feita || atual ? "text-white" : "text-zinc-500"
                      }`}
                    >
                      {rotuloEtapa[e]}
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      {h ? horaCurta.format(h.createdAt) : "\u00A0"}
                    </span>
                  </li>
                );
              })}
            </ol>
          </Cartao>

          <Cartao titulo="Itens do pedido">
            {order.notes && (
              <p className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
                <strong>Observação do cliente:</strong> {order.notes}
              </p>
            )}
            <ul className="divide-y divide-white/10">
              {lines.map((l) => (
                <li key={l.id} className="flex justify-between gap-4 py-3 first:pt-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white">
                      <span className="mr-2 inline-grid min-w-7 place-items-center rounded-md bg-white/10 px-1.5 py-0.5 text-xs font-bold">
                        {l.quantity}x
                      </span>
                      {l.name}
                    </p>
                    {l.addons.length > 0 && (
                      <p className="mt-1 text-xs text-zinc-400">+ {l.addons.map((a) => a.name).join(", ")}</p>
                    )}
                  </div>
                  <span className="shrink-0 text-sm text-zinc-200">{formatCents(l.lineTotalCents)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-2 space-y-1.5 border-t border-white/10 pt-4 text-sm text-zinc-300">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd>{formatCents(order.subtotalCents)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Entrega</dt>
                <dd>{isDelivery ? formatCents(order.deliveryFeeCents) : "Grátis"}</dd>
              </div>
              <div className="flex justify-between pt-1 text-lg font-bold text-white">
                <dt>Total</dt>
                <dd>{formatCents(order.totalCents)}</dd>
              </div>
            </dl>
          </Cartao>

          <Cartao titulo="Histórico">
            <ol className="space-y-2 text-sm text-zinc-300">
              {history.map((h, i) => (
                <li key={i} className="flex justify-between gap-4">
                  <span>{rotuloAdmin[h.status]}</span>
                  <time dateTime={h.createdAt.toISOString()} className="text-zinc-500">
                    {quando.format(h.createdAt)}
                  </time>
                </li>
              ))}
            </ol>
          </Cartao>
        </div>

        <aside className="order-first space-y-6 lg:order-0 lg:sticky lg:top-24 lg:h-fit">
          {(avancos.length > 0 || podeCancelar) && (
            <Cartao titulo="Ações">
              {onlineNaoPago && (
                <p className="mb-3 rounded-lg bg-amber-500/10 p-3 text-xs text-amber-300">
                  Pagamento online ainda não confirmado. O pedido só pode ser confirmado depois de pago.
                </p>
              )}
              <div className="flex flex-col gap-2.5">
                {avancos.map((s) => (
                  <form key={s} action={mudarStatus.bind(null, order.id, s)}>
                    <BotaoAcao className="w-full">
                      {s === "delivered" && !isDelivery ? "Retirado pelo cliente" : rotuloAcao[s]}
                    </BotaoAcao>
                  </form>
                ))}
                {podeCancelar && (
                  <form action={mudarStatus.bind(null, order.id, "cancelled")}>
                    <BotaoAcao tom="perigo" confirmar="Cancelar este pedido?" className="w-full">
                      {rotuloAcao.cancelled}
                    </BotaoAcao>
                  </form>
                )}
              </div>
              {podeCancelar && pagoOnline && (
                <p className="mt-3 text-xs text-zinc-500">
                  Pedido pago online: se cancelar, o estorno é feito no painel do Mercado Pago.
                </p>
              )}
            </Cartao>
          )}

          <Cartao titulo="Cliente">
            <p className="text-base font-semibold text-white">{order.customerName}</p>

            {extra && (
              <div className="mt-3 flex flex-wrap gap-2">
                <a href={`tel:+55${digitos}`} className={botaoLink}>
                  <Icone nome="telefone" className="size-4" />
                  {formatarTelefone(extra.phone)}
                </a>
                <a
                  href={`https://wa.me/55${digitos}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${botaoLink} text-emerald-300`}
                >
                  <Icone nome="mensagem" className="size-4" />
                  WhatsApp
                </a>
              </div>
            )}

            <div className="mt-4 flex gap-3 border-t border-white/10 pt-4 text-sm">
              <Icone nome={isDelivery ? "pin" : "retirada"} className="mt-0.5 size-4 shrink-0 text-zinc-500" />
              <div className="min-w-0">
                <p className="text-xs text-zinc-500">{isDelivery ? "Entregar em" : "Retirada no local"}</p>
                {isDelivery && order.deliveryAddress && (
                  <>
                    <p className="text-zinc-200">{order.deliveryAddress}</p>
                    {mapa && (
                      <a
                        href={mapa}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block text-xs font-medium text-orange-500 hover:underline"
                      >
                        Abrir no mapa
                      </a>
                    )}
                  </>
                )}
              </div>
            </div>

            {extra?.scheduledFor && (
              <div className="mt-4 flex gap-3 border-t border-white/10 pt-4 text-sm">
                <Icone nome="relogio" className="mt-0.5 size-4 shrink-0 text-zinc-500" />
                <div>
                  <p className="text-xs text-zinc-500">Agendado para</p>
                  <p className="text-zinc-200">{quando.format(extra.scheduledFor)}</p>
                </div>
              </div>
            )}
          </Cartao>

          <Cartao titulo="Pagamento">
            <p className="font-medium text-white">
              {rotuloPagamento({
                method: payment?.method ?? null,
                status: payment?.status ?? null,
                fulfillmentType: order.fulfillmentType,
              })}
            </p>
            {pag?.paidAt && (
              <p className="mt-1 text-sm text-zinc-400">Aprovado em {quando.format(pag.paidAt)}</p>
            )}
            {pag?.providerRef && (
              <p className="mt-2 text-xs break-all text-zinc-500">
                Código no Mercado Pago: {pag.providerRef}
              </p>
            )}
            <p className="mt-3 text-xl font-bold text-white">{formatCents(order.totalCents)}</p>
          </Cartao>
        </aside>
      </div>
    </main>
  );
}