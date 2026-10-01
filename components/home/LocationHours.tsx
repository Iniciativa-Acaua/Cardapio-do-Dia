// components/home/LocationHours.tsx
export default function LocationHours() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-4 text-2xl font-extrabold text-white">Horário de funcionamento</h2>
          <ul className="space-y-2 text-neutral-300">
            <li className="flex justify-between"><span>Segunda a sexta</span><span>11h às 22h</span></li>
            <li className="flex justify-between"><span>Sábado</span><span>11h às 23h</span></li>
            <li className="flex justify-between"><span>Domingo</span><span>11h às 20h</span></li>
          </ul>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-4 text-2xl font-extrabold text-white">Onde estamos</h2>
          <p className="text-neutral-300">Rua Exemplo, 123 - Bairro, Cidade/UF</p>
          <p className="mt-2 text-neutral-300">Entregamos em toda a região.</p>
        </div>
      </div>
    </section>
  );
}