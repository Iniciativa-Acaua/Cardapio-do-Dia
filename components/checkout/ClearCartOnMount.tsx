// components/checkout/ClearCartOnMount.tsx
"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart-store";

// O pedido já está salvo: esvazia o carrinho do navegador.
export default function ClearCartOnMount() {
  useEffect(() => {
    useCart.getState().clear();
  }, []);

  return null;
}