"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const COMMANDS: Array<{ label: string; href: string; hint?: string }> = [
  { label: "Ir al dashboard", href: "/asesor", hint: "estadísticas, inmuebles" },
  { label: "Captar nuevo inmueble (cámara)", href: "/asesor/captacion" },
  { label: "Publicar con Llavero IA", href: "/asesor/publicar" },
  { label: "Ver leads", href: "/asesor/leads" },
  { label: "Buscar inmuebles públicos", href: "/buscar" },
  { label: "Abrir chat con Llavero", href: "/chat" },
  { label: "Ver landing", href: "/" },
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!open) return null;

  const filtered = COMMANDS.filter((c) =>
    !q || c.label.toLowerCase().includes(q.toLowerCase()) || c.hint?.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm flex items-start justify-center pt-24" onClick={() => setOpen(false)}>
      <div className="card w-[min(560px,90vw)] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar acción o página…"
          className="w-full px-5 py-4 text-base border-b border-[color:var(--color-border)] outline-none"
        />
        <ul className="max-h-[60vh] overflow-y-auto">
          {filtered.length === 0 && (
            <li className="px-5 py-4 text-sm text-[color:var(--color-fg-soft)]">Sin resultados</li>
          )}
          {filtered.map((c) => (
            <li key={c.href}>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setQ("");
                  router.push(c.href);
                }}
                className="w-full text-left px-5 py-3 flex items-center justify-between hover:bg-[color:var(--color-brand-50)]"
              >
                <span className="text-sm font-medium">{c.label}</span>
                {c.hint && <span className="text-xs text-[color:var(--color-fg-soft)]">{c.hint}</span>}
              </button>
            </li>
          ))}
        </ul>
        <div className="px-5 py-2 border-t border-[color:var(--color-border)] text-xs text-[color:var(--color-fg-soft)] flex justify-between">
          <span>↵ para abrir</span>
          <span>esc para cerrar</span>
        </div>
      </div>
    </div>
  );
}
