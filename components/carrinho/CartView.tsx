// components/carrinho/CartView.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart-store";
import { formatCents } from "@/lib/format";


export default function CartView() {
  const { items, increase, decrease, removeItem, clear } = useCart();

  const totalCents = items.reduce((sum, i) => sum + i.unitPriceCents * i.quantity, 0);

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
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <ul className="space-y-4">
        {items.map((item) => (
          <li
            key={item.key}
            className="flex items-center gap-4 rounded-2xl bg-white p-4 text-neutral-900"
          >
            <Image
              src={item.imageUrl}
              alt={item.name}
              width={80}
              height={80}
              className="h-20 w-20 shrink-0 rounded-xl object-cover"
            />

            <div className="flex-1">
              <h2 className="font-bold">{item.name}</h2>
              {item.addons.length > 0 && (
                <p className="text-xs text-neutral-500">
                  + {item.addons.map((a) => a.name).join(", ")}
                </p>
              )}
              <p className="text-sm text-neutral-600">{formatCents(item.unitPriceCents)}</p>

              <div className="mt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => decrease(item.key)}
                  aria-label={`Diminuir quantidade de ${item.name}`}
                  className="h-8 w-8 rounded-full border border-neutral-300 font-bold transition hover:bg-neutral-100"
                >
                  −
                </button>
                <span className="min-w-6 text-center font-semibold">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => increase(item.key)}
                  aria-label={`Aumentar quantidade de ${item.name}`}
                  className="h-8 w-8 rounded-full border border-neutral-300 font-bold transition hover:bg-neutral-100"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <span className="font-extrabold">
                {formatCents(item.unitPriceCents * item.quantity)}
              </span>
              <button
                type="button"
                onClick={() => removeItem(item.key)}
                className="text-sm text-red-600 hover:underline"
              >
                Remover
              </button>
            </div>
          </li>
        ))}
      </ul>

      <aside className="h-fit rounded-2xl border border-white/10 bg-white/5 p-6 lg:sticky lg:top-24">
        <h2 className="mb-4 text-xl font-extrabold text-white">Resumo</h2>
        <div className="mb-6 flex items-center justify-between text-lg">
          <span className="text-neutral-300">Total</span>
          <span className="font-extrabold text-white">{formatCents(totalCents)}</span>
        </div>

        <Link
          href="/checkout"
          className="block rounded-full bg-orange-500 px-6 py-3 text-center font-semibold text-white transition hover:bg-orange-600"
        >
          Finalizar pedido
        </Link>
        <button
          type="button"
          onClick={clear}
          className="mt-3 w-full text-center text-sm text-neutral-400 hover:text-white"
        >
          Limpar carrinho
        </button>
      </aside>
    </div>
  );
}