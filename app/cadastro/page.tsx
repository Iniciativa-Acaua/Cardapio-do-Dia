import AuthLayout from "@/components/auth/AuthLayout";
import FormCadastro from "@/components/auth/FormCadastro";

export default function PaginaCadastro() {
  return (
    <AuthLayout
      titulo="Crie sua conta"
      subtitulo="Leva menos de um minuto e você acompanha todos os seus pedidos."
    >
      <FormCadastro redirectTo="/" />
    </AuthLayout>
  );
}