import Image from "next/image";
import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import Interruptor from "@/components/admin/Interruptor";
import { exigirAdmin } from "@/lib/admin";
import { formatCents } from "@/lib/format";
import { alternarCampo } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminCardapio({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  await exigirAdmin();
  const { categoria } = await searchParams;

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

  const visiveis = categoria ? lista.filter((p) => p.categoriaSlug === categoria) : lista;

  return (
    <main>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-white">
          Cardápio <span className="text-base font-normal text-zinc-500">({lista.length} pratos)</span>
        </h1>
        <div className="flex gap-2">
          <Link
            href="/admin/cardapio/categorias"
            className="rounded-lg border border-white/15 px-4 py-2.5 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/5"
          >
            Categorias
          </Link>
          <Link
            href="/admin/cardapio/novo"
            className="rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
          >
            Novo prato
          </Link>
        </div>
      </div>

      <nav className="mb-6 flex flex-wrap gap-2">
        {[{ slug: "", name: "Todas" }, ...cats].map((c) => (
          <Link
            key={c.slug || "todas"}
            href={c.slug ? `/admin/cardapio?categoria=${c.slug}` : "/admin/cardapio"}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              (categoria ?? "") === c.slug
                ? "bg-orange-500 text-white"
                : "border border-white/15 text-zinc-300 hover:bg-white/5"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </nav>

      {visiveis.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/15 px-6 py-12 text-center text-sm text-zinc-400">
          Nenhum prato aqui.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {visiveis.map((p) => (
            <li
              key={p.id}
              className={`grid items-center gap-3 rounded-xl border border-white/10 bg-neutral-900 p-3 sm:grid-cols-[56px_1fr_auto] ${
                p.isAvailable ? "" : "opacity-60"
              }`}
            >
              <Image
                src={p.imageUrl}
                alt=""
                width={56}
                height={56}
                className="size-14 rounded-lg object-cover"
              />

              <div className="min-w-0">
                <Link
                  href={`/admin/cardapio/${p.id}`}
                  className="block truncate font-medium text-white hover:text-orange-400"
                >
                  {p.name}
                </Link>
                <p className="text-xs text-zinc-500">
                  {p.categoria} · {formatCents(p.priceCents)}
                  {p.ratingCount > 0 && ` · ${p.ratingAvg.toFixed(1)} (${p.ratingCount})`}
                </p>
              </div>

              <div className="flex items-center gap-5">
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
                <Link
                  href={`/admin/cardapio/${p.id}`}
                  className="text-sm font-medium text-orange-500 hover:underline"
                >
                  Editar
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}