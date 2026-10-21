"use client";

import { useId, useState } from "react";
import { campoBase, campoErro, campoNormal } from "@/lib/estilos";

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
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-neutral-200">
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={ehSenha && visivel ? "text" : type}
          aria-invalid={erro ? true : undefined}
          aria-describedby={erro || dica ? descId : undefined}
          className={`${campoBase} ${erro ? campoErro : campoNormal} ${ehSenha ? "pr-24" : ""} ${className}`}
          {...props}
        />

        {ehSenha && (
          <button
            type="button"
            onClick={() => setVisivel((v) => !v)}
            aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
            className="absolute inset-y-0 right-4 text-xs font-semibold text-neutral-400 transition-colors hover:text-orange-500"
          >
            {visivel ? "Ocultar" : "Mostrar"}
          </button>
        )}
      </div>

      {(erro || dica) && (
        <p id={descId} className={`mt-1 text-xs ${erro ? "text-red-400" : "text-neutral-400"}`}>
          {erro ?? dica}
        </p>
      )}
    </div>
  );
}