"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function BotaoSair({ className = "" }: { className?: string }) {
  const router = useRouter();

  async function sair() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button type="button" onClick={sair} className={className}>
      Sair
    </button>
  );
}