"use client";

import { useEffect, useState } from "react";
import { Aviso } from "@/components/admin/ui";

export default function AvisoTemporario({
  children,
  tom = "sucesso",
  ms = 4000,
}: {
  children: React.ReactNode;
  tom?: "sucesso" | "erro" | "info";
  ms?: number;
}) {
  const [visivel, setVisivel] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisivel(false), ms);
    return () => clearTimeout(t);
  }, [ms]);

  if (!visivel) return null;
  return <Aviso tom={tom}>{children}</Aviso>;
}