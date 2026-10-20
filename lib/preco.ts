// aceita "29,90", "29.90", "R$ 1.299,90"; devolve centavos ou null se for inválido
export function parsePreco(valor: string): number | null {
  let s = valor.trim().replace(/\s/g, "").replace(/^R\$/i, "");
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  const n = Number(s);
  if (!s || !Number.isFinite(n) || n < 0 || n > 10000) return null;
  return Math.round(n * 100);
}

export const emReais = (cents: number) => (cents / 100).toFixed(2).replace(".", ",");