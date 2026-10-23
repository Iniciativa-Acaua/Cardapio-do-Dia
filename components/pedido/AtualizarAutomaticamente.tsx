"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const INTERVALO_MS = 5000;
const DURACAO_MAXIMA_MS = 5 * 60 * 1000;

export default function AtualizarAutomaticamente() {
  const router = useRouter();

  useEffect(() => {
    const inicio = Date.now();
    const timer = setInterval(() => {
      if (Date.now() - inicio > DURACAO_MAXIMA_MS) {
        clearInterval(timer);
        return;
      }
      if (document.visibilityState === "visible") router.refresh();
    }, INTERVALO_MS);
    return () => clearInterval(timer);
  }, [router]);

  return null;
}