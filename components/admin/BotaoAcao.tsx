"use client";

import { useFormStatus } from "react-dom";

export default function BotaoAcao({
  children,
  tom = "principal",
  confirmar,
  className = "",
}: {
  children: React.ReactNode;
  tom?: "principal" | "perigo";
  confirmar?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (confirmar && !window.confirm(confirmar)) e.preventDefault();
      }}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
        tom === "perigo"
          ? "border border-red-500/40 text-red-300 hover:bg-red-500/10"
          : "bg-orange-500 text-white hover:bg-orange-600"
      } ${className}`}
    >
      {pending && (
        <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      )}
      {pending ? "Salvando..." : children}
    </button>
  );
}