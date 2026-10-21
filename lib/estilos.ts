export const campoBase =
  "w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-white placeholder:text-neutral-400 focus:outline-none";
export const campoNormal = "border-white/15 focus:border-orange-500";
export const campoErro = "border-red-500 focus:border-red-500";
export const campoClasse = `${campoBase} ${campoNormal}`;

export const cartao = "rounded-2xl border border-white/10 bg-white/5 p-6";
export const eyebrow = "mb-2 text-sm font-semibold uppercase tracking-wide text-orange-500";
export const caixaErro =
  "rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200";

const botaoBase =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold transition disabled:cursor-not-allowed disabled:opacity-60";
export const botaoPrimario = `${botaoBase} bg-orange-500 text-white hover:bg-orange-600`;
export const botaoSecundario = `${botaoBase} border border-white/20 text-white hover:bg-white/10`;