"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { exigirAdmin } from "@/lib/admin";
import { slugify } from "@/lib/slug";

const texto = (fd: FormData, chave: string) => {
  const v = fd.get(chave);
  return typeof v === "string" ? v : "";
};

function voltar(erro?: string): never {
  revalidatePath("/admin/cardapio/categorias");
  revalidatePath("/admin/cardapio");
  revalidatePath("/cardapio");
  revalidatePath("/");
  redirect(
    erro
      ? `/admin/cardapio/categorias?erro=${encodeURIComponent(erro)}`
      : "/admin/cardapio/categorias"
  );
}

async function slugLivre(nome: string) {
  const base = slugify(nome) || "categoria";
  let slug = base;
  for (let n = 2; ; n++) {
    const [existe] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1);
    if (!existe) return slug;
    slug = `${base}-${n}`;
  }
}

// id = null cria uma categoria nova
export async function salvarCategoria(id: string | null, formData: FormData) {
  await exigirAdmin();
  const nome = z.string().trim().min(2).max(40).safeParse(texto(formData, "name"));
  const ordem = z.coerce.number().int().min(0).max(999).safeParse(texto(formData, "sortOrder") || "0");
  if (!nome.success) voltar("Informe o nome da categoria.");
  if (!ordem.success) voltar("A ordem precisa ser um número inteiro.");
  if (id && !z.uuid().safeParse(id).success) voltar("Categoria inválida.");

  let erro: string | undefined;
  try {
    if (id) {
      await db
        .update(categories)
        .set({ name: nome.data, sortOrder: ordem.data })
        .where(eq(categories.id, id));
    } else {
      await db
        .insert(categories)
        .values({ name: nome.data, sortOrder: ordem.data, slug: await slugLivre(nome.data) });
    }
  } catch (err) {
    console.error("Erro ao salvar categoria:", err);
    erro = "Não foi possível salvar a categoria.";
  }
  voltar(erro);
}

export async function alternarCategoria(id: string, ativa: boolean) {
  await exigirAdmin();
  const uid = z.uuid().safeParse(id);
  if (!uid.success) voltar("Categoria inválida.");
  await db.update(categories).set({ active: ativa }).where(eq(categories.id, uid.data));
  voltar();
}