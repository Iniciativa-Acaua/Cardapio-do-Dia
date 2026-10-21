import Image from "next/image";
import { cartao, eyebrow } from "@/lib/estilos";

export default function AuthLayout({
  rotulo,
  titulo,
  destaque,
  subtitulo,
  children,
}: {
  rotulo: string;
  titulo: string;
  destaque?: string;
  subtitulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-12 px-6 py-12 md:grid-cols-2">
      <div className="relative hidden aspect-4/5 overflow-hidden rounded-2xl border border-white/10 md:block">
        <Image
          src="/prato.jpg"
          alt=""
          fill
          priority
          sizes="(min-width: 768px) 50vw, 0px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-neutral-950/90 via-neutral-950/20 to-transparent" />
        <p className="absolute right-6 bottom-6 left-6 text-2xl leading-snug font-extrabold text-white">
          Seu prato favorito, a poucos cliques de <span className="text-orange-500">distância</span>.
        </p>
      </div>

      <div className="mx-auto w-full max-w-md">
        <p className={eyebrow}>{rotulo}</p>
        <h1 className="mb-2 text-4xl font-extrabold text-white">
          {titulo}
          {destaque && <span className="text-orange-500"> {destaque}</span>}
        </h1>
        <p className="mb-8 text-neutral-300">{subtitulo}</p>
        <div className={cartao}>{children}</div>
      </div>
    </section>
  );
}