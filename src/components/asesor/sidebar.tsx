"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  IconDashboard,
  IconProperties,
  IconContacts,
  IconLeads,
  IconCalendar,
  IconDocument,
  IconCash,
  IconCapture,
  IconSparkle,
  IconReport,
  IconMegaphone,
  IconSettings,
  IconCollapse,
  IconExpand,
} from "@/components/dashboard-icons";

type NavItem = {
  href: string;
  label: string;
  icon: (props: { size?: number }) => React.JSX.Element;
  badge?: string;
  group?: "Operación" | "Cartera" | "Crecimiento" | "Cuenta";
};

const NAV: NavItem[] = [
  // Operación
  { href: "/asesor", label: "Dashboard", icon: IconDashboard, group: "Operación" },
  { href: "/asesor/leads", label: "Leads", icon: IconLeads, group: "Operación" },
  { href: "/asesor/contactos", label: "Contactos", icon: IconContacts, group: "Operación" },
  { href: "/asesor/visitas", label: "Visitas", icon: IconCalendar, group: "Operación", badge: "Nuevo" },
  // Cartera
  { href: "/asesor/inmuebles", label: "Inmuebles", icon: IconProperties, group: "Cartera" },
  { href: "/asesor/captacion", label: "Captación", icon: IconCapture, group: "Cartera" },
  { href: "/asesor/publicar", label: "Publicar con IA", icon: IconSparkle, group: "Cartera" },
  { href: "/asesor/contratos", label: "Contratos", icon: IconDocument, group: "Cartera" },
  // Crecimiento
  { href: "/asesor/reportes", label: "Reportes", icon: IconReport, group: "Crecimiento" },
  { href: "/asesor/comisiones", label: "Comisiones", icon: IconCash, group: "Crecimiento" },
  { href: "/asesor/marketing", label: "Marketing & Ads", icon: IconMegaphone, group: "Crecimiento" },
  // Cuenta
  { href: "/asesor/configuracion", label: "Configuración", icon: IconSettings, group: "Cuenta" },
];

const GROUP_ORDER: NonNullable<NavItem["group"]>[] = ["Operación", "Cartera", "Crecimiento", "Cuenta"];

export function AsesorSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("llave_sidebar_collapsed");
    if (saved === "1") setCollapsed(true);
    setHydrated(true);
  }, []);

  function toggle() {
    setCollapsed((v) => {
      const next = !v;
      localStorage.setItem("llave_sidebar_collapsed", next ? "1" : "0");
      return next;
    });
  }

  const grouped = GROUP_ORDER.map((g) => ({
    group: g,
    items: NAV.filter((n) => n.group === g),
  }));

  const effectiveCollapsed = hydrated ? collapsed : false;

  return (
    <aside
      className={`hidden lg:flex flex-col shrink-0 border-r border-[color:var(--color-border)] bg-white sticky top-0 h-screen transition-[width] duration-200 ${
        effectiveCollapsed ? "w-16 px-2 py-4" : "w-64 p-4"
      }`}
    >
      <div className={`flex items-center ${effectiveCollapsed ? "justify-center" : "justify-between"} mb-6`}>
        {!effectiveCollapsed && (
          <Link href="/asesor" className="flex items-center gap-2 font-display text-lg font-bold">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo.png" alt="Llave" className="size-7" />
            <span>Llave</span>
            <span className="text-[10px] uppercase tracking-wider text-[color:var(--color-brand-700)] font-semibold px-1.5 py-0.5 rounded bg-[color:var(--color-brand-100)]">CRM</span>
          </Link>
        )}
        <button
          type="button"
          onClick={toggle}
          aria-label={effectiveCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
          className="size-8 rounded-md hover:bg-[color:var(--color-bg)] grid place-items-center text-[color:var(--color-fg-soft)] hover:text-[color:var(--color-fg)]"
        >
          {effectiveCollapsed ? <IconExpand size={16} /> : <IconCollapse size={16} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto space-y-4 -mx-1 px-1">
        {grouped.map(({ group, items }) => (
          <div key={group}>
            {!effectiveCollapsed && (
              <div className="text-[10px] uppercase tracking-wider text-[color:var(--color-fg-soft)] font-semibold px-2 mb-1.5">
                {group}
              </div>
            )}
            <ul className="space-y-0.5">
              {items.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/asesor" && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      title={effectiveCollapsed ? item.label : undefined}
                      className={`flex items-center ${effectiveCollapsed ? "justify-center px-2" : "gap-2.5 px-2.5"} py-2 rounded-md text-sm font-medium transition relative ${
                        active
                          ? "bg-[color:var(--color-brand-100)] text-[color:var(--color-brand-700)]"
                          : "text-[color:var(--color-fg-muted)] hover:bg-[color:var(--color-bg)] hover:text-[color:var(--color-fg)]"
                      }`}
                    >
                      <Icon size={18} />
                      {!effectiveCollapsed && (
                        <>
                          <span className="flex-1 truncate">{item.label}</span>
                          {item.badge && (
                            <span className="text-[9px] uppercase tracking-wider bg-[color:var(--color-accent)] text-[color:var(--color-brand-900)] px-1.5 py-0.5 rounded font-bold">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                      {effectiveCollapsed && item.badge && (
                        <span className="absolute top-1 right-1 size-1.5 rounded-full bg-[color:var(--color-accent)]" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className={`mt-auto pt-4 border-t border-[color:var(--color-border)] ${effectiveCollapsed ? "text-center" : ""}`}>
        {!effectiveCollapsed ? (
          <>
            <Link href="/" className="text-xs text-[color:var(--color-fg-soft)] hover:text-[color:var(--color-fg)]">
              ← Sitio público
            </Link>
            <div className="text-[10px] text-[color:var(--color-fg-soft)] mt-1">⌘K para buscar</div>
          </>
        ) : (
          <Link
            href="/"
            title="Sitio público"
            className="grid place-items-center size-8 rounded-md hover:bg-[color:var(--color-bg)] mx-auto text-[color:var(--color-fg-soft)]"
          >
            ←
          </Link>
        )}
      </div>
    </aside>
  );
}
