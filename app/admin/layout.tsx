import type { Metadata } from "next";
import Link from "next/link";
import AdminNav from "@/components/admin/AdminNav";
import Icone from "@/components/admin/Icone";
import { exigirEquipe } from "@/lib/admin";
import { iniciais } from "@/lib/iniciais";

export const metadata: Metadata = {
  title: "Painel | +Sabor",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, role } = await exigirEquipe();

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[230px_1fr] md:px-6 md:py-8">
      <aside className="md:sticky md:top-24 md:h-fit">
        <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-3 md:p-4">
          <div className="mb-3 flex items-center gap-3 border-b border-white/10 pb-3 md:mb-4 md:pb-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-orange-500 text-sm font-bold text-white">
              {iniciais(user.name)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{user.name}</p>
              <p className="text-xs text-zinc-500">
                {role === "admin" ? "Administrador" : "Equipe de atendimento"}
              </p>
            </div>
          </div>

          <AdminNav papel={role} />

          <Link
            href="/"
            className="mt-3 flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-zinc-500 transition-colors hover:text-orange-400 md:mt-4 md:border-t md:border-white/10 md:pt-4"
          >
            <Icone nome="externo" className="size-4" />
            Ver o site
          </Link>
        </div>
      </aside>

      <div className="min-w-0">{children}</div>
    </div>
  );
}