import Link from "next/link";
import { LlaveLogo } from "./llave-logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 glass border-b">
      <div className="container-x flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold">
          <LlaveLogo className="size-7 text-[color:var(--color-brand-500)]" />
          <span>Llave</span>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[color:var(--color-fg-muted)]">
          <Link href="/buscar" className="hover:text-[color:var(--color-fg)]">Inmuebles</Link>
          <Link href="/chat" className="hover:text-[color:var(--color-fg)]">Llavero IA</Link>
          <Link href="/asesor" className="hover:text-[color:var(--color-fg)]">Para asesores</Link>
          <Link href="/#manifiesto" className="hover:text-[color:var(--color-fg)]">Manifiesto</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className="btn btn-ghost">Ingresar</Link>
          <Link href="/chat" className="btn btn-primary">Hablar con Llavero</Link>
        </div>
      </div>
    </header>
  );
}
