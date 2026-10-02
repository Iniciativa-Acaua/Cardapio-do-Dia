// components/produto/ProductCard.tsx
import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "./AddToCartButton";
import { formatCents } from "@/lib/format";
import type { ProductSummary } from "@/types/product";

export default function ProductCard({ product }: { product: ProductSummary }) {
  const href = `/cardapio/${product.slug}`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white text-neutral-900 shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link
        href={href}
        aria-label={`Ver detalhes de ${product.name}`}
        className="relative block aspect-[4/3] w-full overflow-hidden bg-neutral-200"
      >
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        {product.ratingAvg > 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
            ★ {product.ratingAvg.toFixed(1)}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-orange-600">
          {product.category}
        </span>
        <h3 className="text-lg font-bold leading-tight">
          <Link href={href} className="hover:text-orange-600">
            {product.name}
          </Link>
        </h3>
        <p className="line-clamp-2 text-sm text-neutral-600">{product.description}</p>

        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="text-xl font-extrabold">{formatCents(product.priceCents)}</span>
          <AddToCartButton product={product} />
        </div>
      </div>
    </article>
  );
}