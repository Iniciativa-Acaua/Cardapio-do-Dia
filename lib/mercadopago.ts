import { MercadoPagoConfig, Payment, Preference } from "mercadopago";

// criado sob demanda: não quebra o build se a variável faltar
function client() {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) throw new Error("MP_ACCESS_TOKEN não definido.");
  return new MercadoPagoConfig({ accessToken, options: { timeout: 8000 } });
}

export const preferenceApi = () => new Preference(client());
export const paymentApi = () => new Payment(client());