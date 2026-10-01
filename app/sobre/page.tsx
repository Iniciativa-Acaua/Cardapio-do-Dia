// app/sobre/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sobre nós | +Sabor",
  description: "Conheça a história e os valores do +Sabor.",
};

const values = [
  { title: "Ingredientes frescos", text: "Selecionamos o que há de melhor todos os dias." },
  { title: "Feito com carinho", text: "Cada prato é preparado pensando em quem vai comer." },
  { title: "Praticidade", text: "Peça em poucos cliques, de onde estiver." },
];

export default function SobrePage() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="mb-6 text-4xl font-extrabold text-white">
        Sobre o <span className="text-orange-500">+Sabor</span>
      </h1>
      <p className="mb-10 text-lg text-neutral-300">
        Conte aqui a história do restaurante: como começou, quem está por trás
        e o que torna os pratos especiais.
      </p>
      <div className="grid gap-6 md:grid-cols-3">
        {values.map((v) => (
          <div key={v.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-2 font-bold text-white">{v.title}</h2>
            <p className="text-sm text-neutral-300">{v.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}