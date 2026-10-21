import Image from "next/image";
import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import Icone from "@/components/admin/Icone";
import Interruptor from "@/components/admin/Interruptor";
import { CabecalhoPagina, EstadoVazio } from "@/components/admin/ui";
import { exigirAdmin } from "@/lib/admin";
import { formatCents } from "@/lib/format";
import { alternarCampo } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminCardapio({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; q?: string }>;
}) {
  await exigirAdmin();
  const { categoria, q } = await searchParams;

  const [cats, lista] = await Promise.all([
    db.select().from(categories).orderBy(asc(categories.sortOrder), asc(categories.name)),
    db
      .select({
        id: products.id,
        name: products.name,
        priceCents: products.priceCents,
        imageUrl: products.imageUrl,
        isAvailable: products.isAvailable,
        isFeatured: products.isFeatured,
        ratingAvg: products.ratingAvg,
        ratingCount: products.ratingCount,
        categoria: categories.name,
        categoriaSlug: categories.slug,
      })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .orderBy(asc(categories.sortOrder), asc(categories.name), asc(products.name)),
  ]);

  const termo = (q ?? "").trim().toLowerCase().slice(0, 60);
  const visiveis = lista.filter(
    (p) =>
      (!categoria || p.categoriaSlug === categoria) &&
      (!termo || p.name.toLowerCase().includes(termo))
  );

  const porCategoria = new Map<string, number>();
  for (const p of lista) {
    porCategoria.set(p.categoriaSlug, (porCategoria.get(p.categoriaSlug) ?? 0) + 1);
  }
  const indisponiveis = lista.filter((p) => !p.isAvailable).length;

  const chips = [
    { slug: "", name: "Todas", total: lista.length, ativa: true },
    ...cats.map((c) => ({
      slug: c.slug,
      name: c.name,
      total: porCategoria.get(c.slug) ?? 0,
      ativa: c.active,
    })),
  ];

  return (
    <main>
      <CabecalhoPagina
        titulo="Cardápio"
        subtitulo={`${lista.length} ${lista.length === 1 ? "prato" : "pratos"}${
          indisponiveis > 0 ? ` · ${indisponiveis} indisponíveis` : ""
        }`}
        acao={
          <div className="flex gap-2">
            <Link
              href="/admin/cardapio/categorias"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/5"
            >
              <Icone nome="etiqueta" className="size-4" />
              Categorias
            </Link>
            <Link
              href="/admin/cardapio/novo"
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
            >
              <Icone nome="mais" className="size-4" />
              Novo prato
            </Link>
          </div>
        }
      />

      <div className="mb-6 space-y-4">
        <form action="/admin/cardapio" className="relative max-w-md">
          {categoria && <input type="hidden" name="categoria" value={categoria} />}
          <Icone
            nome="busca"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-500"
          />
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Buscar prato pelo nome"
            className="w-full rounded-xl border border-white/10 bg-neutral-900 py-2.5 pr-3 pl-9 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/40"
          />
        </form>

        <nav className="flex flex-wrap gap-2">
          {chips.map((c) => {
            const ativo = (categoria ?? "") === c.slug;
            return (
              <Link
                key={c.slug || "todas"}
                href={c.slug ? `/admin/cardapio?categoria=${c.slug}` : "/admin/cardapio"}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  ativo
                    ? "bg-orange-500 text-white"
                    : "border border-white/15 text-zinc-300 hover:bg-white/5"
                } ${c.ativa ? "" : "opacity-60"}`}
              >
                {c.name}
                <span className={`rounded-full px-2 py-0.5 text-xs ${ativo ? "bg-black/20" : "bg-white/10"}`}>
                  {c.total}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {visiveis.length === 0 ? (
        <EstadoVazio
          icone={lista.length === 0 ? "cardapio" : "busca"}
          titulo={lista.length === 0 ? "O cardápio está vazio" : "Nenhum prato encontrado"}
          texto={
            lista.length === 0
              ? "Cadastre o primeiro prato para ele aparecer no site."
              : "Confira o nome ou troque a categoria."
          }
          acao={
            lista.length === 0 ? (
              <Link
                href="/admin/cardapio/novo"
                className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
              >
                <Icone nome="mais" className="size-4" />
                Novo prato
              </Link>
            ) : undefined
          }
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visiveis.map((p) => (
            <li
              key={p.id}
              className="overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 transition-colors hover:border-white/20"
            >
              <Link
                href={`/admin/cardapio/${p.id}`}
                className="group relative block aspect-[4/3] overflow-hidden bg-neutral-800"
              >
                <Image
                  src={p.imageUrl}
                  alt=""
                  fill
                  sizes="(min-width: 1280px) 22vw, (min-width: 640px) 40vw, 90vw"
                  className={`object-cover transition-transform duration-300 group-hover:scale-105 ${
                    p.isAvailable ? "" : "opacity-60 grayscale"
                  }`}
                />
                <div className="absolute inset-x-0 top-0 flex justify-between gap-2 p-3">
                  {p.isFeatured ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-500 px-2.5 py-1 text-xs font-semibold text-white">
                      <Icone nome="estrela" className="size-3" />
                      Destaque
                    </span>
                  ) : (
                    <span />
                  )}
                  {!p.isAvailable && (
                    <span className="rounded-full bg-black/70 px-2.5 py-1 text-xs font-semibold text-zinc-200">
                      Indisponível
                    </span>
                  )}
                </div>
              </Link>

              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/admin/cardapio/${p.id}`}
                      className="block truncate font-semibold text-white hover:text-orange-400"
                    >
                      {p.name}
                    </Link>
                    <p className="text-xs text-zinc-500">{p.categoria}</p>
                  </div>
                  <p className="shrink-0 font-bold text-white">{formatCents(p.priceCents)}</p>
                </div>

                <p className="mt-2 text-xs text-zinc-500">
                  {p.ratingCount > 0
                    ? `★ ${p.ratingAvg.toFixed(1)} · ${p.ratingCount} ${
                        p.ratingCount === 1 ? "avaliação" : "avaliações"
                      }`
                    : "Sem avaliações ainda"}
                </p>

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                  <div className="flex items-center gap-4">
                    <form action={alternarCampo.bind(null, p.id, "isAvailable", !p.isAvailable)}>
                      <label className="flex items-center gap-2 text-xs text-zinc-400">
                        Disponível
                        <Interruptor ligado={p.isAvailable} rotulo={`Disponível: ${p.name}`} />
                      </label>
                    </form>
                    <form action={alternarCampo.bind(null, p.id, "isFeatured", !p.isFeatured)}>
                      <label className="flex items-center gap-2 text-xs text-zinc-400">
                        Destaque
                        <Interruptor ligado={p.isFeatured} rotulo={`Destaque: ${p.name}`} />
                      </label>
                    </form>
                  </div>
                  <Link
                    href={`/admin/cardapio/${p.id}`}
                    aria-label={`Editar ${p.name}`}
                    className="grid size-9 place-items-center rounded-lg border border-white/15 text-zinc-300 transition-colors hover:bg-white/5 hover:text-orange-400"
                  >
                    <Icone nome="editar" className="size-4" />
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}