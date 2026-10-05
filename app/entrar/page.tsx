import { redirect } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import FormEntrar from "@/components/auth/FormEntrar";
import { getSession } from "@/lib/session";

function destinoSeguro(valor?: string) {
  return valor && valor.startsWith("/") && !valor.startsWith("//") ? valor : "/";
}

export default async function PaginaEntrar({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect: destino } = await searchParams;
  const redirectTo = destinoSeguro(destino);

  if (await getSession()) redirect(redirectTo);

  return (
    <AuthLayout
      titulo="Bem-vindo de volta"
      subtitulo="Entre para acompanhar seus pedidos e pedir mais rápido."
    >
      <FormEntrar redirectTo={redirectTo} />
    </AuthLayout>
  );
}