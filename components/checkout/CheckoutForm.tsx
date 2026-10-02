// components/checkout/CheckoutForm.tsx
"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { createOrder, type CheckoutState } from "@/app/checkout/actions";
import { useCart } from "@/lib/cart-store";
import { formatCents } from "@/lib/format";

type Zone = { id: string; name: string; feeCents: number; minOrderCents: number };

const initialState: CheckoutState = {};

const inputClass =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-neutral-400 focus:border-orange-500 focus:outline-none";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-neutral-200">{label}</span>
      {children}
      {error && (
        <span role="alert" className="mt-1 block text-xs text-red-400">
          {error}
        </span>
      )}
    </label>
  );
}

export default function CheckoutForm({ zones, open }: { zones: Zone[]; open: boolean }) {
  const [state, formAction, pending] = useActionState(createOrder, initialState);
  const items = useCart((s) => s.items);

  const [ready, setReady] = useState(false);
  const [fulfillment, setFulfillment] = useState<"delivery" | "pickup">("delivery");
  const [zoneId, setZoneId] = useState("");

  // espera o carrinho ser restaurado do navegador antes de decidir se está vazio
  useEffect(() => {
    setReady(useCart.persist.hasHydrated());
    return useCart.persist.onFinishHydration(() => setReady(true));
  }, []);

  const v = state.values ?? {};
  const fe = state.fieldErrors ?? {};

  const subtotalCents = items.reduce((sum, i) => sum + i.unitPriceCents * i.quantity, 0);
  const zone = zones.find((z) => z.id === zoneId);
  const feeCents = fulfillment === "delivery" && zone ? zone.feeCents : 0;

  const itemsJson = JSON.stringify(
    items.map((i) => ({
      productId: i.productId,
      addonIds: i.addons.map((a) => a.id),
      quantity: i.quantity,
    }))
  );

  if (!ready) {
    return <p className="text-neutral-400">Carregando seu carrinho...</p>;
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
        <p className="mb-6 text-neutral-300">Seu carrinho está vazio.</p>
        <Link
          href="/cardapio"
          className="rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
        >
          Ver cardápio
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <input type="hidden" name="items" value={itemsJson} />

      <div className="space-y-8">
        {state.error && (
          <div role="alert" className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
            {state.error}
          </div>
        )}

        <fieldset className="space-y-4">
          <legend className="mb-2 text-xl font-extrabold text-white">Seus dados</legend>
          <Field label="Nome" error={fe.customerName}>
            <input name="customerName" defaultValue={v.customerName} autoComplete="name" className={inputClass} />
          </Field>
          <Field label="Telefone (WhatsApp)" error={fe.customerPhone}>
            <input
              name="customerPhone"
              type="tel"
              defaultValue={v.customerPhone}
              autoComplete="tel"
              placeholder="(11) 91234-5678"
              className={inputClass}
            />
          </Field>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="mb-2 text-xl font-extrabold text-white">Entrega</legend>

          <div className="grid grid-cols-2 gap-3">
            {(
              [
                ["delivery", "Entrega"],
                ["pickup", "Retirada no local"],
              ] as const
            ).map(([value, label]) => (
              <label
                key={value}
                className={`cursor-pointer rounded-xl border px-4 py-3 text-center text-sm font-semibold transition ${
                  fulfillment === value
                    ? "border-orange-500 bg-orange-500 text-white"
                    : "border-white/15 bg-white/5 text-white hover:border-orange-500"
                }`}
              >
                <input
                  type="radio"
                  name="fulfillmentType"
                  value={value}
                  checked={fulfillment === value}
                  onChange={() => setFulfillment(value)}
                  className="sr-only"
                />
                {label}
              </label>
            ))}
          </div>

          {fulfillment === "delivery" && (
            <div className="space-y-4">
              <Field label="Bairro" error={fe.zoneId}>
                <select
                  name="zoneId"
                  value={zoneId}
                  onChange={(e) => setZoneId(e.target.value)}
                  className={`${inputClass} bg-neutral-900`}
                >
                  <option value="">Selecione...</option>
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name} • frete {formatCents(z.feeCents)}
                      {z.minOrderCents > 0 && ` • mínimo ${formatCents(z.minOrderCents)}`}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
                <Field label="Rua" error={fe.street}>
                  <input name="street" defaultValue={v.street} autoComplete="street-address" className={inputClass} />
                </Field>
                <Field label="Número" error={fe.number}>
                  <input name="number" defaultValue={v.number} className={inputClass} />
                </Field>
              </div>
              <Field label="Complemento (opcional)" error={fe.complement}>
                <input name="complement" defaultValue={v.complement} className={inputClass} />
              </Field>
            </div>
          )}
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="mb-2 text-xl font-extrabold text-white">Pagamento</legend>
          <Field label="Forma de pagamento (na entrega ou retirada)" error={fe.paymentMethod}>
            <select
              name="paymentMethod"
              defaultValue={v.paymentMethod ?? ""}
              className={`${inputClass} bg-neutral-900`}
            >
              <option value="">Selecione...</option>
              <option value="pix">Pix</option>
              <option value="credit_card">Cartão de crédito</option>
              <option value="debit_card">Cartão de débito</option>
              <option value="cash">Dinheiro</option>
            </select>
          </Field>
          <Field label="Observações (opcional)" error={fe.notes}>
            <textarea
              name="notes"
              rows={3}
              defaultValue={v.notes}
              placeholder="Ex.: sem cebola, troco para R$ 50..."
              className={inputClass}
            />
          </Field>
        </fieldset>
      </div>

      <aside className="h-fit rounded-2xl border border-white/10 bg-white/5 p-6 lg:sticky lg:top-24">
        <h2 className="mb-4 text-xl font-extrabold text-white">Resumo</h2>

        <ul className="mb-4 space-y-3 text-sm">
          {items.map((i) => (
            <li key={i.key} className="flex justify-between gap-3 text-neutral-200">
              <span>
                {i.quantity}x {i.name}
                {i.addons.length > 0 && (
                  <span className="block text-xs text-neutral-400">
                    + {i.addons.map((a) => a.name).join(", ")}
                  </span>
                )}
              </span>
              <span className="shrink-0">{formatCents(i.unitPriceCents * i.quantity)}</span>
            </li>
          ))}
        </ul>

        <dl className="space-y-2 border-t border-white/10 pt-4 text-sm text-neutral-300">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd>{formatCents(subtotalCents)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Entrega</dt>
            <dd>
              {fulfillment === "pickup"
                ? "Grátis"
                : zone
                  ? formatCents(zone.feeCents)
                  : "Escolha o bairro"}
            </dd>
          </div>
          <div className="flex justify-between pt-2 text-lg font-extrabold text-white">
            <dt>Total</dt>
            <dd>{formatCents(subtotalCents + feeCents)}</dd>
          </div>
        </dl>

        <button
          type="submit"
          disabled={pending || !open}
          className="mt-6 w-full rounded-full bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Enviando pedido..." : "Confirmar pedido"}
        </button>
        <Link href="/carrinho" className="mt-3 block text-center text-sm text-neutral-400 hover:text-white">
          Voltar ao carrinho
        </Link>
      </aside>
    </form>
  );
}