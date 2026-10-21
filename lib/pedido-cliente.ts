import { corStatus, type StatusPedido } from "@/lib/admin-orders";
import { statusLabels } from "@/lib/order-labels";

export const STATUS_ABERTOS: StatusPedido[] = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "out_for_delivery",
];

export function estadoParaCliente(p: {
  status: StatusPedido;
  metodo: string | null;
  pagStatus: string | null;
}) {
  const onlineNaoPago = p.status === "pending" && p.metodo === "online" && p.pagStatus !== "paid";

  if (onlineNaoPago) {
    return p.pagStatus === "failed"
      ? { rotulo: "Pagamento não aprovado", classe: "bg-red-500/15 text-red-300", pagar: true }
      : { rotulo: "Aguardando pagamento", classe: "bg-amber-500/15 text-amber-300", pagar: true };
  }
  return { rotulo: statusLabels[p.status] ?? p.status, classe: corStatus[p.status], pagar: false };
}