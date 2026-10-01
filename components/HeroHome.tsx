import Image from "next/image";
import Link from "next/link";

export default function HeroHome() {
    return (
        <section className="relative mx-auto h-[420px] w-full overflow-hidden rounded-2xl sm:h-[480px] lg:h-[520px]">
            {/* Imagem de fundo */}
            <Image
                src="/Hero.jpg"
                alt="Pratos do cardápio"
                fill
                priority
                sizes="100vw"
                className="object-cover"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/20" />

            {/* Conteúdo */}
            <div className="relative z-10 flex h-full items-center">
                <div className="w-full max-w-2xl px-6 sm:px-10 lg:px-16">
                    {/* Pequeno destaque */}
                    <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">
                        Cardápio do dia
                    </span>

                    {/* Título */}
                    <h1 className="max-w-xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                        Sabor que combina
                        <span className="block text-orange-400">
                            com o seu momento.
                        </span>
                    </h1>

                    {/* Descrição */}
                    <p className="mt-5 max-w-lg text-base leading-7 text-white/80 sm:text-lg">
                        Descubra nossos pratos, escolha seus favoritos
                        e aproveite uma experiência cheia de sabor.
                    </p>

                    {/* Botão */}
                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link
                            href="/produtos"
                            className="inline-flex h-12 items-center justify-center rounded-full bg-orange-500 px-7 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-600"
                        >
                            Ver cardápio
                        </Link>

                        <Link
                            href="#destaques"
                            className="inline-flex h-12 items-center justify-center rounded-full border border-white/30 bg-white/10 px-7 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/20"
                        >
                            Ver destaques
                        </Link>
                    </div>
                </div>
            </div>

            {/* Indicador inferior */}
            <div className="absolute bottom-5 left-1/2 z-10 hidden -translate-x-1/2 items-center gap-3 text-xs font-medium uppercase tracking-widest text-white/60 sm:flex">
                <span className="h-px w-8 bg-white/30" />
                Explore
                <span className="h-px w-8 bg-white/30" />
            </div>
        </section>
    );
};