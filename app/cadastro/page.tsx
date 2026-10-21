import AuthLayout from "@/components/auth/AuthLayout";
import FormCadastro from "@/components/auth/FormCadastro";

export default function PaginaCadastro() {
  return (
    <AuthLayout
      rotulo="Sua conta"
      titulo="Bem-vindo"
      destaque="de volta"
      subtitulo="Entre para acompanhar seus pedidos e pedir mais rápido."
    >
      <FormCadastro redirectTo="/" />
    </AuthLayout>
  );
}