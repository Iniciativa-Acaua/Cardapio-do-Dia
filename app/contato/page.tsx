// app/contato/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contato | +Sabor",
  description: "Fale com o +Sabor por WhatsApp, telefone ou e-mail.",
};

export default function ContatoPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-6 text-4xl font-extrabold text-white">
        Fale com o <span className="text-orange-500">+Sabor</span>
      </h1>
      <p className="mb-8 text-neutral-300">
        Dúvidas, sugestões ou pedidos especiais? Escolha o canal que preferir.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <a
          href="https://wa.me/5511999999999"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-2xl bg-orange-500 p-6 font-semibold text-white transition hover:bg-orange-600"
        >
          Chamar no WhatsApp
        </a>
        <a
          href="tel:+551112345678"
          className="rounded-2xl border border-white/10 bg-white/5 p-6 font-semibold text-white transition hover:border-orange-500"
        >
          Ligar: (11) 1234-5678
        </a>
        <a
          href="mailto:contato@exemplo.com"
          className="rounded-2xl border border-white/10 bg-white/5 p-6 font-semibold text-white transition hover:border-orange-500 sm:col-span-2"
        >
          contato@exemplo.com
        </a>
      </div>
    </section>
  );
}