import Link from "next/link";
import MenuContaDropdown from "@/components/auth/MenuContaDropdown";
import { getSession } from "@/lib/session";

export default async function MenuConta() {
  const session = await getSession();

  if (!session) {
    return (
      <Link
        href="/entrar"
        className="rounded-full border border-white/15 px-4 py-1.5 text-sm font-medium text-zinc-200 transition-colors hover:border-orange-500 hover:text-orange-400"
      >
        Entrar
      </Link>
    );
  }

  return <MenuContaDropdown nome={session.user.name} email={session.user.email} />;
}