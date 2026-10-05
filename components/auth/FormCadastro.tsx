"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Campo from "@/components/auth/Campo";

export default function FormCadastro({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErroGeral(null);

    const dados = new FormData(e.currentTarget);
    const nome = String(dados.get("nome")).trim();
    const email = String(dados.get("email")).trim();
    const senha = String(dados.get("senha"));
    const confirmar = String(dados.get("confirmar"));

    const novos: Record<string, string> = {};
    if (nome.length < 2) novos.nome = "Informe seu nome.";
    if (!/^\S+@\S+\.\S+$/.test(email)) novos.email = "Informe um e-mail válido.";
    if (senha.length < 8) novos.senha = "A senha precisa ter ao menos 8 caracteres.";
    if (senha !== confirmar) novos.confirmar = "As senhas não são iguais.";

    setErros(novos);
    if (Object.keys(novos).length) return;

    setCarregando(true);
    const { error } = await authClient.signUp.email({ name: nome, email, password: senha });
    setCarregando(false);

    if (error) {
      if (error.code === "USER_ALREADY_EXISTS") {
        setErros({ email: "Já existe uma conta com esse e-mail." });
      } else {
        setErroGeral("Não foi possível criar a conta. Tente de novo em instantes.");
      }
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <Campo
        label="Nome"
        name="nome"
        autoComplete="name"
        placeholder="Seu nome"
        erro={erros.nome}
      />
      <Campo
        label="E-mail"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="voce@exemplo.com"
        erro={erros.email}
      />
      <Campo
        label="Senha"
        name="senha"
        type="password"
        autoComplete="new-password"
        placeholder="Mínimo de 8 caracteres"
        erro={erros.senha}
      />
      <Campo
        label="Confirmar senha"
        name="confirmar"
        type="password"
        autoComplete="new-password"
        placeholder="Repita a senha"
        erro={erros.confirmar}
      />

      {erroGeral && (
        <div
          role="alert"
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-300"
        >
          {erroGeral}
        </div>
      )}

      <button
        type="submit"
        disabled={carregando}
        className="flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {carregando && (
          <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        )}
        {carregando ? "Criando conta..." : "Criar conta"}
      </button>

      <p className="text-center text-sm text-zinc-400">
        Já tem conta?{" "}
        <Link href="/entrar" className="font-medium text-orange-500 hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}