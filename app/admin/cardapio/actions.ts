"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { productAddons, products } from "@/db/schema";
import { exigirAdmin } from "@/lib/admin";
import { parsePreco } from "@/lib/preco";
import { slugify } from "@/lib/slug";

export type ProdutoState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
};

const texto = (fd: FormData, chave: string) => {
  const v = fd.get(chave);
  return typeof v === "string" ? v : "";
};

const produtoSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome.").max(80, "Nome muito longo."),
  description: z.string().trim().min(5, "Descreva o prato.").max(400, "Descrição muito longa."),
  categoryId: z.uuid("Escolha a categoria."),
  imageUrl: z
    .string()
    .trim()
    .regex(
      /^\/(?!\/)\S*$/,
      "Use o caminho de uma imagem da pasta public, começando com /. Ex.: /pratos/pizza.jpg"
    ),
});

// o endereço do prato nunca repete: pizza, pizza-2, pizza-3...
async function slugLivre(nome: string) {
  const base = slugify(nome) || "prato";
  let slug = base;
  for (let n = 2; ; n++) {
    const [existe] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.slug, slug))
      .limit(1);
    if (!existe) return slug;
    slug = `${base}-${n}`;
  }
}

function atualizarVitrine(productId?: string) {
  revalidatePath("/admin/cardapio");
  if (productId) revalidatePath(`/admin/cardapio/${productId}`);
  revalidatePath("/cardapio");
  revalidatePath("/");
}

export async function salvarProduto(
  productId: string | null,
  _prev: ProdutoState,
  formData: FormData
): Promise<ProdutoState> {
  await exigirAdmin();

  const values = {
    name: texto(formData, "name"),
    description: texto(formData, "description"),
    categoryId: texto(formData, "categoryId"),
    price: texto(formData, "price"),
    imageUrl: texto(formData, "imageUrl"),
    isAvailable: formData.get("isAvailable") === "on" ? "on" : "",
    isFeatured: formData.get("isFeatured") === "on" ? "on" : "",
  };

  if (productId && !z.uuid().safeParse(productId).success) {
    return { error: "Prato inválido.", values };
  }

  const parsed = produtoSchema.safeParse(values);
  const fieldErrors: Record<string, string> = parsed.success
    ? {}
    : Object.fromEntries(
        Object.entries(z.flattenError(parsed.error).fieldErrors).map(([k, v]) => [k, v?.[0] ?? ""])
      );
  const priceCents = parsePreco(values.price);
  if (priceCents === null) fieldErrors.price = "Informe um preço válido. Ex.: 29,90";
  if (!parsed.success || priceCents === null) return { fieldErrors, values };

  const d = parsed.data;
  const campos = {
    name: d.name,
    description: d.description,
    categoryId: d.categoryId,
    priceCents,
    imageUrl: d.imageUrl,
    isAvailable: values.isAvailable === "on",
    isFeatured: values.isFeatured === "on",
  };

  let id: string;
  try {
    if (productId) {
      await db.update(products).set(campos).where(eq(products.id, productId));
      id = productId;
    } else {
      const [novo] = await db
        .insert(products)
        .values({ ...campos, slug: await slugLivre(d.name) })
        .returning({ id: products.id });
      id = novo.id;
    }
  } catch (err) {
    console.error("Erro ao salvar prato:", err);
    return { error: "Não foi possível salvar o prato. Confira a categoria e tente de novo.", values };
  }

  atualizarVitrine(id);
  redirect(`/admin/cardapio/${id}?salvo=1`);
}

export async function alternarCampo(
  productId: string,
  campo: "isAvailable" | "isFeatured",
  valor: boolean
) {
  await exigirAdmin();
  const id = z.uuid().safeParse(productId);
  if (!id.success) return;

  await db
    .update(products)
    .set(campo === "isAvailable" ? { isAvailable: valor } : { isFeatured: valor })
    .where(eq(products.id, id.data));

  atualizarVitrine(id.data);
}

const nomeAdicional = z.string().trim().min(2).max(60);

export async function criarAdicional(productId: string, formData: FormData) {
  await exigirAdmin();
  const pid = z.uuid().safeParse(productId);
  const nome = nomeAdicional.safeParse(texto(formData, "name"));
  const preco = parsePreco(texto(formData, "price") || "0");
  if (!pid.success || !nome.success || preco === null) return;

  await db.insert(productAddons).values({ productId: pid.data, name: nome.data, priceCents: preco });
  atualizarVitrine(pid.data);
}

export async function salvarAdicional(addonId: string, productId: string, formData: FormData) {
  await exigirAdmin();
  const aid = z.uuid().safeParse(addonId);
  const pid = z.uuid().safeParse(productId);
  const nome = nomeAdicional.safeParse(texto(formData, "name"));
  const preco = parsePreco(texto(formData, "price") || "0");
  if (!aid.success || !pid.success || !nome.success || preco === null) return;

  await db
    .update(productAddons)
    .set({ name: nome.data, priceCents: preco })
    .where(and(eq(productAddons.id, aid.data), eq(productAddons.productId, pid.data)));
  atualizarVitrine(pid.data);
}

export async function alternarAdicional(addonId: string, productId: string, ativo: boolean) {
  await exigirAdmin();
  const aid = z.uuid().safeParse(addonId);
  const pid = z.uuid().safeParse(productId);
  if (!aid.success || !pid.success) return;

  await db
    .update(productAddons)
    .set({ active: ativo })
    .where(and(eq(productAddons.id, aid.data), eq(productAddons.productId, pid.data)));
  atualizarVitrine(pid.data);
}