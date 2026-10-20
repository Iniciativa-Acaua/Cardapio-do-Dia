"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icone, { type NomeIcone } from "@/components/admin/Icone";

type Item = { href: string; label: string; icone: NomeIcone; soAdmin?: boolean; exato?: boolean };

// vamos acrescentar os itens conforme criarmos cada tela
const itens: Item[] = [
  { href: "/admin", label: "Resumo", icone: "resumo", exato: true },
  { href: "/admin/pedidos", label: "Pedidos", icone: "pedidos" },
  { href: "/admin/cardapio", label: "Cardápio", icone: "cardapio", soAdmin: true },
  { href: "/admin/loja", label: "Loja", icone: "loja", soAdmin: true },
];

export default function AdminNav({ papel }: { papel: "admin" | "staff" }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Painel" className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
      {itens
        .filter((i) => !i.soAdmin || papel === "admin")
        .map((i) => {
          const ativo = i.exato ? pathname === i.href : pathname.startsWith(i.href);
          return (
            <Link
              key={i.href}
              href={i.href}
              aria-current={ativo ? "page" : undefined}
              className={`relative flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                ativo
                  ? "bg-orange-500/15 text-orange-400"
                  : "text-zinc-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              {ativo && (
                <span className="absolute top-2 bottom-2 left-0 hidden w-1 rounded-r-full bg-orange-500 md:block" />
              )}
              <Icone nome={i.icone} />
              {i.label}
            </Link>
          );
        })}
    </nav>
  );
}