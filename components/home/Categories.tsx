// components/home/Categories.tsx
import Link from "next/link";
import { categories } from "@/lib/products";

export default function Categories() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <h2 className="mb-6 text-3xl font-extrabold text-white">
        Escolha por <span className="text-orange-500">categoria</span>
      </h2>
      <div className="flex flex-wrap gap-3">
        {categories.map((c) => (
          <Link
            key={c}
            href={{ pathname: "/cardapio", query: { categoria: c } }}
            className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-orange-500 hover:bg-orange-500"
          >
            {c}
          </Link>
        ))}
      </div>
    </section>
  );
}