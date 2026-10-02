// db/seed.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { inArray } from "drizzle-orm";
import { Pool } from "pg";
import { categories, products, productAddons, businessHours } from "./schema";
import { products as legacy } from "../lib/products";

const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle({ client: pool });

  // categorias
  const names = [...new Set(legacy.map((p) => p.category))];
  await db
    .insert(categories)
    .values(names.map((name, i) => ({ name, slug: slugify(name), sortOrder: i })))
    .onConflictDoNothing();
  const allCategories = await db.select().from(categories);
  const categoryId = new Map(allCategories.map((c) => [c.name, c.id]));

  // pratos (preço em centavos)
  await db
    .insert(products)
    .values(
      legacy.map((p) => ({
        categoryId: categoryId.get(p.category)!,
        name: p.name,
        slug: p.slug,
        description: p.description,
        priceCents: Math.round(p.price * 100),
        imageUrl: p.image,
        isFeatured: true,
        ratingAvg: p.rating,
      }))
    )
    .onConflictDoNothing();
  const allProducts = await db
    .select({ id: products.id, slug: products.slug })
    .from(products);
  const productId = new Map(allProducts.map((p) => [p.slug, p.id]));

  // adicionais (recria para não duplicar)
  const ids = legacy.map((p) => productId.get(p.slug)!).filter(Boolean);
  await db.delete(productAddons).where(inArray(productAddons.productId, ids));
  const addonRows = legacy.flatMap((p) =>
    (p.addons ?? []).map((a) => ({
      productId: productId.get(p.slug)!,
      name: a.name,
      priceCents: Math.round(a.price * 100),
    }))
  );
  if (addonRows.length) await db.insert(productAddons).values(addonRows);

  // horário de funcionamento (0 = domingo)
  await db
    .insert(businessHours)
    .values([
      ...[1, 2, 3, 4, 5].map((weekday) => ({ weekday, opensAt: "11:00", closesAt: "22:00" })),
      { weekday: 6, opensAt: "11:00", closesAt: "23:00" },
      { weekday: 0, opensAt: "11:00", closesAt: "20:00" },
    ])
    .onConflictDoNothing();

  await pool.end();
  console.log("Seed concluído.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});