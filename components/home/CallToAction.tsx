// components/home/CallToAction.tsx
import Link from "next/link";

export default function CallToAction() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="rounded-3xl bg-orange-500 px-8 py-12 text-center">
        <h2 className="text-3xl font-extrabold text-white md:text-4xl">Bateu a fome?</h2>
        <p className="mx-auto mt-3 max-w-md text-white/90">
          Veja o cardápio completo e peça agora mesmo.
        </p>
        <Link
          href="/cardapio"
          className="mt-6 inline-block rounded-full bg-black px-8 py-3 font-semibold text-white transition hover:bg-neutral-800"
        >
          Ver cardápio completo
        </Link>
      </div>
    </section>
  );
}