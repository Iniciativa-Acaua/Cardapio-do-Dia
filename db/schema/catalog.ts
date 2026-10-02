// db/schema/catalog.ts
import { sql } from "drizzle-orm";
import { boolean, check, index, integer, pgTable, real, text, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "./helpers";

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  ...timestamps,
});

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description").notNull(),
    priceCents: integer("price_cents").notNull(),
    imageUrl: text("image_url").notNull(),
    isAvailable: boolean("is_available").notNull().default(true),
    isFeatured: boolean("is_featured").notNull().default(false),
    stockQty: integer("stock_qty"), // nulo = estoque ilimitado
    // desnormalizados: evitam agregar avaliações a cada listagem
    ratingAvg: real("rating_avg").notNull().default(0),
    ratingCount: integer("rating_count").notNull().default(0),
    ...timestamps,
  },
  (t) => [
    index("products_category_available_idx").on(t.categoryId, t.isAvailable),
    index("products_featured_idx")
      .on(t.ratingAvg)
      .where(sql`${t.isFeatured} and ${t.isAvailable}`),
    check("products_price_nonneg", sql`${t.priceCents} >= 0`),
  ]
);

export const productAddons = pgTable(
  "product_addons",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    priceCents: integer("price_cents").notNull().default(0),
    active: boolean("active").notNull().default(true),
  },
  (t) => [
    index("product_addons_product_id_idx").on(t.productId),
    check("product_addons_price_nonneg", sql`${t.priceCents} >= 0`),
  ]
);