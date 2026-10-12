"use client";

import { useFormStatus } from "react-dom";

export default function BotaoPagar({
  children,
  destaque = true,
}: {
  children: React.ReactNode;
  destaque?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`rounded-full px-6 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
        destaque
          ? "bg-orange-500 text-white hover:bg-orange-600"
          : "border border-white/20 text-white hover:bg-white/10"
      }`}
    >
      {pending ? "Redirecionando..." : children}
    </button>
  );
}