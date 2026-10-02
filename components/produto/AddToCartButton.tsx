// components/produto/AddToCartButton.tsx
"use client";

import { useCart } from "@/lib/cart-store";
import type { ProductSummary } from "@/types/product";

type Props = {
  product: Pick<ProductSummary, "id" | "slug" | "name" | "priceCents" | "imageUrl">;
};

export default function AddToCartButton({ product }: Props) {
  const addItem = useCart((s) => s.addItem);

  return (
    <button
      type="button"
      onClick={() => addItem(product)}
      className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 active:scale-95"
    >
      Adicionar
    </button>
  );
}