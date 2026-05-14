import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 glass border-b">
      <div className="container-x flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo.png" alt="Llave" className="size-8" />
          <span>Llave</span>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[color:var(--color-fg-muted)]">
          <Link href="/#problema" className="hover:text-[color:var(--color-fg)]">El problema</Link>
          <Link href="/#manifiesto" className="hover:text-[color:var(--color-fg)]">Manifiesto</Link>
          <Link href="/#llavero" className="hover:text-[color:var(--color-fg)]">Llavero IA</Link>
          <Link href="/#asesores" className="hover:text-[color:var(--color-fg)]">Para asesores</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className="btn btn-ghost">Mi Llave</Link>
          <Link href="/buscar" className="btn btn-primary">Ver Llave</Link>
        </div>
      </div>
    </header>
  );
}
