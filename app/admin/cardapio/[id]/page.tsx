import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { categories, productAddons, products } from "@/db/schema";
import FormProduto from "@/components/admin/FormProduto";
import Interruptor from "@/components/admin/Interruptor";
import { exigirAdmin } from "@/lib/admin";
import { emReais } from "@/lib/preco";
import { alternarAdicional, criarAdicional, salvarAdicional } from "../actions";

export const dynamic = "force-dynamic";

const campo =
  "rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-orange-500";

export default async function EditarPrato({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ salvo?: string }>;
}) {
  await exigirAdmin();
  const { id } = await params;
  const { salvo } = await searchParams;
  if (!z.uuid().safeParse(id).success) notFound();

  const [produto] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!produto) notFound();

  const [cats, adicionais] = await Promise.all([
    db
      .select({ id: categories.id, name: categories.name })
      .from(categories)
      .orderBy(asc(categories.sortOrder), asc(categories.name)),
    db
      .select()
      .from(productAddons)
      .where(eq(productAddons.productId, id))
      .orderBy(asc(productAddons.name)),
  ]);

  return (
    <main className="max-w-2xl space-y-6">
      <Link href="/admin/cardapio" className="text-sm text-zinc-400 hover:text-orange-500">
        ← Cardápio
      </Link>
      <h1 className="text-2xl font-bold text-white">{produto.name}</h1>

      {salvo && (
        <p
          role="status"
          className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2.5 text-sm text-emerald-300"
        >
          Alterações salvas.
        </p>
      )}

      <FormProduto
        productId={produto.id}
        categorias={cats}
        inicial={{
          name: produto.name,
          description: produto.description,
          categoryId: produto.categoryId,
          price: emReais(produto.priceCents),
          imageUrl: produto.imageUrl,
          isAvailable: produto.isAvailable ? "on" : "",
          isFeatured: produto.isFeatured ? "on" : "",
        }}
      />

      <section className="rounded-xl border border-white/10 bg-neutral-900 p-5">
        <h2 className="mb-1 text-lg font-bold text-white">Adicionais</h2>
        <p className="mb-4 text-xs text-zinc-500">
          Desativar esconde o adicional do site sem apagar o histórico dos pedidos.
        </p>

        <ul className="space-y-3">
          {adicionais.map((a) => (
            <li
              key={a.id}
              className={`flex flex-wrap items-center gap-3 ${a.active ? "" : "opacity-60"}`}
            >
              <form
                action={salvarAdicional.bind(null, a.id, produto.id)}
                className="flex flex-1 flex-wrap items-center gap-2"
              >
                <input name="name" defaultValue={a.name} required minLength={2} className={`${campo} min-w-40 flex-1`} />
                <input
                  name="price"
                  defaultValue={emReais(a.priceCents)}
                  inputMode="decimal"
                  aria-label="Preço do adicional"
                  className={`${campo} w-24`}
                />
                <button
                  type="submit"
                  className="rounded-lg border border-white/15 px-3 py-2 text-sm text-zinc-200 hover:bg-white/5"
                >
                  Salvar
                </button>
              </form>
              <form action={alternarAdicional.bind(null, a.id, produto.id, !a.active)}>
                <label className="flex items-center gap-2 text-xs text-zinc-400">
                  Ativo
                  <Interruptor ligado={a.active} rotulo={`Ativo: ${a.name}`} />
                </label>
              </form>
            </li>
          ))}
          {adicionais.length === 0 && (
            <li className="text-sm text-zinc-400">Este prato ainda não tem adicionais.</li>
          )}
        </ul>

        <form
          action={criarAdicional.bind(null, produto.id)}
          className="mt-5 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4"
        >
          <input
            name="name"
            placeholder="Novo adicional"
            required
            minLength={2}
            className={`${campo} min-w-40 flex-1`}
          />
          <input
            name="price"
            placeholder="0,00"
            inputMode="decimal"
            aria-label="Preço do novo adicional"
            className={`${campo} w-24`}
          />
          <button
            type="submit"
            className="rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-600"
          >
            Adicionar
          </button>
        </form>
      </section>
    </main>
  );
}