// app/cardapio/[slug]/page.tsx
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductPurchase from "@/components/produto/ProductPurchase";
import { getApprovedReviews, getProductBySlug } from "@/lib/queries/catalog";
import { formatCents } from "@/lib/format";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return { title: `${product.name} | +Sabor`, description: product.description };
}

const stars = (n: number) => "★".repeat(n) + "☆".repeat(5 - n);

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const reviews = await getApprovedReviews(product.id);

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <Link href="/cardapio" className="mb-6 inline-block text-sm text-neutral-300 hover:text-orange-500">
        ← Voltar ao cardápio
      </Link>

      <div className="grid gap-10 md:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-neutral-800">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        <div className="space-y-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-orange-500">
              {product.category}
            </span>
            <h1 className="mt-1 text-4xl font-extrabold text-white">{product.name}</h1>
            {product.ratingAvg > 0 && (
              <p className="mt-2 text-sm text-neutral-300">
                <span className="text-orange-500" aria-hidden="true">★</span>{" "}
                {product.ratingAvg.toFixed(1)}
                {product.ratingCount > 0 &&
                  ` (${product.ratingCount} ${product.ratingCount === 1 ? "avaliação" : "avaliações"})`}
              </p>
            )}
          </div>

          <p className="text-neutral-300">{product.description}</p>
          <p className="text-3xl font-extrabold text-white">{formatCents(product.priceCents)}</p>

          <ProductPurchase product={product} />
        </div>
      </div>

      <section aria-labelledby="avaliacoes" className="mt-16">
        <h2 id="avaliacoes" className="mb-6 text-2xl font-extrabold text-white">
          Avaliações
        </h2>

        {reviews.length === 0 ? (
          <p className="text-neutral-300">Este prato ainda não foi avaliado.</p>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {reviews.map((r) => (
              <li key={r.id} className="rounded-2xl bg-white p-5 text-neutral-900">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-bold">{r.author.split(" ")[0]}</span>
                  <time dateTime={r.createdAt.toISOString()} className="text-xs text-neutral-500">
                    {r.createdAt.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}
                  </time>
                </div>
                <p className="mb-2 text-orange-500" aria-label={`${r.rating} de 5 estrelas`}>
                  {stars(r.rating)}
                </p>
                {r.comment && <p className="text-sm text-neutral-700">{r.comment}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}