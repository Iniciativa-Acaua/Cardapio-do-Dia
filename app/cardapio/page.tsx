// app/cardapio/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import ProductCard from "@/components/produto/ProdutosCard";
import { products, categories } from "@/lib/products";

export const metadata: Metadata = {
  title: "Cardápio | +Sabor",
  description: "Veja todos os pratos do +Sabor e monte o seu pedido.",
};

export default async function CardapioPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria } = await searchParams;
  const visible = categoria
    ? products.filter((p) => p.category === categoria)
    : products;

  const chip = (active: boolean) =>
    `rounded-full px-5 py-2 text-sm font-semibold transition ${
      active
        ? "bg-orange-500 text-white"
        : "border border-white/15 bg-white/5 text-white hover:border-orange-500"
    }`;

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="mb-6 text-4xl font-extrabold text-white">
        Nosso <span className="text-orange-500">cardápio</span>
      </h1>

      <nav aria-label="Categorias" className="mb-8 flex flex-wrap gap-3">
        <Link href="/cardapio" className={chip(!categoria)}>Todos</Link>
        {categories.map((c) => (
          <Link
            key={c}
            href={{ pathname: "/cardapio", query: { categoria: c } }}
            className={chip(categoria === c)}
          >
            {c}
          </Link>
        ))}
      </nav>

      {visible.length === 0 ? (
        <p className="text-neutral-300">Nenhum prato encontrado nessa categoria.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {visible.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}