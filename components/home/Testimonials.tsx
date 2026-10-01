// components/home/Testimonials.tsx
// Exemplos: troque por avaliações reais de clientes.
const reviews = [
  { name: "Cliente 1", text: "Pedido rápido e a comida chegou perfeita." },
  { name: "Cliente 2", text: "Cardápio fácil de usar e pratos deliciosos." },
  { name: "Cliente 3", text: "Melhor custo-benefício da região." },
];

export default function Testimonials() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="mb-10 text-center text-3xl font-extrabold text-white">
        O que dizem sobre o <span className="text-orange-500">+Sabor</span>
      </h2>
      <div className="grid gap-6 md:grid-cols-3">
        {reviews.map((r) => (
          <figure key={r.name} className="rounded-2xl bg-white p-6 text-neutral-900">
            <div className="mb-3 text-orange-500" aria-label="5 estrelas">★★★★★</div>
            <blockquote className="text-sm text-neutral-700">“{r.text}”</blockquote>
            <figcaption className="mt-4 text-sm font-bold">{r.name}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}