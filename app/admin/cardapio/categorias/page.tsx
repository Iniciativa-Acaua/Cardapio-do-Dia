import Link from "next/link";
import { asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import Interruptor from "@/components/admin/Interruptor";
import { exigirAdmin } from "@/lib/admin";
import { alternarCategoria, salvarCategoria } from "./actions";

export const dynamic = "force-dynamic";

const campo =
  "rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-orange-500";

export default async function AdminCategorias({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  await exigirAdmin();
  const { erro } = await searchParams;

  const lista = await db
    .select({
      id: categories.id,
      name: categories.name,
      sortOrder: categories.sortOrder,
      active: categories.active,
      pratos: sql<number>`count(${products.id})::int`,
    })
    .from(categories)
    .leftJoin(products, eq(products.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(asc(categories.sortOrder), asc(categories.name));

  return (
    <main className="max-w-2xl space-y-4">
      <Link href="/admin/cardapio" className="text-sm text-zinc-400 hover:text-orange-500">
        ← Cardápio
      </Link>
      <h1 className="text-2xl font-bold text-white">Categorias</h1>
      <p className="text-xs text-zinc-500">
        A ordem define a posição no cardápio (menor número aparece primeiro). Categorias não são
        apagadas: desative para esconder.
      </p>

      {erro && (
        <p
          role="alert"
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-300"
        >
          {erro}
        </p>
      )}

      <ul className="space-y-3">
        {lista.map((c) => (
          <li
            key={c.id}
            className={`flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-neutral-900 p-4 ${
              c.active ? "" : "opacity-60"
            }`}
          >
            <form
              action={salvarCategoria.bind(null, c.id)}
              className="flex flex-1 flex-wrap items-end gap-2"
            >
              <label className="flex min-w-40 flex-1 flex-col gap-1 text-xs text-zinc-400">
                Nome ({c.pratos} {c.pratos === 1 ? "prato" : "pratos"})
                <input name="name" defaultValue={c.name} required minLength={2} className={campo} />
              </label>
              <label className="flex w-24 flex-col gap-1 text-xs text-zinc-400">
                Ordem
                <input
                  name="sortOrder"
                  type="number"
                  min={0}
                  max={999}
                  defaultValue={c.sortOrder}
                  className={campo}
                />
              </label>
              <button
                type="submit"
                className="rounded-lg border border-white/15 px-3 py-2 text-sm text-zinc-200 hover:bg-white/5"
              >
                Salvar
              </button>
            </form>
            <form action={alternarCategoria.bind(null, c.id, !c.active)}>
              <label className="flex items-center gap-2 text-xs text-zinc-400">
                Ativa
                <Interruptor ligado={c.active} rotulo={`Ativa: ${c.name}`} />
              </label>
            </form>
          </li>
        ))}
      </ul>

      <form
        action={salvarCategoria.bind(null, null)}
        className="flex flex-wrap items-end gap-2 rounded-xl border border-dashed border-white/15 p-4"
      >
        <label className="flex min-w-40 flex-1 flex-col gap-1 text-xs text-zinc-400">
          Nova categoria
          <input name="name" required minLength={2} className={campo} />
        </label>
        <label className="flex w-24 flex-col gap-1 text-xs text-zinc-400">
          Ordem
          <input
            name="sortOrder"
            type="number"
            min={0}
            max={999}
            defaultValue={lista.length}
            className={campo}
          />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-600"
        >
          Adicionar
        </button>
      </form>
    </main>
  );
}