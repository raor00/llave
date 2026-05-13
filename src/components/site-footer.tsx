import Link from "next/link";
import { LlaveLogo } from "./llave-logo";

export function SiteFooter() {
  return (
    <footer className="border-t bg-[color:var(--color-brand-900)] text-white/80">
      <div className="container-x py-14 grid md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2 font-display text-2xl font-bold text-white">
            <LlaveLogo className="size-7 text-[color:var(--color-accent)]" />
            Llave
          </div>
          <p className="mt-3 text-sm leading-relaxed">
            La forma sin fricción de alquilar en Venezuela. Sin meses adelantados, con Llavero IA acompañándote.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">Producto</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/buscar">Buscar inmuebles</Link></li>
            <li><Link href="/chat">Llavero IA</Link></li>
            <li><Link href="/asesor">Asesor / CRM</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">Compañía</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/#manifiesto">Manifiesto</Link></li>
            <li><Link href="/#problema">El problema</Link></li>
            <li><Link href="/#roadmap">Roadmap</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">Construido en</h4>
          <p className="text-sm">Platanus Hackathon Build Night · Anthropic 2026</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs">
        © {new Date().getFullYear()} Llave · Hecho con cariño en Venezuela
      </div>
    </footer>
  );
}
