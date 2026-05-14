"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Notification, Role } from "@/lib/notifications/seed";

const ROLE_TINT: Record<Role, string> = {
  inquilino: "Notificaciones · Tu búsqueda",
  asesor: "Notificaciones · Cartera",
  propietario: "Notificaciones · Tu inmueble",
};

/**
 * Client shell for the notification bell. Renders the inbox dropdown,
 * requests browser-push permission on first open and emits a one-off
 * local Notification when there are unread items so the experience feels
 * native. Real Web Push (service worker + VAPID + push subscription) vive
 * en el roadmap junto al App Clip de LiDAR.
 */
export function NotificationBellShell({
  role,
  unread,
  items,
}: {
  role: Role;
  unread: number;
  items: Notification[];
}) {
  const [open, setOpen] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const ref = useRef<HTMLDivElement>(null);
  const teasedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (typeof Notification === "undefined") {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Tease one local notification per session so the user sees the bell at work.
  useEffect(() => {
    if (teasedRef.current || permission !== "granted" || unread === 0) return;
    teasedRef.current = true;
    try {
      const top = items.find((n) => !n.read);
      if (!top) return;
      new Notification(`Llave · ${top.title}`, {
        body: top.body ?? undefined,
        tag: `llave-${top.id}`,
        silent: false,
      });
    } catch {
      /* ignore */
    }
  }, [permission, unread, items]);

  async function askPermission() {
    if (typeof Notification === "undefined") return;
    const next = await Notification.requestPermission();
    setPermission(next);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative size-9 rounded-full border border-[color:var(--color-border)] hover:bg-[color:var(--color-bg)] transition flex items-center justify-center text-[color:var(--color-fg)]"
        aria-label="Notificaciones"
        aria-expanded={open}
      >
        <BellIcon />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-[color:var(--color-brand-500)] text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[22rem] max-w-[90vw] rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-white shadow-[var(--shadow-pop)] overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-[color:var(--color-border)] bg-[color:var(--color-bg)]">
            <div className="text-xs uppercase tracking-wider text-[color:var(--color-brand-700)] font-semibold">
              {ROLE_TINT[role]}
            </div>
            <div className="text-sm text-[color:var(--color-fg-muted)] mt-0.5">
              {unread > 0 ? `${unread} sin leer` : "Todo al día"}
            </div>
          </div>

          {permission === "default" && (
            <div className="px-4 py-3 bg-[color:var(--color-brand-50)] border-b border-[color:var(--color-border)] text-xs text-[color:var(--color-fg)]">
              Activa las notificaciones del navegador para enterarte de leads, visitas y avisos de Llave en tiempo real.
              <button
                type="button"
                onClick={askPermission}
                className="mt-2 btn btn-primary text-xs !py-1 !px-3"
              >
                Activar notificaciones
              </button>
            </div>
          )}
          {permission === "denied" && (
            <div className="px-4 py-2 bg-[color:var(--color-bg)] border-b border-[color:var(--color-border)] text-[11px] text-[color:var(--color-fg-soft)]">
              Notificaciones bloqueadas en el navegador. Igual recibes alertas dentro de Mi Llave.
            </div>
          )}

          <div className="max-h-[60vh] overflow-y-auto">
            {items.length === 0 ? (
              <div className="p-6 text-center text-sm text-[color:var(--color-fg-muted)]">
                Aún no hay notificaciones.
              </div>
            ) : (
              items.map((item) => (
                <Link
                  key={item.id}
                  href={item.link ?? "#"}
                  onClick={() => setOpen(false)}
                  className={`block px-4 py-3 hover:bg-[color:var(--color-brand-50)] transition border-b border-[color:var(--color-border)] last:border-b-0 ${item.read ? "" : "bg-[color:var(--color-brand-50)]/40"}`}
                >
                  <div className="flex items-start gap-2">
                    <span className={`mt-1.5 size-2 rounded-full shrink-0 ${item.read ? "bg-[color:var(--color-border)]" : "bg-[color:var(--color-brand-500)]"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-[color:var(--color-fg)] line-clamp-1">{item.title}</div>
                      {item.body && <div className="text-xs text-[color:var(--color-fg-muted)] mt-0.5 line-clamp-2">{item.body}</div>}
                      <div className="text-[10px] uppercase tracking-wider text-[color:var(--color-fg-soft)] mt-1">{timeAgo(item.created_at)}</div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          <div className="px-4 py-2 border-t border-[color:var(--color-border)] text-[11px] text-[color:var(--color-fg-soft)] flex justify-between">
            <span>Push real próximamente (Web Push + RoomPlan App Clip).</span>
          </div>
        </div>
      )}
    </div>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 9a6 6 0 0 1 12 0c0 5 2 7 2 7H4s2-2 2-7Z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </svg>
  );
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return "Ahora";
  if (m < 60) return `Hace ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `Hace ${h} h`;
  const d = Math.round(h / 24);
  return `Hace ${d} d`;
}
