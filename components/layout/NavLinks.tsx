"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigation } from "@/lib/navigation";

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegação principal"
      className="hidden items-center gap-1 text-sm font-medium md:flex"
    >
      {navigation.map((item) => {
        const ativo = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={ativo ? "page" : undefined}
            className={`rounded-full px-3.5 py-1.5 transition-colors ${
              ativo
                ? "bg-orange-500/15 text-orange-400"
                : "text-zinc-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}