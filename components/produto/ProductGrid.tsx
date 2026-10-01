// components/produto/ProductGrid.tsx
import ProductCard from "./ProdutosCard";
import { products } from "@/lib/products";

export default function ProductGrid() {
  const featured = [...products].sort((a, b) => b.rating - a.rating).slice(0, 4);

  return (
    <section id="destaques" className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="mb-8 text-3xl font-extrabold text-white">
        Destaques do <span className="text-orange-500">dia</span>
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {featured.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}