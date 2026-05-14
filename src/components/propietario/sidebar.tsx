"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  IconDashboard,
  IconProperties,
  IconContacts,
  IconDocument,
  IconCash,
  IconReport,
  IconSettings,
  IconCollapse,
  IconExpand,
  IconFileText,
} from "@/components/dashboard-icons";

/**
 * Sidebar del rol propietario. Mismo patrón colapsable que el de asesor pero
 * con el set de páginas que aplican a un dueño que delega la operación en
 * Llave: Dashboard, Mis inmuebles, Inquilinos, Contratos, Pagos, Documentos,
 * Reportes, Configuración. La preferencia de colapso se persiste en
 * `llave_propietario_sidebar_collapsed` para no chocar con la del asesor.
 */

type NavItem = {
  href: string;
  label: string;
  icon: (props: { size?: number }) => React.JSX.Element;
  group?: "Operación" | "Cartera" | "Cuenta";
};

const NAV: NavItem[] = [
  { href: "/propietario", label: "Dashboard", icon: IconDashboard, group: "Operación" },
  { href: "/propietario/inquilinos", label: "Inquilinos", icon: IconContacts, group: "Operación" },
  { href: "/propietario/pagos", label: "Pagos", icon: IconCash, group: "Operación" },
  { href: "/propietario/contratos", label: "Contratos", icon: IconFileText, group: "Cartera" },
  { href: "/propietario/documentos", label: "Documentos", icon: IconDocument, group: "Cartera" },
  { href: "/asesor/captacion", label: "Mis inmuebles", icon: IconProperties, group: "Cartera" },
  { href: "/propietario/reportes", label: "Reportes", icon: IconReport, group: "Cuenta" },
  { href: "/propietario/configuracion", label: "Configuración", icon: IconSettings, group: "Cuenta" },
];

const GROUP_ORDER: NonNullable<NavItem["group"]>[] = [
  "Operación",
  "Cartera",
  "Cuenta",
];

export function PropietarioSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("llave_propietario_sidebar_collapsed");
    if (saved === "1") setCollapsed(true);
    setHydrated(true);
  }, []);

  function toggle() {
    setCollapsed((v) => {
      const next = !v;
      localStorage.setItem(
        "llave_propietario_sidebar_collapsed",
        next ? "1" : "0"
      );
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
      <div
        className={`flex items-center ${
          effectiveCollapsed ? "justify-center" : "justify-between"
        } mb-6`}
      >
        {!effectiveCollapsed && (
          <Link
            href="/propietario"
            className="flex items-center gap-2 font-display text-lg font-bold"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo.png" alt="Llave" className="size-7" />
            <span>Llave</span>
            <span className="text-[10px] uppercase tracking-wider text-[color:var(--color-brand-700)] font-semibold px-1.5 py-0.5 rounded bg-[color:var(--color-brand-100)]">
              DUEÑO
            </span>
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
                  (item.href !== "/propietario" && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      title={effectiveCollapsed ? item.label : undefined}
                      className={`flex items-center ${
                        effectiveCollapsed ? "justify-center px-2" : "gap-2.5 px-2.5"
                      } py-2 rounded-md text-sm font-medium transition relative ${
                        active
                          ? "bg-[color:var(--color-brand-100)] text-[color:var(--color-brand-700)]"
                          : "text-[color:var(--color-fg-muted)] hover:bg-[color:var(--color-bg)] hover:text-[color:var(--color-fg)]"
                      }`}
                    >
                      <Icon size={18} />
                      {!effectiveCollapsed && (
                        <span className="flex-1 truncate">{item.label}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div
        className={`mt-auto pt-4 border-t border-[color:var(--color-border)] ${
          effectiveCollapsed ? "text-center" : ""
        }`}
      >
        {!effectiveCollapsed ? (
          <>
            <Link
              href="/"
              className="text-xs text-[color:var(--color-fg-soft)] hover:text-[color:var(--color-fg)]"
            >
              ← Sitio público
            </Link>
            <div className="text-[10px] text-[color:var(--color-fg-soft)] mt-1">
              Tu cartera, Llave responde.
            </div>
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
