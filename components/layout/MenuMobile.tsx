"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigation } from "@/lib/navigation";

export default function MenuMobile() {
  const [aberto, setAberto] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!aberto) return;
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberto(false);
    };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [aberto]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        aria-controls="menu-mobile"
        aria-label={aberto ? "Fechar menu" : "Abrir menu"}
        className="grid size-10 place-items-center rounded-lg text-zinc-200 transition-colors hover:bg-white/5"
      >
        <svg
          viewBox="0 0 24 24"
          className="size-6"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          aria-hidden="true"
        >
          {aberto ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>

      {aberto && (
        <nav
          id="menu-mobile"
          aria-label="Navegação principal"
          className="absolute inset-x-0 top-16 border-b border-white/10 bg-neutral-950/95 px-6 py-4 backdrop-blur"
        >
          <ul className="flex flex-col gap-1">
            {navigation.map((item) => {
              const ativo = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setAberto(false)}
                    aria-current={ativo ? "page" : undefined}
                    className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      ativo
                        ? "bg-orange-500/15 text-orange-400"
                        : "text-zinc-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}