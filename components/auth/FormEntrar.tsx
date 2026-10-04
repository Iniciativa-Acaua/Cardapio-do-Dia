"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

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
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        E-mail
        <input name="email" type="email" required autoComplete="email" />
      </label>
      <label className="flex flex-col gap-1">
        Senha
        <input
          name="senha"
          type="password"
          required
          autoComplete="current-password"
        />
      </label>

      {erro && (
        <p role="alert" className="text-red-600">
          {erro}
        </p>
      )}

      <button type="submit" disabled={carregando}>
        {carregando ? "Entrando..." : "Entrar"}
      </button>

      <p>
        Ainda não tem conta? <Link href="/cadastro">Criar conta</Link>
      </p>
    </form>
  );
}