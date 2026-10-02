// app/pedido/[id]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ClearCartOnMount from "@/components/checkout/ClearCartOnMount";
import { getOrderConfirmation } from "@/lib/queries/orders";
import { formatCents } from "@/lib/format";
import { paymentLabels, statusLabels } from "@/lib/order-labels";

export const metadata: Metadata = {
  title: "Pedido | +Sabor",
  robots: { index: false }, // páginas de pedido não devem aparecer no Google
};

// o status muda ao longo do tempo, então nunca fica em cache
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

const timeFmt = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function PedidoPage({ params }: Props) {
  const { id } = await params;
  const data = await getOrderConfirmation(id);
  if (!data) notFound();

  const { order, lines, payment, history } = data;
  const isDelivery = order.fulfillmentType === "delivery";

  const whatsappNumber = process.env.WHATSAPP_NUMBER ?? "5511999999999";
  const message =
    `Olá! Acabei de fazer o pedido #${order.orderNumber} pelo site.\n\n` +
    lines
      .map((l) => {
        const extras = l.addons.length ? ` (${l.addons.map((a) => a.name).join(", ")})` : "";
        return `${l.quantity}x ${l.name}${extras} - ${formatCents(l.lineTotalCents)}`;
      })
      .join("\n") +
    `\n\nTotal: ${formatCents(order.totalCents)}\n` +
    `Nome: ${order.customerName}\n` +
    (isDelivery ? `Entrega: ${order.deliveryAddress}` : "Retirada no local");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <section className="mx-auto max-w-3xl px-6 py-12">
      <ClearCartOnMount />

      <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-orange-500">
        Pedido recebido
      </p>
      <h1 className="mb-2 text-4xl font-extrabold text-white">
        Pedido <span className="text-orange-500">#{order.orderNumber}</span>
      </h1>
      <p className="mb-8 text-neutral-300">
        Obrigado, {order.customerName.split(" ")[0]}! Guarde esta página: este endereço é o
        acompanhamento do seu pedido.
      </p>

      <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="mb-4 text-xl font-extrabold text-white">Acompanhamento</h2>
        <p className="mb-4 inline-block rounded-full bg-orange-500 px-4 py-1.5 text-sm font-semibold text-white">
          {statusLabels[order.status] ?? order.status}
        </p>
        <ol className="space-y-2 text-sm text-neutral-300">
          {history.map((h, i) => (
            <li key={i} className="flex justify-between">
              <span>{statusLabels[h.status] ?? h.status}</span>
              <time dateTime={h.createdAt.toISOString()}>{timeFmt.format(h.createdAt)}</time>
            </li>
          ))}
        </ol>
      </div>

      <div className="mb-8 rounded-2xl bg-white p-6 text-neutral-900">
        <h2 className="mb-4 text-xl font-extrabold">Itens</h2>
        <ul className="space-y-3">
          {lines.map((l) => (
            <li key={l.id} className="flex justify-between gap-4">
              <span>
                {l.quantity}x {l.name}
                {l.addons.length > 0 && (
                  <span className="block text-xs text-neutral-500">
                    + {l.addons.map((a) => a.name).join(", ")}
                  </span>
                )}
              </span>
              <span className="shrink-0 font-semibold">{formatCents(l.lineTotalCents)}</span>
            </li>
          ))}
        </ul>

        <dl className="mt-4 space-y-1 border-t border-neutral-200 pt-4 text-sm">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd>{formatCents(order.subtotalCents)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Entrega</dt>
            <dd>{isDelivery ? formatCents(order.deliveryFeeCents) : "Grátis"}</dd>
          </div>
          <div className="flex justify-between text-lg font-extrabold">
            <dt>Total</dt>
            <dd>{formatCents(order.totalCents)}</dd>
          </div>
        </dl>

        <div className="mt-4 space-y-1 border-t border-neutral-200 pt-4 text-sm text-neutral-700">
          <p>
            <strong>{isDelivery ? "Entrega em:" : "Retirada:"}</strong>{" "}
            {isDelivery ? order.deliveryAddress : "no local"}
          </p>
          {payment && (
            <p>
              <strong>Pagamento:</strong> {paymentLabels[payment.method] ?? payment.method} (na
              {isDelivery ? " entrega" : " retirada"})
            </p>
          )}
          {order.notes && (
            <p>
              <strong>Observações:</strong> {order.notes}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600"
        >
          Enviar pedido pelo WhatsApp
        </a>
        <Link
          href="/cardapio"
          className="rounded-full border border-white/20 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
        >
          Voltar ao cardápio
        </Link>
      </div>
    </section>
  );
}