import Link from "next/link";
import Icone, { type NomeIcone } from "@/components/admin/Icone";

export function CabecalhoPagina({
  titulo,
  subtitulo,
  acao,
  voltar,
}: {
  titulo: React.ReactNode;
  subtitulo?: React.ReactNode;
  acao?: React.ReactNode;
  voltar?: { href: string; rotulo: string };
}) {
  return (
    <header className="mb-6">
      {voltar && (
        <Link
          href={voltar.href}
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-orange-400"
        >
          <Icone nome="voltar" className="size-4" />
          {voltar.rotulo}
        </Link>
      )}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">{titulo}</h1>
          {subtitulo && <p className="mt-1 text-sm text-zinc-400">{subtitulo}</p>}
        </div>
        {acao}
      </div>
    </header>
  );
}

export function Cartao({
  titulo,
  acao,
  children,
  className = "",
}: {
  titulo?: string;
  acao?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-white/10 bg-neutral-900 p-5 ${className}`}>
      {(titulo || acao) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {titulo && <h2 className="text-sm font-semibold text-white">{titulo}</h2>}
          {acao}
        </div>
      )}
      {children}
    </section>
  );
}

export function EstadoVazio({
  icone,
  titulo,
  texto,
  acao,
}: {
  icone: NomeIcone;
  titulo: string;
  texto?: string;
  acao?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 px-6 py-14 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-full bg-white/5 text-zinc-400">
        <Icone nome={icone} className="size-6" />
      </span>
      <p className="mt-4 font-semibold text-white">{titulo}</p>
      {texto && <p className="mt-1 text-sm text-zinc-400">{texto}</p>}
      {acao && <div className="mt-5">{acao}</div>}
    </div>
  );
}

export function Aviso({
  tom = "sucesso",
  children,
}: {
  tom?: "sucesso" | "erro" | "info";
  children: React.ReactNode;
}) {
  const estilos = {
    sucesso: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    erro: "border-red-500/30 bg-red-500/10 text-red-300",
    info: "border-amber-500/30 bg-amber-500/10 text-amber-200",
  };

  return (
    <p
      role={tom === "erro" ? "alert" : "status"}
      className={`mb-6 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${estilos[tom]}`}
    >
      <Icone nome={tom === "sucesso" ? "check" : "alerta"} className="mt-0.5 size-4 shrink-0" />
      <span>{children}</span>
    </p>
  );
}