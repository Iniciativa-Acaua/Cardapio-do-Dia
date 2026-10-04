import Link from "next/link";
import BotaoSair from "@/components/auth/BotaoSair";
import { getSession } from "@/lib/session";

export default async function MenuConta() {
  const session = await getSession();

  if (!session) {
    return <Link href="/entrar">Entrar</Link>;
  }

  const primeiroNome = session.user.name.split(" ")[0];

  return (
    <div className="flex items-center gap-3">
      <Link href="/conta">Olá, {primeiroNome}</Link>
      <BotaoSair />
    </div>
  );
}