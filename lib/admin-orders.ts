import { paymentLabels } from "@/lib/order-labels";

export type StatusPedido =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export const rotuloAdmin: Record<StatusPedido, string> = {
  pending: "Novo",
  confirmed: "Confirmado",
  preparing: "Em preparo",
  ready: "Pronto",
  out_for_delivery: "Saiu para entrega",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

export const corStatus: Record<StatusPedido, string> = {
  pending: "bg-amber-500/15 text-amber-300",
  confirmed: "bg-sky-500/15 text-sky-300",
  preparing: "bg-orange-500/15 text-orange-300",
  ready: "bg-emerald-500/15 text-emerald-300",
  out_for_delivery: "bg-violet-500/15 text-violet-300",
  delivered: "bg-zinc-500/20 text-zinc-300",
  cancelled: "bg-red-500/15 text-red-300",
};

export const rotuloAcao: Record<StatusPedido, string> = {
  pending: "",
  confirmed: "Confirmar pedido",
  preparing: "Iniciar preparo",
  ready: "Marcar como pronto",
  out_for_delivery: "Saiu para entrega",
  delivered: "Marcar como entregue",
  cancelled: "Cancelar pedido",
};

// quais status podem vir depois do atual
export function proximosStatus(p: {
  status: StatusPedido;
  fulfillmentType: "delivery" | "pickup";
  paymentMethod: string | null;
  paymentStatus: string | null;
}): StatusPedido[] {
  const onlineNaoPago = p.paymentMethod === "online" && p.paymentStatus !== "paid";

  switch (p.status) {
    case "pending":
      return onlineNaoPago ? ["cancelled"] : ["confirmed", "cancelled"];
    case "confirmed":
      return ["preparing", "cancelled"];
    case "preparing":
      return ["ready", "cancelled"];
    case "ready":
      return p.fulfillmentType === "delivery"
        ? ["out_for_delivery", "cancelled"]
        : ["delivered", "cancelled"];
    case "out_for_delivery":
      return ["delivered", "cancelled"];
    default:
      return [];
  }
}

export function rotuloPagamento(p: {
  method: string | null;
  status: string | null;
  fulfillmentType: "delivery" | "pickup";
}) {
  if (!p.method) return "Sem pagamento";
  if (p.method === "online") {
    switch (p.status) {
      case "paid":
        return "Pago online";
      case "failed":
        return "Pagamento recusado";
      case "refunded":
        return "Estornado";
      default:
        return "Aguardando pagamento";
    }
  }
  const nome = paymentLabels[p.method] ?? p.method;
  if (p.status === "paid") return `${nome} (pago)`;
  return `${nome} na ${p.fulfillmentType === "delivery" ? "entrega" : "retirada"}`;
}

export const acentoStatus: Record<StatusPedido, string> = {
  pending: "border-l-amber-400",
  confirmed: "border-l-sky-400",
  preparing: "border-l-orange-400",
  ready: "border-l-emerald-400",
  out_for_delivery: "border-l-violet-400",
  delivered: "border-l-zinc-600",
  cancelled: "border-l-red-500",
};