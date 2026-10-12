"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AtualizarAutomaticamente({
  intervaloMs = 5000,
  maxMs = 10 * 60 * 1000,
}: {
  intervaloMs?: number;
  maxMs?: number;
}) {
  const router = useRouter();

  useEffect(() => {
    const inicio = Date.now();
    const id = setInterval(() => {
      if (Date.now() - inicio > maxMs) {
        clearInterval(id);
        return;
      }
      router.refresh();
    }, intervaloMs);
    return () => clearInterval(id);
  }, [router, intervaloMs, maxMs]);

  return null;
}