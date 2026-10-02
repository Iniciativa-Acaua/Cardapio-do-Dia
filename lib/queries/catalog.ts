// lib/queries/catalog.ts
import "server-only";
import { cache } from "react";
import { and, asc, desc, eq, or, sql, type SQL, type SQLWrapper } from "drizzle-orm";
import { db } from "@/db";
import { categories, products, productAddons, reviews, users } from "@/db/schema";
import type { ProductDetail, ProductSummary } from "@/types/product";

export type Ordem = "relevancia" | "preco-asc" | "preco-desc" | "nota";

const summary = {
  id: products.id,
  slug: products.slug,
  name: products.name,
  description: products.description,
  category: categories.name,
  categorySlug: categories.slug,
  priceCents: products.priceCents,
  ratingAvg: products.ratingAvg,
  ratingCount: products.ratingCount,
  imageUrl: products.imageUrl,
};

const stripAccents = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const unaccent = (col: SQLWrapper) =>
  sql`translate(lower(${col}), 'áàâãäéèêëíìîïóòôõöúùûüç', 'aaaaaeeeeiiiiooooouuuuc')`;

const orderMap: Record<Ordem, SQL[]> = {
  relevancia: [sql`${products.isFeatured} desc`, asc(products.name)],
  "preco-asc": [asc(products.priceCents)],
  "preco-desc": [desc(products.priceCents)],
  nota: [desc(products.ratingAvg), asc(products.name)],
};

export const getCategories = cache(async () =>
  db
    .select({ id: categories.id, name: categories.name, slug: categories.slug })
    .from(categories)
    .where(eq(categories.active, true))
    .orderBy(asc(categories.sortOrder))
);

export async function getFeaturedProducts(limit = 4): Promise<ProductSummary[]> {
  return db
    .select(summary)
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(and(eq(products.isAvailable, true), eq(products.isFeatured, true)))
    .orderBy(desc(products.ratingAvg))
    .limit(limit);
}

export async function getCatalog({
  categoria,
  q,
  ordem = "relevancia",
}: {
  categoria?: string; // slug da categoria
  q?: string;
  ordem?: Ordem;
}): Promise<ProductSummary[]> {
  const term = q?.trim();
  const like = term ? `%${stripAccents(term).replace(/[\\%_]/g, "\\$&")}%` : null;

  return db
    .select(summary)
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(
      and(
        eq(products.isAvailable, true),
        categoria ? eq(categories.slug, categoria) : undefined,
        like
          ? or(
              sql`${unaccent(products.name)} like ${like}`,
              sql`${unaccent(products.description)} like ${like}`
            )
          : undefined
      )
    )
    .orderBy(...orderMap[ordem]);
}

export const getProductBySlug = cache(
  async (slug: string): Promise<ProductDetail | null> => {
    const [product] = await db
      .select(summary)
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(and(eq(products.slug, slug), eq(products.isAvailable, true)))
      .limit(1);

    if (!product) return null;

    const addons = await db
      .select({
        id: productAddons.id,
        name: productAddons.name,
        priceCents: productAddons.priceCents,
      })
      .from(productAddons)
      .where(and(eq(productAddons.productId, product.id), eq(productAddons.active, true)))
      .orderBy(asc(productAddons.priceCents));

    return { ...product, addons };
  }
);

export async function getApprovedReviews(productId: string) {
  return db
    .select({
      id: reviews.id,
      author: users.name,
      rating: reviews.rating,
      comment: reviews.comment,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .innerJoin(users, eq(reviews.userId, users.id))
    .where(and(eq(reviews.productId, productId), eq(reviews.status, "approved")))
    .orderBy(desc(reviews.createdAt))
    .limit(20);
}