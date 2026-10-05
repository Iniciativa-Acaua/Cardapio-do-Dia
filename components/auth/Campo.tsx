"use client";

import { useId, useState } from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  erro?: string;
  dica?: string;
};

export default function Campo({
  label,
  erro,
  dica,
  type = "text",
  className = "",
  ...props
}: Props) {
  const id = useId();
  const descId = `${id}-desc`;
  const [visivel, setVisivel] = useState(false);
  const ehSenha = type === "password";

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-zinc-200">
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={ehSenha && visivel ? "text" : type}
          aria-invalid={erro ? true : undefined}
          aria-describedby={erro || dica ? descId : undefined}
          className={`w-full rounded-lg border bg-neutral-900 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:ring-2 ${
            erro
              ? "border-red-500 focus:ring-red-500/40"
              : "border-white/10 focus:border-orange-500 focus:ring-orange-500/40"
          } ${ehSenha ? "pr-20" : ""} ${className}`}
          {...props}
        />

        {ehSenha && (
          <button
            type="button"
            onClick={() => setVisivel((v) => !v)}
            aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
            className="absolute inset-y-0 right-3 text-xs font-medium text-zinc-400 transition-colors hover:text-orange-500"
          >
            {visivel ? "Ocultar" : "Mostrar"}
          </button>
        )}
      </div>

      {(erro || dica) && (
        <p id={descId} className={`text-xs ${erro ? "text-red-400" : "text-zinc-400"}`}>
          {erro ?? dica}
        </p>
      )}
    </div>
  );
}