// components/Footer.tsx
import Image from "next/image";
import Link from "next/link";

const navigation = [
  { label: "Início", href: "/" },
  { label: "Cardápio", href: "/cardapio" },
  { label: "Sobre nós", href: "/sobre" },
  { label: "Contato", href: "/contato" },
  { label: "Carrinho", href: "/carrinho" },
];

const socials = [
  {
    label: "Facebook",
    href: "#", // troque pelo link real
    path: "M10 .4C4.698.4.4 4.698.4 10s4.298 9.6 9.6 9.6s9.6-4.298 9.6-9.6S15.302.4 10 .4m2.274 6.634h-1.443c-.171 0-.361.225-.361.524V8.6h1.805l-.273 1.486H10.47v4.461H8.767v-4.461H7.222V8.6h1.545v-.874c0-1.254.87-2.273 2.064-2.273h1.443z",
  },
  {
    label: "Twitter / X",
    href: "#",
    path: "M10 .4C4.698.4.4 4.698.4 10s4.298 9.6 9.6 9.6s9.6-4.298 9.6-9.6S15.302.4 10 .4m3.905 7.864q.005.123.005.244c0 2.5-1.901 5.381-5.379 5.381a5.34 5.34 0 0 1-2.898-.85q.221.026.451.025c.886 0 1.701-.301 2.348-.809a1.895 1.895 0 0 1-1.766-1.312a1.9 1.9 0 0 0 .853-.033a1.89 1.89 0 0 1-1.517-1.854v-.023c.255.141.547.227.857.237a1.89 1.89 0 0 1-.585-2.526a5.38 5.38 0 0 0 3.897 1.977a1.891 1.891 0 0 1 3.222-1.725a3.8 3.8 0 0 0 1.2-.459a1.9 1.9 0 0 1-.831 1.047a3.8 3.8 0 0 0 1.086-.299a3.8 3.8 0 0 1-.943.979",
  },
  {
    label: "Instagram",
    href: "#",
    path: "M13 10a3 3 0 1 1-6 0q.001-.257.049-.5H6v3.997c0 .278.225.503.503.503h6.995a.503.503 0 0 0 .502-.503V9.5h-1.049q.048.243.049.5m-3 2a2 2 0 1 0-.001-4.001A2 2 0 0 0 10 12m2.4-4.1h1.199a.3.3 0 0 0 .301-.3V6.401a.3.3 0 0 0-.301-.301H12.4a.3.3 0 0 0-.301.301V7.6c.001.165.136.3.301.3M10 .4A9.6 9.6 0 0 0 .4 10a9.6 9.6 0 0 0 9.6 9.6a9.6 9.6 0 0 0 9.6-9.6A9.6 9.6 0 0 0 10 .4m5 13.489C15 14.5 14.5 15 13.889 15H6.111C5.5 15 5 14.5 5 13.889V6.111C5 5.5 5.5 5 6.111 5h7.778C14.5 5 15 5.5 15 6.111z",
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-neutral-900 text-neutral-300">
      {/* filete laranja no topo */}
      <div className="h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent" />

      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {/* Marca */}
        <div className="space-y-4 sm:col-span-2 lg:col-span-1">
          <Link href="/" aria-label="+Sabor - página inicial" className="inline-block">
            <Image src="/logo.svg" alt="+Sabor" width={120} height={40} className="h-10 w-auto" />
          </Link>
          <p className="max-w-xs text-sm leading-relaxed text-neutral-400">
            Sabor que combina com o seu momento. Escolha seus pratos favoritos e peça online.
          </p>

          <div className="flex gap-3">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="text-neutral-400 transition hover:-translate-y-0.5 hover:text-orange-500"
              >
                <svg viewBox="0 0 20 20" className="h-8 w-8" aria-hidden="true">
                  <path fill="currentColor" d={s.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        {/* Navegação */}
        <nav aria-label="Rodapé">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Navegação</h2>
          <ul className="space-y-2 text-sm">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition hover:text-orange-500">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Horário */}
        <div>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Atendimento</h2>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between gap-4">
              <span>Seg a sex</span>
              <span className="text-neutral-400">11h às 22h</span>
            </li>
            <li className="flex justify-between gap-4">
              <span>Sábado</span>
              <span className="text-neutral-400">11h às 23h</span>
            </li>
            <li className="flex justify-between gap-4">
              <span>Domingo</span>
              <span className="text-neutral-400">11h às 20h</span>
            </li>
          </ul>
        </div>

        {/* Contato */}
        <div>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Contato</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="tel:+551112345678" className="transition hover:text-orange-500">
                (11) 1234-5678
              </a>
            </li>
            <li>
              <a href="mailto:contato@exemplo.com" className="transition hover:text-orange-500">
                contato@exemplo.com
              </a>
            </li>
            <li className="text-neutral-400">Rua Exemplo, 123 - Bairro</li>
          </ul>
        </div>
      </div>

      {/* Barra inferior */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-5 text-xs text-neutral-500 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} +Sabor. Todos os direitos reservados.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
            <Link href="/privacidade" className="transition hover:text-orange-500">
              Política de Privacidade
            </Link>
            <span>Desenvolvido pela Iniciativa Acauã</span>
          </div>
        </div>
      </div>
    </footer>
  );
}