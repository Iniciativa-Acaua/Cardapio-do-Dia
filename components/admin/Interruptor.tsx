"use client";

import { useFormStatus } from "react-dom";

export default function Interruptor({ ligado, rotulo }: { ligado: boolean; rotulo: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      role="switch"
      aria-checked={ligado}
      aria-label={rotulo}
      disabled={pending}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-60 ${
        ligado ? "bg-orange-500" : "bg-white/20"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white transition-transform ${
          ligado ? "translate-x-5" : ""
        }`}
      />
    </button>
  );
}