// app/cardapio/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import ProductCard from "@/components/produto/ProdutosCard";
import { getCatalog, getCategories, type Ordem } from "@/lib/queries/catalog";

export const metadata: Metadata = {
  title: "Cardápio | +Sabor",
  description: "Veja todos os pratos do +Sabor e monte o seu pedido.",
};

const ordens: { value: Ordem; label: string }[] = [
  { value: "relevancia", label: "Relevância" },
  { value: "preco-asc", label: "Menor preço" },
  { value: "preco-desc", label: "Maior preço" },
  { value: "nota", label: "Melhor avaliados" },
];

function buildHref(p: { categoria?: string; q?: string; ordem?: string }) {
  const sp = new URLSearchParams();
  if (p.categoria) sp.set("categoria", p.categoria);
  if (p.q) sp.set("q", p.q);
  if (p.ordem && p.ordem !== "relevancia") sp.set("ordem", p.ordem);
  const qs = sp.toString();
  return qs ? `/cardapio?${qs}` : "/cardapio";
}

export default async function CardapioPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; q?: string; ordem?: string }>;
}) {
  const { categoria, q, ordem: ordemParam } = await searchParams;
  const ordem = (ordens.find((o) => o.value === ordemParam)?.value ?? "relevancia") as Ordem;

  const [categories, visible] = await Promise.all([
    getCategories(),
    getCatalog({ categoria, q, ordem }),
  ]);

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

      <form action="/cardapio" method="GET" role="search" className="mb-6 flex flex-wrap gap-3">
        {categoria && <input type="hidden" name="categoria" value={categoria} />}
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Buscar prato..."
          aria-label="Buscar prato"
          className="min-w-56 flex-1 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm text-white placeholder:text-neutral-400 focus:border-orange-500 focus:outline-none"
        />
        <select
          name="ordem"
          defaultValue={ordem}
          aria-label="Ordenar por"
          className="rounded-full border border-white/15 bg-neutral-900 px-4 py-2.5 text-sm text-white focus:border-orange-500 focus:outline-none"
        >
          {ordens.map((o) => (
            <option key={o.value} value={o.value} className="bg-neutral-900">
              {o.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-full bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
        >
          Buscar
        </button>
      </form>

      <nav aria-label="Categorias" className="mb-8 flex flex-wrap gap-3">
        <Link href={buildHref({ q, ordem })} className={chip(!categoria)}>
          Todos
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={buildHref({ categoria: c.slug, q, ordem })}
            className={chip(categoria === c.slug)}
          >
            {c.name}
          </Link>
        ))}
      </nav>

      <p className="mb-4 text-sm text-neutral-400" aria-live="polite">
        {visible.length} {visible.length === 1 ? "prato encontrado" : "pratos encontrados"}
      </p>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
          <p className="mb-4 text-neutral-300">Nenhum prato encontrado com esses filtros.</p>
          <Link
            href="/cardapio"
            className="rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            Limpar filtros
          </Link>
        </div>
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