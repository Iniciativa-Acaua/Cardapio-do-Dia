// components/Header.tsx
import Link from "next/link";
import Image from "next/image";
import CartBadge from "@/components/CartBadge";

const navigation = [
  { label: "Início", href: "/" },
  { label: "Cardápio", href: "/cardapio" },
  { label: "Sobre nós", href: "/sobre" },
  { label: "Contato", href: "/contato" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
        {/* Logo */}
        <Link href="/" aria-label="+Sabor - página inicial" className="shrink-0">
          <Image
            src="/logo.svg"
            alt="+Sabor"
            width={120}
            height={40}
            priority
            className="h-10 w-auto"
          />
        </Link>

        {/* Navegação */}
        <nav
          aria-label="Navegação principal"
          className="hidden items-center gap-6 text-sm font-medium text-zinc-200 md:flex"
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-orange-500"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Carrinho */}
        <Link
          href="/carrinho"
          aria-label="Abrir carrinho"
          className="relative shrink-0 p-1 transition-opacity hover:opacity-80"
        >
          <Image
            src="/Carrinho.svg"
            alt=""
            width={28}
            height={28}
            className="h-7 w-7"
          />
          <CartBadge />
        </Link>
      </div>
    </header>
  );
}