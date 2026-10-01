// components/carrinho/CartView.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart-store";
import { formatBRL } from "@/lib/format";

const WHATSAPP_NUMBER = "5511999999999"; // troque pelo número real (DDI + DDD + número)

export default function CartView() {
  const { items, increase, decrease, removeItem, clear } = useCart();

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

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

  const message =
    "Olá! Gostaria de fazer o seguinte pedido:\n\n" +
    items
      .map((i) => `${i.quantity}x ${i.name} - ${formatBRL(i.price * i.quantity)}`)
      .join("\n") +
    `\n\nTotal: ${formatBRL(total)}`;

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      {/* Lista de itens */}
      <ul className="space-y-4">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-4 rounded-2xl bg-white p-4 text-neutral-900"
          >
            <Image
              src={item.image}
              alt={item.name}
              width={80}
              height={80}
              className="h-20 w-20 shrink-0 rounded-xl object-cover"
            />

            <div className="flex-1">
              <h2 className="font-bold">{item.name}</h2>
              <p className="text-sm text-neutral-600">{formatBRL(item.price)}</p>

              <div className="mt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => decrease(item.id)}
                  aria-label={`Diminuir quantidade de ${item.name}`}
                  className="h-8 w-8 rounded-full border border-neutral-300 font-bold transition hover:bg-neutral-100"
                >
                  −
                </button>
                <span className="min-w-6 text-center font-semibold">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => increase(item.id)}
                  aria-label={`Aumentar quantidade de ${item.name}`}
                  className="h-8 w-8 rounded-full border border-neutral-300 font-bold transition hover:bg-neutral-100"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <span className="font-extrabold">
                {formatBRL(item.price * item.quantity)}
              </span>
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="text-sm text-red-600 hover:underline"
              >
                Remover
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Resumo */}
      <aside className="h-fit rounded-2xl border border-white/10 bg-white/5 p-6 lg:sticky lg:top-24">
        <h2 className="mb-4 text-xl font-extrabold text-white">Resumo</h2>
        <div className="mb-6 flex items-center justify-between text-lg">
          <span className="text-neutral-300">Total</span>
          <span className="font-extrabold text-white">{formatBRL(total)}</span>
        </div>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-full bg-orange-500 px-6 py-3 text-center font-semibold text-white transition hover:bg-orange-600"
        >
          Finalizar pelo WhatsApp
        </a>
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