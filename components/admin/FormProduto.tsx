"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import BotaoAcao from "@/components/admin/BotaoAcao";
import Campo from "@/components/auth/Campo";
import { salvarProduto, type ProdutoState } from "@/app/admin/cardapio/actions";
import { formatCents } from "@/lib/format";
import { parsePreco } from "@/lib/preco";

const caixa =
  "w-full rounded-lg border border-white/10 bg-neutral-900 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/40";

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="space-y-5 rounded-2xl border border-white/10 bg-neutral-900 p-5">
      <h2 className="text-sm font-semibold text-white">{titulo}</h2>
      {children}
    </section>
  );
}

export default function FormProduto({
  productId,
  categorias,
  inicial,
}: {
  productId: string | null;
  categorias: { id: string; name: string }[];
  inicial: Record<string, string>;
}) {
  const [state, action] = useActionState(salvarProduto.bind(null, productId), {} as ProdutoState);
  const v = state.values ?? inicial;
  const fe = state.fieldErrors ?? {};

  const [nome, setNome] = useState(v.name);
  const [descricao, setDescricao] = useState(v.description);
  const [preco, setPreco] = useState(v.price);
  const [foto, setFoto] = useState(v.imageUrl);
  const [fotoOk, setFotoOk] = useState(true);
  const [disponivel, setDisponivel] = useState(v.isAvailable === "on");
  const [destaque, setDestaque] = useState(v.isFeatured === "on");

  const precoCents = parsePreco(preco);

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        {state.error && (
          <div
            role="alert"
            className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            {state.error}
          </div>
        )}

        <Bloco titulo="Informações do prato">
          <Campo
            label="Nome"
            name="name"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            erro={fe.name}
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="description" className="text-sm font-medium text-zinc-200">
              Descrição
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className={caixa}
            />
            {fe.description && <p className="text-xs text-red-400">{fe.description}</p>}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="categoryId" className="text-sm font-medium text-zinc-200">
                Categoria
              </label>
              <select id="categoryId" name="categoryId" defaultValue={v.categoryId} className={caixa}>
                <option value="">Selecione...</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {fe.categoryId && <p className="text-xs text-red-400">{fe.categoryId}</p>}
            </div>

            <Campo
              label="Preço (R$)"
              name="price"
              inputMode="decimal"
              placeholder="29,90"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              erro={fe.price}
            />
          </div>
        </Bloco>

        <Bloco titulo="Foto">
          <Campo
            label="Caminho da imagem na pasta public"
            name="imageUrl"
            placeholder="/pratos/pizza.jpg"
            value={foto}
            onChange={(e) => {
              setFoto(e.target.value);
              setFotoOk(true);
            }}
            erro={fe.imageUrl}
            dica="Coloque a imagem na pasta public do projeto e informe o caminho aqui. A pré-visualização mostra se ela foi encontrada."
          />
        </Bloco>

        <Bloco titulo="Exibição no site">
          <label className="flex items-start gap-3 text-sm text-zinc-200">
            <input
              type="checkbox"
              name="isAvailable"
              checked={disponivel}
              onChange={(e) => setDisponivel(e.target.checked)}
              className="mt-0.5 size-4 accent-orange-500"
            />
            <span>
              Disponível no cardápio
              <span className="block text-xs text-zinc-500">
                Desmarque para esconder o prato sem apagar o histórico de pedidos.
              </span>
            </span>
          </label>
          <label className="flex items-start gap-3 text-sm text-zinc-200">
            <input
              type="checkbox"
              name="isFeatured"
              checked={destaque}
              onChange={(e) => setDestaque(e.target.checked)}
              className="mt-0.5 size-4 accent-orange-500"
            />
            <span>
              Em destaque
              <span className="block text-xs text-zinc-500">Pratos em destaque aparecem na página inicial.</span>
            </span>
          </label>
        </Bloco>

        <div className="flex flex-wrap items-center gap-3">
          <BotaoAcao>{productId ? "Salvar alterações" : "Criar prato"}</BotaoAcao>
          <Link
            href="/admin/cardapio"
            className="rounded-xl px-4 py-3 text-sm font-medium text-zinc-400 transition-colors hover:text-white"
          >
            Cancelar
          </Link>
        </div>
      </div>

      <aside className="lg:sticky lg:top-24 lg:h-fit">
        <p className="mb-2 text-xs font-semibold tracking-wide text-zinc-500 uppercase">Pré-visualização</p>
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-neutral-900">
          <div className="relative aspect-[4/3] bg-neutral-800">
            {foto && fotoOk ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={foto}
                alt=""
                onError={() => setFotoOk(false)}
                className={`size-full object-cover ${disponivel ? "" : "opacity-60 grayscale"}`}
              />
            ) : (
              <div className="grid size-full place-items-center px-6 text-center text-xs text-zinc-500">
                {foto ? "Não encontramos essa imagem na pasta public." : "Sem imagem"}
              </div>
            )}
            <div className="absolute inset-x-0 top-0 flex justify-between gap-2 p-3">
              {destaque ? (
                <span className="rounded-full bg-orange-500 px-2.5 py-1 text-xs font-semibold text-white">
                  ★ Destaque
                </span>
              ) : (
                <span />
              )}
              {!disponivel && (
                <span className="rounded-full bg-black/70 px-2.5 py-1 text-xs font-semibold text-zinc-200">
                  Indisponível
                </span>
              )}
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="font-semibold text-white">{nome || "Nome do prato"}</p>
              <p className="shrink-0 font-bold text-white">
                {precoCents !== null ? formatCents(precoCents) : "R$ 0,00"}
              </p>
            </div>
            <p className="mt-2 line-clamp-3 text-xs text-zinc-400">
              {descricao || "A descrição aparece aqui."}
            </p>
          </div>
        </div>
      </aside>
    </form>
  );
}