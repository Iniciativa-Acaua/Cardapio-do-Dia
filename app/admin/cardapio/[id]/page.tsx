import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { categories, productAddons, products } from "@/db/schema";
import AvisoTemporario from "@/components/admin/AvisoTemporario";
import FormProduto from "@/components/admin/FormProduto";
import Interruptor from "@/components/admin/Interruptor";
import { CabecalhoPagina, Cartao } from "@/components/admin/ui";
import { exigirAdmin } from "@/lib/admin";
import { emReais } from "@/lib/preco";
import { alternarAdicional, criarAdicional, salvarAdicional } from "../actions";

export const dynamic = "force-dynamic";

const campo =
  "rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-white outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30";

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
    <main>
      <CabecalhoPagina
        voltar={{ href: "/admin/cardapio", rotulo: "Cardápio" }}
        titulo={produto.name}
        subtitulo="Edite os dados do prato e os adicionais que o cliente pode escolher."
      />

      {salvo && <AvisoTemporario>Alterações salvas.</AvisoTemporario>}

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

      <Cartao titulo="Adicionais" className="mt-6 max-w-3xl">
        <p className="-mt-2 mb-5 text-xs text-zinc-500">
          Desativar esconde o adicional do site sem apagar o histórico dos pedidos.
        </p>

        <ul className="space-y-3">
          {adicionais.map((a) => (
            <li
              key={a.id}
              className={`flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-neutral-950/50 p-3 ${
                a.active ? "" : "opacity-60"
              }`}
            >
              <form
                action={salvarAdicional.bind(null, a.id, produto.id)}
                className="flex flex-1 flex-wrap items-center gap-2"
              >
                <input
                  name="name"
                  defaultValue={a.name}
                  required
                  minLength={2}
                  aria-label="Nome do adicional"
                  className={`${campo} min-w-40 flex-1`}
                />
                <input
                  name="price"
                  defaultValue={emReais(a.priceCents)}
                  inputMode="decimal"
                  aria-label="Preço do adicional"
                  className={`${campo} w-24`}
                />
                <button
                  type="submit"
                  className="rounded-lg border border-white/15 px-3 py-2 text-sm text-zinc-200 transition-colors hover:bg-white/5"
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
            <li className="rounded-xl border border-dashed border-white/15 px-4 py-6 text-center text-sm text-zinc-400">
              Este prato ainda não tem adicionais.
            </li>
          )}
        </ul>

        <form
          action={criarAdicional.bind(null, produto.id)}
          className="mt-5 flex flex-wrap items-center gap-2 border-t border-white/10 pt-5"
        >
          <input
            name="name"
            placeholder="Novo adicional (ex.: Bacon)"
            required
            minLength={2}
            aria-label="Nome do novo adicional"
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
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
          >
            Adicionar
          </button>
        </form>
      </Cartao>
    </main>
  );
}