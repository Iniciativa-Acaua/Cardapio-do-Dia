import "server-only";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export type Papel = "admin" | "staff";

// libera admin e staff (atendimento)
export async function exigirEquipe() {
  const session = await getSession();
  if (!session) redirect("/entrar?redirect=/admin");

  const role = (session.user as { role?: string | null }).role;
  if (role !== "admin" && role !== "staff") notFound();

  return { user: session.user, role: role as Papel };
}

// libera só admin (cardápio, loja, cupons...)
export async function exigirAdmin() {
  const equipe = await exigirEquipe();
  if (equipe.role !== "admin") notFound();
  return equipe;
}