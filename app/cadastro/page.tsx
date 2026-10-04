import FormCadastro from "@/components/auth/FormCadastro";

export default function PaginaCadastro() {
  return (
    <main className="mx-auto max-w-sm px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold">Criar conta</h1>
      <FormCadastro redirectTo="/" />
    </main>
  );
}