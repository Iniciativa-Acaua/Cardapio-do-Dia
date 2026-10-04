import Link from "next/link";
import { redirect } from "next/navigation";
import BotaoSair from "@/components/auth/BotaoSair";
import { getSession } from "@/lib/session";

export default async function PaginaConta() {
  const session = await getSession();
  if (!session) redirect("/entrar?redirect=/conta");

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-2 text-2xl font-bold">Minha conta</h1>
      <p className="mb-6">
        {session.user.name} · {session.user.email}
      </p>

      <nav className="mb-6 flex gap-4">
        <Link href="/conta/pedidos">Meus pedidos</Link>
      </nav>

      <BotaoSair />
    </main>
  );
}