"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Campo from "@/components/auth/Campo";
import { authClient } from "@/lib/auth-client";
import { botaoPrimario, caixaErro } from "@/lib/estilos";

export default function FormEntrar({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    const dados = new FormData(e.currentTarget);
    const { error } = await authClient.signIn.email({
      email: String(dados.get("email")),
      password: String(dados.get("senha")),
    });

    setCarregando(false);
    if (error) {
      setErro("E-mail ou senha incorretos.");
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Campo
        label="E-mail"
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="voce@exemplo.com"
      />
      <Campo
        label="Senha"
        name="senha"
        type="password"
        required
        autoComplete="current-password"
        placeholder="Sua senha"
      />

      {erro && (
        <div role="alert" className={caixaErro}>
          {erro}
        </div>
      )}

      <button type="submit" disabled={carregando} className={`${botaoPrimario} w-full`}>
        {carregando && (
          <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        )}
        {carregando ? "Entrando..." : "Entrar"}
      </button>

      <p className="text-center text-sm text-neutral-400">
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="font-semibold text-orange-500 hover:underline">
          Criar conta
        </Link>
      </p>
    </form>
  );
}