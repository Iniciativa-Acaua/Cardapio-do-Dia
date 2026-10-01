"use client";

import { useCart } from "@/lib/cart-store";

export default function CartBadge() {
  const count = useCart((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));

  if (count === 0) return null;

  return (
    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[11px] font-bold text-white">
      {count}
    </span>
  );
}