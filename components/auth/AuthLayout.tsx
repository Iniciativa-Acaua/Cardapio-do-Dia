import Image from "next/image";

export default function AuthLayout({
  titulo,
  subtitulo,
  children,
}: {
  titulo: string;
  subtitulo: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-12 px-6 py-12 md:grid-cols-2">
      <div className="relative hidden aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 md:block">
        <Image
          src="/prato.jpg"
          alt=""
          fill
          priority
          sizes="(min-width: 768px) 50vw, 0px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-950/20 to-transparent" />
        <p className="absolute right-6 bottom-6 left-6 text-2xl leading-snug font-bold text-white">
          Seu prato favorito, a poucos cliques de distância.
        </p>
      </div>

      <div className="mx-auto w-full max-w-sm">
        <h1 className="text-3xl font-bold text-white">{titulo}</h1>
        <p className="mt-2 mb-8 text-sm text-zinc-400">{subtitulo}</p>
        {children}
      </div>
    </main>
  );
}