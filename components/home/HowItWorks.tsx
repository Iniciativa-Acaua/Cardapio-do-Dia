// components/home/HowItWorks.tsx
const steps = [
  { title: "Escolha seus pratos", text: "Navegue pelo cardápio e adicione seus favoritos ao carrinho." },
  { title: "Confirme o pedido", text: "Revise os itens, informe seus dados e escolha entrega ou retirada." },
  { title: "Receba e aproveite", text: "Preparamos tudo com carinho e levamos até você." },
];

export default function HowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="mb-10 text-center text-3xl font-extrabold text-white">
        Como <span className="text-orange-500">funciona</span>
      </h2>
      <ol className="grid gap-6 md:grid-cols-3">
        {steps.map((s, i) => (
          <li key={s.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 font-bold text-white">
              {i + 1}
            </span>
            <h3 className="mb-2 text-lg font-bold text-white">{s.title}</h3>
            <p className="text-sm text-neutral-300">{s.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}