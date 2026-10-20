"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { businessHours, deliveryZones } from "@/db/schema";
import { exigirAdmin } from "@/lib/admin";
import { parsePreco } from "@/lib/preco";

const texto = (fd: FormData, chave: string) => {
  const v = fd.get(chave);
  return typeof v === "string" ? v : "";
};

const horaSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
const diaSchema = z.coerce.number().int().min(0).max(6);

// atualiza as telas que dependem desses dados e volta para o painel (com aviso, se houver erro)
function voltar(erro?: string): never {
  revalidatePath("/admin/loja");
  revalidatePath("/checkout");
  revalidatePath("/");
  redirect(erro ? `/admin/loja?erro=${encodeURIComponent(erro)}` : "/admin/loja");
}

function lerHorario(fd: FormData) {
  const fechado = fd.get("isClosed") === "on";
  const abre = horaSchema.safeParse(texto(fd, "opensAt"));
  const fecha = horaSchema.safeParse(texto(fd, "closesAt"));
  if (!abre.success || !fecha.success) return { erro: "Informe horários válidos." } as const;
  if (!fechado && fecha.data <= abre.data) {
    return {
      erro: "O fechamento precisa ser depois da abertura. Para fechar à meia-noite, use 23:59.",
    } as const;
  }
  return { abre: abre.data, fecha: fecha.data, fechado } as const;
}

export async function salvarHorario(id: string, formData: FormData) {
  await exigirAdmin();
  const uid = z.uuid().safeParse(id);
  const h = lerHorario(formData);
  if (!uid.success) voltar("Horário inválido.");
  if ("erro" in h) voltar(h.erro);

  let erro: string | undefined;
  try {
    await db
      .update(businessHours)
      .set({ opensAt: h.abre, closesAt: h.fecha, isClosed: h.fechado })
      .where(eq(businessHours.id, uid.data));
  } catch (err) {
    console.error("Erro ao salvar horário:", err);
    erro = "Não foi possível salvar. Já existe outro horário com essa abertura nesse dia?";
  }
  voltar(erro);
}

export async function criarHorario(formData: FormData) {
  await exigirAdmin();
  const dia = diaSchema.safeParse(texto(formData, "weekday"));
  const h = lerHorario(formData);
  if (!dia.success) voltar("Escolha o dia da semana.");
  if ("erro" in h) voltar(h.erro);

  let erro: string | undefined;
  try {
    await db
      .insert(businessHours)
      .values({ weekday: dia.data, opensAt: h.abre, closesAt: h.fecha, isClosed: h.fechado });
  } catch (err) {
    console.error("Erro ao criar horário:", err);
    erro = "Não foi possível criar. Já existe um horário com essa abertura nesse dia?";
  }
  voltar(erro);
}

export async function removerHorario(id: string) {
  await exigirAdmin();
  const uid = z.uuid().safeParse(id);
  if (!uid.success) voltar("Horário inválido.");
  await db.delete(businessHours).where(eq(businessHours.id, uid.data));
  voltar();
}

function lerBairro(fd: FormData) {
  const nome = z.string().trim().min(2).max(60).safeParse(texto(fd, "name"));
  const taxa = parsePreco(texto(fd, "fee") || "0");
  const minimo = parsePreco(texto(fd, "min") || "0");
  if (!nome.success) return { erro: "Informe o nome do bairro." } as const;
  if (taxa === null || minimo === null) {
    return { erro: "Informe valores válidos para a taxa e o pedido mínimo." } as const;
  }
  return { nome: nome.data, taxa, minimo } as const;
}

// id = null cria um bairro novo
export async function salvarBairro(id: string | null, formData: FormData) {
  await exigirAdmin();
  const b = lerBairro(formData);
  if ("erro" in b) voltar(b.erro);
  if (id && !z.uuid().safeParse(id).success) voltar("Bairro inválido.");

  const campos = { name: b.nome, neighborhood: b.nome, feeCents: b.taxa, minOrderCents: b.minimo };
  let erro: string | undefined;
  try {
    if (id) await db.update(deliveryZones).set(campos).where(eq(deliveryZones.id, id));
    else await db.insert(deliveryZones).values(campos);
  } catch (err) {
    console.error("Erro ao salvar bairro:", err);
    erro = "Não foi possível salvar. Já existe um bairro com esse nome?";
  }
  voltar(erro);
}

export async function alternarBairro(id: string, ativo: boolean) {
  await exigirAdmin();
  const uid = z.uuid().safeParse(id);
  if (!uid.success) voltar("Bairro inválido.");
  await db.update(deliveryZones).set({ active: ativo }).where(eq(deliveryZones.id, uid.data));
  voltar();
}