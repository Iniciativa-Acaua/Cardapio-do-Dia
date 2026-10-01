// components/CartHydrator.tsx
"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart-store";

export default function CartHydrator() {
  useEffect(() => {
    useCart.persist.rehydrate();
  }, []);

  return null;
}