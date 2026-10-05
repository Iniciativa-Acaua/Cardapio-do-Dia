import Link from "next/link";
import Image from "next/image";
import CartBadge from "@/components/CartBadge";
import MenuConta from "@/components/auth/MenuConta";
import MenuMobile from "@/components/layout/MenuMobile";
import NavLinks from "@/components/layout/NavLinks";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
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

        <NavLinks />

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/carrinho"
            aria-label="Abrir carrinho"
            className="relative p-1 transition-opacity hover:opacity-80"
          >
            <Image src="/Carrinho.svg" alt="" width={28} height={28} className="h-7 w-7" />
            <CartBadge />
          </Link>

          <MenuConta />
          <MenuMobile />
        </div>
      </div>
    </header>
  );
}