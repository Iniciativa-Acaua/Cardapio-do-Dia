"use client";

import { useActionState } from "react";
import Campo from "@/components/auth/Campo";
import BotaoAcao from "@/components/admin/BotaoAcao";
import { salvarProduto, type ProdutoState } from "@/app/admin/cardapio/actions";

const caixa =
  "w-full rounded-lg border border-white/10 bg-neutral-900 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/40";

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

  return (
    <form action={action} className="space-y-5 rounded-xl border border-white/10 bg-neutral-900 p-5">
      {state.error && (
        <div
          role="alert"
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-300"
        >
          {state.error}
        </div>
      )}

      <Campo label="Nome" name="name" defaultValue={v.name} erro={fe.name} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-sm font-medium text-zinc-200">
          Descrição
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={v.description}
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
          defaultValue={v.price}
          erro={fe.price}
        />
      </div>

      <Campo
        label="Foto (caminho na pasta public)"
        name="imageUrl"
        placeholder="/pratos/pizza.jpg"
        defaultValue={v.imageUrl}
        erro={fe.imageUrl}
        dica="Coloque a imagem na pasta public do projeto e informe o caminho aqui."
      />

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm text-zinc-200">
          <input
            type="checkbox"
            name="isAvailable"
            defaultChecked={v.isAvailable === "on"}
            className="size-4 accent-orange-500"
          />
          Disponível no cardápio
        </label>
        <label className="flex items-center gap-2 text-sm text-zinc-200">
          <input
            type="checkbox"
            name="isFeatured"
            defaultChecked={v.isFeatured === "on"}
            className="size-4 accent-orange-500"
          />
          Em destaque
        </label>
      </div>

      <BotaoAcao>{productId ? "Salvar alterações" : "Criar prato"}</BotaoAcao>
    </form>
  );
}