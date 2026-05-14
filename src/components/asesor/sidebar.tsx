"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/asesor", label: "Dashboard", icon: "▣" },
  { href: "/asesor/captacion", label: "Captación", icon: "◉" },
  { href: "/asesor/publicar", label: "Publicar con IA", icon: "✦" },
  { href: "/asesor/leads", label: "Leads", icon: "◎" },
];

export function AsesorSidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-[color:var(--color-border)] bg-white sticky top-0 h-screen p-5">
      <Link href="/asesor" className="flex items-center gap-2 font-display text-xl font-bold mb-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo.png" alt="Llave" className="size-8" />
        <span>Llave · Asesor</span>
      </Link>
      <nav className="flex-1 space-y-1">
        {NAV.map((item) => {
          const active = pathname === item.href || (item.href !== "/asesor" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                active
                  ? "bg-[color:var(--color-brand-100)] text-[color:var(--color-brand-700)]"
                  : "text-[color:var(--color-fg-muted)] hover:bg-[color:var(--color-bg)] hover:text-[color:var(--color-fg)]"
              }`}
            >
              <span className="text-base opacity-70">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto pt-6 border-t border-[color:var(--color-border)] text-xs text-[color:var(--color-fg-soft)]">
        <Link href="/" className="hover:text-[color:var(--color-fg)]">← Sitio público</Link>
        <div className="mt-2">Cmd+K para buscar</div>
      </div>
    </aside>
  );
}
