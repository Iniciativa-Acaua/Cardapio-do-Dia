import { asc } from "drizzle-orm";
import { db } from "@/db";
import { businessHours, deliveryZones } from "@/db/schema";
import Interruptor from "@/components/admin/Interruptor";
import { exigirAdmin } from "@/lib/admin";
import { emReais } from "@/lib/preco";
import {
  alternarBairro,
  criarHorario,
  removerHorario,
  salvarBairro,
  salvarHorario,
} from "./actions";

export const dynamic = "force-dynamic";

const DIAS = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
const ORDEM = [1, 2, 3, 4, 5, 6, 0]; // a semana começa na segunda

const campo =
  "rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-orange-500";
const botaoSec =
  "rounded-lg border border-white/15 px-3 py-2 text-sm text-zinc-200 transition-colors hover:bg-white/5";
const botaoPri =
  "rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600";

export default async function AdminLoja({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  await exigirAdmin();
  const { erro } = await searchParams;

  const [horarios, bairros] = await Promise.all([
    db.select().from(businessHours).orderBy(asc(businessHours.weekday), asc(businessHours.opensAt)),
    db.select().from(deliveryZones).orderBy(asc(deliveryZones.name)),
  ]);

  return (
    <main className="max-w-3xl space-y-10">
      <h1 className="text-2xl font-bold text-white">Loja</h1>

      {erro && (
        <p
          role="alert"
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-300"
        >
          {erro}
        </p>
      )}

      <section>
        <h2 className="mb-1 text-lg font-bold text-white">Horário de funcionamento</h2>
        <p className="mb-4 text-xs text-zinc-500">
          O checkout só aceita pedidos dentro desses horários. Um dia pode ter mais de uma faixa
          (por exemplo, almoço e jantar).
        </p>

        <div className="space-y-3">
          {ORDEM.map((dia) => {
            const faixas = horarios.filter((h) => h.weekday === dia);
            return (
              <div key={dia} className="rounded-xl border border-white/10 bg-neutral-900 p-4">
                <p className="mb-2 text-sm font-semibold text-white">{DIAS[dia]}</p>
                {faixas.length === 0 && (
                  <p className="text-sm text-zinc-500">Sem horário cadastrado.</p>
                )}
                <ul className="space-y-2">
                  {faixas.map((h) => (
                    <li key={h.id} className="flex flex-wrap items-center gap-2">
                      <form
                        action={salvarHorario.bind(null, h.id)}
                        className="flex flex-wrap items-center gap-2"
                      >
                        <input
                          type="time"
                          name="opensAt"
                          defaultValue={h.opensAt.slice(0, 5)}
                          required
                          aria-label={`Abertura, ${DIAS[dia]}`}
                          className={campo}
                        />
                        <span className="text-zinc-500">às</span>
                        <input
                          type="time"
                          name="closesAt"
                          defaultValue={h.closesAt.slice(0, 5)}
                          required
                          aria-label={`Fechamento, ${DIAS[dia]}`}
                          className={campo}
                        />
                        <label className="flex items-center gap-2 text-sm text-zinc-300">
                          <input
                            type="checkbox"
                            name="isClosed"
                            defaultChecked={h.isClosed}
                            className="size-4 accent-orange-500"
                          />
                          Fechado
                        </label>
                        <button type="submit" className={botaoSec}>
                          Salvar
                        </button>
                      </form>
                      <form action={removerHorario.bind(null, h.id)}>
                        <button
                          type="submit"
                          className="px-2 py-2 text-sm text-red-300 hover:underline"
                        >
                          Remover
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <form
          action={criarHorario}
          className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-white/15 p-4"
        >
          <select name="weekday" defaultValue="" required aria-label="Dia da semana" className={campo}>
            <option value="" disabled>
              Dia...
            </option>
            {ORDEM.map((d) => (
              <option key={d} value={d}>
                {DIAS[d]}
              </option>
            ))}
          </select>
          <input type="time" name="opensAt" defaultValue="11:00" required aria-label="Abertura" className={campo} />
          <span className="text-zinc-500">às</span>
          <input type="time" name="closesAt" defaultValue="22:00" required aria-label="Fechamento" className={campo} />
          <button type="submit" className={botaoPri}>
            Adicionar horário
          </button>
        </form>
      </section>

      <section>
        <h2 className="mb-1 text-lg font-bold text-white">Bairros e taxas de entrega</h2>
        <p className="mb-4 text-xs text-zinc-500">
          Desativar um bairro tira ele da lista do checkout sem apagar o histórico dos pedidos.
        </p>

        <ul className="space-y-3">
          {bairros.map((b) => (
            <li
              key={b.id}
              className={`flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-neutral-900 p-4 ${
                b.active ? "" : "opacity-60"
              }`}
            >
              <form
                action={salvarBairro.bind(null, b.id)}
                className="flex flex-1 flex-wrap items-end gap-2"
              >
                <label className="flex min-w-40 flex-1 flex-col gap-1 text-xs text-zinc-400">
                  Bairro
                  <input name="name" defaultValue={b.name} required minLength={2} className={campo} />
                </label>
                <label className="flex w-28 flex-col gap-1 text-xs text-zinc-400">
                  Taxa (R$)
                  <input name="fee" defaultValue={emReais(b.feeCents)} inputMode="decimal" className={campo} />
                </label>
                <label className="flex w-28 flex-col gap-1 text-xs text-zinc-400">
                  Mínimo (R$)
                  <input name="min" defaultValue={emReais(b.minOrderCents)} inputMode="decimal" className={campo} />
                </label>
                <button type="submit" className={botaoSec}>
                  Salvar
                </button>
              </form>
              <form action={alternarBairro.bind(null, b.id, !b.active)}>
                <label className="flex items-center gap-2 text-xs text-zinc-400">
                  Ativo
                  <Interruptor ligado={b.active} rotulo={`Ativo: ${b.name}`} />
                </label>
              </form>
            </li>
          ))}
          {bairros.length === 0 && (
            <li className="text-sm text-zinc-400">
              Nenhum bairro cadastrado: sem isso o checkout não consegue fazer entregas.
            </li>
          )}
        </ul>

        <form
          action={salvarBairro.bind(null, null)}
          className="mt-4 flex flex-wrap items-end gap-2 rounded-xl border border-dashed border-white/15 p-4"
        >
          <label className="flex min-w-40 flex-1 flex-col gap-1 text-xs text-zinc-400">
            Novo bairro
            <input name="name" required minLength={2} className={campo} />
          </label>
          <label className="flex w-28 flex-col gap-1 text-xs text-zinc-400">
            Taxa (R$)
            <input name="fee" defaultValue="5,00" inputMode="decimal" className={campo} />
          </label>
          <label className="flex w-28 flex-col gap-1 text-xs text-zinc-400">
            Mínimo (R$)
            <input name="min" defaultValue="0,00" inputMode="decimal" className={campo} />
          </label>
          <button type="submit" className={botaoPri}>
            Adicionar bairro
          </button>
        </form>
      </section>
    </main>
  );
}