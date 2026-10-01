// app/carrinho/page.tsx
import type { Metadata } from "next";
import CartView from "@/components/carrinho/CartView";

export const metadata: Metadata = {
  title: "Carrinho | +Sabor",
  description: "Revise seu pedido e finalize pelo WhatsApp.",
};

export default function CarrinhoPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="mb-8 text-4xl font-extrabold text-white">
        Seu <span className="text-orange-500">carrinho</span>
      </h1>
      <CartView />
    </section>
  );
}