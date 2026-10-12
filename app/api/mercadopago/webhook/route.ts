import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { paymentApi } from "@/lib/mercadopago";
import { aplicarPagamento } from "@/lib/payments";

// confere se a notificação foi mesmo enviada pelo Mercado Pago
function assinaturaValida(req: NextRequest, dataId: string) {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production"; // em produção o segredo é obrigatório

  const partes = Object.fromEntries(
    (req.headers.get("x-signature") ?? "")
      .split(",")
      .map((p) => p.trim().split("=", 2) as [string, string])
  );
  const ts = partes.ts;
  const v1 = partes.v1;
  if (!ts || !v1) return false;

  const manifest = `id:${dataId.toLowerCase()};request-id:${req.headers.get("x-request-id") ?? ""};ts:${ts};`;
  const esperado = Buffer.from(createHmac("sha256", secret).update(manifest).digest("hex"));
  const recebido = Buffer.from(v1);
  return esperado.length === recebido.length && timingSafeEqual(esperado, recebido);
}

export async function POST(req: NextRequest) {
  const dataId = req.nextUrl.searchParams.get("data.id");
  const tipo = req.nextUrl.searchParams.get("type") ?? req.nextUrl.searchParams.get("topic");

  if (tipo !== "payment" || !dataId) {
    return NextResponse.json({ ok: true, ignorado: true });
  }
  if (!assinaturaValida(req, dataId)) {
    return NextResponse.json({ error: "Assinatura inválida." }, { status: 401 });
  }

  // a verdade vem da API do Mercado Pago, nunca do corpo da notificação
  let pagamento;
  try {
    pagamento = await paymentApi().get({ id: dataId });
  } catch (err) {
    if ((err as { status?: number }).status === 404) {
      return NextResponse.json({ ok: true, ignorado: true }); // id inexistente (ex.: simulação do painel)
    }
    console.error("Webhook MP: falha ao consultar o pagamento", err);
    return NextResponse.json({ error: "Falha ao consultar." }, { status: 500 }); // o MP tenta de novo
  }

  try {
    await aplicarPagamento(pagamento);
  } catch (err) {
    console.error("Webhook MP: erro ao gravar", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}