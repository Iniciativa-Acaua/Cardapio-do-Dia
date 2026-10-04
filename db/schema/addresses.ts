import { sql } from "drizzle-orm";
import { boolean, index, pgTable, text, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { timestamps } from "./helpers";
import { user } from "./auth-schema";

export const addresses = pgTable(
  "addresses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    label: text("label").notNull().default("Casa"),
    cep: varchar("cep", { length: 9 }).notNull(),
    street: text("street").notNull(),
    number: text("number").notNull(),
    complement: text("complement"),
    neighborhood: text("neighborhood").notNull(),
    city: text("city").notNull(),
    state: varchar("state", { length: 2 }).notNull(),
    isDefault: boolean("is_default").notNull().default(false),
    ...timestamps,
  },
  (t) => [
    index("addresses_user_id_idx").on(t.userId),
    // no máximo um endereço padrão por usuário
    uniqueIndex("addresses_one_default_idx")
      .on(t.userId)
      .where(sql`${t.isDefault}`),
  ]
);