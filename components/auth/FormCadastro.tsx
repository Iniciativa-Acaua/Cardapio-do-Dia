"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function FormCadastro({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);

    const dados = new FormData(e.currentTarget);
    const senha = String(dados.get("senha"));
    if (senha !== String(dados.get("confirmar"))) {
      setErro("As senhas não são iguais.");
      return;
    }

    setCarregando(true);
    const { error } = await authClient.signUp.email({
      name: String(dados.get("nome")),
      email: String(dados.get("email")),
      password: senha,
    });
    setCarregando(false);

    if (error) {
      setErro(
        error.code === "USER_ALREADY_EXISTS"
          ? "Já existe uma conta com esse e-mail."
          : "Não foi possível criar a conta. Confira os dados e tente de novo."
      );
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        Nome
        <input name="nome" type="text" required autoComplete="name" />
      </label>
      <label className="flex flex-col gap-1">
        E-mail
        <input name="email" type="email" required autoComplete="email" />
      </label>
      <label className="flex flex-col gap-1">
        Senha (mínimo 8 caracteres)
        <input
          name="senha"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </label>
      <label className="flex flex-col gap-1">
        Confirmar senha
        <input
          name="confirmar"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </label>

      {erro && (
        <p role="alert" className="text-red-600">
          {erro}
        </p>
      )}

      <button type="submit" disabled={carregando}>
        {carregando ? "Criando conta..." : "Criar conta"}
      </button>

      <p>
        Já tem conta? <Link href="/entrar">Entrar</Link>
      </p>
    </form>
  );
}