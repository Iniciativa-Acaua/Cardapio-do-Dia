import { asc } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { CabecalhoPagina } from "@/components/admin/ui";
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
    <main>
      <CabecalhoPagina
        voltar={{ href: "/admin/cardapio", rotulo: "Cardápio" }}
        titulo="Novo prato"
        subtitulo="Preencha os dados e confira como ele vai aparecer no site."
      />
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