"use client";

import { useCart } from "@/lib/cart-store";

export default function CartButton() {
  const count = useCart((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));

  return (
    <button
      type="button"
      aria-label={`Abrir carrinho (${count} itens)`}
      className="relative text-orange-500 transition hover:text-orange-400"
    >
      🛒
      {count > 0 && (
        <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
          {count}
        </span>
      )}
    </button>
  );
}