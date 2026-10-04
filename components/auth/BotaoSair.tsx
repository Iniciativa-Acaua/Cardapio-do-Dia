"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function BotaoSair() {
  const router = useRouter();

  async function sair() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button type="button" onClick={sair}>
      Sair
    </button>
  );
}