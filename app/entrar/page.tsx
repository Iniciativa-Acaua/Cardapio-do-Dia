import { redirect } from "next/navigation";
import FormEntrar from "@/components/auth/FormEntrar";
import { getSession } from "@/lib/session";

function destinoSeguro(valor?: string) {
  return valor && valor.startsWith("/") && !valor.startsWith("//")
    ? valor
    : "/";
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
    <main className="mx-auto max-w-sm px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold">Entrar na sua conta</h1>
      <FormEntrar redirectTo={redirectTo} />
    </main>
  );
}