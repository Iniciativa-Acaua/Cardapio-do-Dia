import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";
import FormProduto from "@/components/admin/FormProduto";
import { exigirAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function NovoPrato() {
  await exigirAdmin();
  const cats = await db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .orderBy(asc(categories.sortOrder), asc(categories.name));

  return (
    <main className="max-w-2xl space-y-4">
      <Link href="/admin/cardapio" className="text-sm text-zinc-400 hover:text-orange-500">
        ← Cardápio
      </Link>
      <h1 className="text-2xl font-bold text-white">Novo prato</h1>
      <FormProduto
        productId={null}
        categorias={cats}
        inicial={{
          name: "",
          description: "",
          categoryId: "",
          price: "",
          imageUrl: "/prato.jpg",
          isAvailable: "on",
          isFeatured: "",
        }}
      />
    </main>
  );
}