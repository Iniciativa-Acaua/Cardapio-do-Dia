"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import BotaoSair from "@/components/auth/BotaoSair";
import { iniciais } from "@/lib/iniciais";

export default function MenuContaDropdown({ nome, email }: { nome: string; email: string }) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    const fora = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setAberto(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberto(false);
    };
    document.addEventListener("mousedown", fora);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", fora);
      document.removeEventListener("keydown", esc);
    };
  }, [aberto]);

  const itemClasse =
    "block rounded-lg px-3 py-2 text-sm text-zinc-200 transition-colors hover:bg-white/5";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={aberto}
        aria-label="Menu da conta"
        className="flex items-center gap-2 rounded-full p-0.5 transition-colors hover:bg-white/5 lg:pr-3"
      >
        <span className="grid size-9 place-items-center rounded-full bg-orange-500 text-sm font-bold text-white">
          {iniciais(nome)}
        </span>
        <span className="hidden text-sm font-medium text-zinc-200 lg:block">
          {nome.split(" ")[0]}
        </span>
        <svg
          viewBox="0 0 20 20"
          className={`hidden size-4 text-zinc-400 transition-transform lg:block ${
            aberto ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 8l5 5 5-5" />
        </svg>
      </button>

      {aberto && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border border-white/10 bg-neutral-900 shadow-xl shadow-black/40"
        >
          <div className="border-b border-white/10 px-4 py-3">
            <p className="truncate text-sm font-semibold text-white">{nome}</p>
            <p className="truncate text-xs text-zinc-400">{email}</p>
          </div>

          <div className="p-1.5">
            <Link href="/conta" role="menuitem" onClick={() => setAberto(false)} className={itemClasse}>
              Minha conta
            </Link>
            <Link
              href="/conta/pedidos"
              role="menuitem"
              onClick={() => setAberto(false)}
              className={itemClasse}
            >
              Meus pedidos
            </Link>
          </div>

          <div className="border-t border-white/10 p-1.5">
            <BotaoSair className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-300 transition-colors hover:bg-red-500/10" />
          </div>
        </div>
      )}
    </div>
  );
}