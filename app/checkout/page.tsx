// app/checkout/page.tsx
import type { Metadata } from "next";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import { getDeliveryZones, getOpenStatus } from "@/lib/queries/store";

export const metadata: Metadata = { title: "Finalizar pedido | +Sabor" };

// depende da hora atual (aberto/fechado), então nunca fica em cache
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const [zones, status] = await Promise.all([getDeliveryZones(), getOpenStatus()]);

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="mb-8 text-4xl font-extrabold text-white">
        Finalizar <span className="text-orange-500">pedido</span>
      </h1>

      {!status.open && (
        <div role="alert" className="mb-8 rounded-2xl border border-orange-500/40 bg-orange-500/10 p-4 text-orange-200">
          Estamos fechados no momento.
          {status.todayLabel && ` Hoje atendemos das ${status.todayLabel}.`} Você pode montar o
          carrinho, mas só conseguimos receber pedidos durante o horário de funcionamento.
        </div>
      )}

      <CheckoutForm zones={zones} open={status.open} />
    </section>
  );
}