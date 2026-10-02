// components/produto/ProductPurchase.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-store";
import { formatCents } from "@/lib/format";
import type { ProductDetail } from "@/types/product";

export default function ProductPurchase({ product }: { product: ProductDetail }) {
  const addItem = useCart((s) => s.addItem);
  const [selected, setSelected] = useState<string[]>([]);
  const [added, setAdded] = useState(false);

  const chosen = product.addons.filter((a) => selected.includes(a.id));
  const totalCents =
    product.priceCents + chosen.reduce((sum, a) => sum + a.priceCents, 0);

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    setAdded(false);
  }

  function handleAdd() {
    addItem(product, chosen);
    setAdded(true);
  }

  return (
    <div className="space-y-6">
      {product.addons.length > 0 && (
        <fieldset>
          <legend className="mb-3 font-bold text-white">Adicionais</legend>
          <div className="space-y-2">
            {product.addons.map((a) => (
              <label
                key={a.id}
                className="flex cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition hover:border-orange-500"
              >
                <span className="flex items-center gap-3 text-neutral-200">
                  <input
                    type="checkbox"
                    checked={selected.includes(a.id)}
                    onChange={() => toggle(a.id)}
                    className="h-4 w-4 accent-orange-500"
                  />
                  {a.name}
                </span>
                <span className="text-sm text-neutral-300">+ {formatCents(a.priceCents)}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <button
        type="button"
        onClick={handleAdd}
        className="w-full rounded-full bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600 active:scale-[0.99]"
      >
        Adicionar ao carrinho • {formatCents(totalCents)}
      </button>

      <p role="status" aria-live="polite" className="min-h-5 text-sm text-neutral-300">
        {added && (
          <>
            Adicionado!{" "}
            <Link href="/carrinho" className="font-semibold text-orange-500 hover:underline">
              Ver carrinho
            </Link>
          </>
        )}
      </p>
    </div>
  );
}