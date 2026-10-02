// components/home/Categories.tsx
import Link from "next/link";
import { getCategories } from "@/lib/queries/catalog";

export default async function Categories() {
  const categories = await getCategories();

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <h2 className="mb-6 text-3xl font-extrabold text-white">
        Escolha por <span className="text-orange-500">categoria</span>
      </h2>
      <div className="flex flex-wrap gap-3">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={{ pathname: "/cardapio", query: { categoria: c.slug } }}
            className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-orange-500 hover:bg-orange-500"
          >
            {c.name}
          </Link>
        ))}
      </div>
    </section>
  );
}