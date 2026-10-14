import { drizzle } from "drizzle-orm/node-postgres";
import { eq, sql } from "drizzle-orm";
import { Pool } from "pg";
import { businessHours, categories, deliveryZones, productAddons, products } from "./schema";
import { seedCategories, seedZones } from "./seed-data";

// horário de funcionamento (0 = domingo): ajuste para o horário real do restaurante
const horarios = [
  ...[1, 2, 3, 4, 5].map((weekday) => ({ weekday, opensAt: "11:00", closesAt: "22:00" })),
  { weekday: 6, opensAt: "11:00", closesAt: "23:00" },
  { weekday: 0, opensAt: "11:00", closesAt: "20:00" },
];

const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL não definida.");

  console.log(`Banco de destino: ${new URL(url).hostname}`);
  if (process.env.CONFIRMAR_CATALOGO !== "sim") {
    throw new Error(
      "Confira o banco acima. Se estiver certo, rode de novo com CONFIRMAR_CATALOGO=sim."
    );
  }

  const pool = new Pool({ connectionString: url });
  const db = drizzle({ client: pool });

  // categorias (atualiza pelo slug)
  await db
    .insert(categories)
    .values(seedCategories.map((c, i) => ({ name: c.name, slug: slugify(c.name), sortOrder: i })))
    .onConflictDoUpdate({
      target: categories.slug,
      set: { name: sql`excluded.name`, sortOrder: sql`excluded.sort_order` },
    });
  const categoryId = new Map((await db.select().from(categories)).map((c) => [c.name, c.id]));

  // pratos (atualiza pelo slug; foto, destaque, estoque e disponibilidade ficam como estão no banco)
  const pratos = seedCategories.flatMap((c) =>
    c.items.map(([name, price, description], idx) => ({
      categoryId: categoryId.get(c.name)!,
      name,
      slug: slugify(name),
      description,
      priceCents: Math.round(price * 100),
      imageUrl: "/prato.jpg",
      isFeatured: idx === 0,
    }))
  );
  await db
    .insert(products)
    .values(pratos)
    .onConflictDoUpdate({
      target: products.slug,
      set: {
        name: sql`excluded.name`,
        description: sql`excluded.description`,
        priceCents: sql`excluded.price_cents`,
        categoryId: sql`excluded.category_id`,
        updatedAt: sql`now()`,
      },
    });
  const idBySlug = new Map((await db.select().from(products)).map((p) => [p.slug, p.id]));

  // adicionais: só para pratos que ainda não têm nenhum (nunca apaga os existentes)
  const comAdicionais = new Set((await db.select().from(productAddons)).map((a) => a.productId));
  const adicionais = seedCategories.flatMap((c) =>
    c.items.flatMap(([name]) => {
      const productId = idBySlug.get(slugify(name))!;
      if (comAdicionais.has(productId)) return [];
      return c.addons.map(([addonName, price]) => ({
        productId,
        name: addonName,
        priceCents: Math.round(price * 100),
      }));
    })
  );
  if (adicionais.length) await db.insert(productAddons).values(adicionais);

  // bairros e taxas de entrega (atualiza pelo bairro)
  await db
    .insert(deliveryZones)
    .values(seedZones)
    .onConflictDoUpdate({
      target: deliveryZones.neighborhood,
      set: {
        name: sql`excluded.name`,
        feeCents: sql`excluded.fee_cents`,
        minOrderCents: sql`excluded.min_order_cents`,
      },
    });

  // horários (não sobrescreve: para mudar um horário depois, edite a linha no banco)
  await db.insert(businessHours).values(horarios).onConflictDoNothing();

  await pool.end();
  console.log(
    `Catálogo aplicado: ${pratos.length} pratos, ${adicionais.length} adicionais novos, ${seedZones.length} bairros.`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});