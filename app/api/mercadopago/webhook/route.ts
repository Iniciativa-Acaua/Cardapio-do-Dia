import { createHmac, timingSafeEqual } from "node:crypto";
import { paymentApi } from "@/lib/mercadopago";
import { aplicarPagamento } from "@/lib/payments";

export const runtime = "nodejs";

function assinaturaValida(req: Request, dataId: string | null) {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) throw new Error("MP_WEBHOOK_SECRET não definido.");

  const xSignature = req.headers.get("x-signature");
  const xRequestId = req.headers.get("x-request-id");
  if (!xSignature) return false;

  // formato: "ts=1704908010,v1=618c85..."
  const partes = Object.fromEntries(
    xSignature.split(",").map((p) => {
      const [k, ...v] = p.trim().split("=");
      return [k, v.join("=")];
    })
  );
  const { ts, v1 } = partes;
  if (!ts || !v1) return false;

  // campos ausentes ficam de fora do manifesto
  let manifesto = "";
  if (dataId) manifesto += `id:${dataId.toLowerCase()};`;
  if (xRequestId) manifesto += `request-id:${xRequestId};`;
  manifesto += `ts:${ts};`;

  const esperado = Buffer.from(createHmac("sha256", secret).update(manifesto).digest("hex"));
  const recebido = Buffer.from(v1);
  return esperado.length === recebido.length && timingSafeEqual(esperado, recebido);
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  const dataId = url.searchParams.get("data.id");

  try {
    if (!assinaturaValida(req, dataId)) {
      return new Response("assinatura inválida", { status: 401 });
    }
  } catch (err) {
    console.error("Webhook MP: configuração", err);
    return new Response("erro de configuração", { status: 500 });
  }

  const body = await req.json().catch(() => null);
  const tipo = body?.type ?? url.searchParams.get("type");

  // só interessa evento de pagamento
  if (tipo !== "payment" || !dataId) return new Response("ignorado");

  try {
    // nunca confia no corpo da notificação: busca o pagamento real com o nosso token
    const pagamento = await paymentApi().get({ id: dataId });
    await aplicarPagamento(pagamento);
  } catch (err) {
    if ((err as { status?: number })?.status === 404) return new Response("ignorado");
    console.error("Webhook MP: falha ao processar", err);
    return new Response("erro", { status: 500 }); // o Mercado Pago tenta de novo
  }

  return new Response("ok");
}