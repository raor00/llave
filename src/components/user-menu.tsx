"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { switchRoleAction, signOutAction } from "./user-menu-actions";
import {
  IconHome,
  IconBuildings,
  IconKey,
  IconPencil,
  IconLogout,
  IconChevronDown,
} from "./llave-icons";
import {
  IconInstagram,
  IconFacebook,
  IconTikTok,
  IconWhatsapp,
  IconX,
  IconMeta,
} from "./social-icons";

type Role = "inquilino" | "asesor" | "propietario";

const ROLE_LABEL: Record<Role, string> = {
  inquilino: "Inquilino",
  asesor: "Asesor",
  propietario: "Propietario",
};

const ROLE_HOME: Record<Role, string> = {
  inquilino: "/inquilino",
  asesor: "/asesor",
  propietario: "/propietario",
};

export function UserMenu({
  fullName,
  email,
  role,
}: {
  fullName: string | null;
  email: string;
  role: Role;
}) {
  const [open, setOpen] = useState(false);
  const [activeRole, setActiveRole] = useState<Role>(role);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => setActiveRole(role), [role]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const initials = (fullName ?? email)
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  function handleSwitch(nextRole: Role) {
    if (nextRole === activeRole || pending) return;
    setActiveRole(nextRole); // optimistic UI: chip + active button flip instantly
    startTransition(async () => {
      const res = await switchRoleAction(nextRole);
      if (!res?.ok) {
        setActiveRole(role); // rollback
        return;
      }
      router.push(res.home);
      router.refresh();
      setOpen(false);
    });
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 hover:bg-[color:var(--color-bg)] transition border border-[color:var(--color-border)]"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="size-8 rounded-full bg-[color:var(--color-brand-500)] text-white text-xs font-bold flex items-center justify-center">
          {initials || "L"}
        </span>
        <span className="hidden md:block text-sm font-medium text-[color:var(--color-fg)]">
          {fullName?.split(" ")[0] ?? "Mi Llave"}
        </span>
        <IconChevronDown size={14} className="text-[color:var(--color-fg-soft)]" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-72 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-white shadow-[var(--shadow-pop)] overflow-hidden z-50"
        >
          {/* Identidad */}
          <div className="px-4 py-3 border-b border-[color:var(--color-border)]">
            <div className="text-sm font-semibold text-[color:var(--color-fg)] truncate">
              {fullName ?? "Sin nombre"}
            </div>
            <div className="text-xs text-[color:var(--color-fg-soft)] truncate">{email}</div>
            <div className="mt-2 inline-flex items-center gap-2 text-xs">
              <span className="chip">{ROLE_LABEL[activeRole]}</span>
              <span className="text-[color:var(--color-fg-soft)]">rol activo</span>
            </div>
          </div>

          {/* Atajos */}
          <div className="py-1 text-sm">
            <MenuLink href={ROLE_HOME[activeRole]} onClick={() => setOpen(false)} icon={<IconHome />}>
              Ir a Mi Llave
            </MenuLink>
            <MenuLink href="/buscar" onClick={() => setOpen(false)} icon={<IconBuildings />}>
              Ver inmuebles
            </MenuLink>
            <MenuLink href="/chat" onClick={() => setOpen(false)} icon={<IconKey />}>
              Hablar con Llavero
            </MenuLink>
            <MenuLink href="/onboarding?edit=1" onClick={() => setOpen(false)} icon={<IconPencil />}>
              Editar perfil
            </MenuLink>
          </div>

          {/* Role switcher demo */}
          <div className="border-t border-[color:var(--color-border)] px-4 py-3 bg-[color:var(--color-brand-50)]">
            <div className="text-xs uppercase tracking-wider text-[color:var(--color-brand-700)] font-semibold mb-2">
              Vista de demo
            </div>
            <p className="text-[10px] text-[color:var(--color-fg-muted)] leading-snug mb-2">
              Cambia entre roles para ver cada interfaz con la misma cuenta.
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {(["inquilino", "asesor", "propietario"] as Role[]).map((r) => {
                const active = r === activeRole;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleSwitch(r)}
                    disabled={active || pending}
                    aria-pressed={active}
                    className={`w-full rounded-md px-2 py-1.5 text-[11px] font-semibold border transition ${
                      active
                        ? "bg-[color:var(--color-brand-500)] text-white border-[color:var(--color-brand-500)] cursor-default"
                        : "bg-white text-[color:var(--color-fg)] border-[color:var(--color-border-strong)] hover:border-[color:var(--color-brand-500)] hover:text-[color:var(--color-brand-700)]"
                    } ${pending && !active ? "opacity-60" : ""}`}
                  >
                    {ROLE_LABEL[r]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Redes / Meta Ads del asesor — visible para todos los roles porque
              en el demo cualquiera puede activar la vista asesor. */}
          <div className="border-t border-[color:var(--color-border)] px-4 py-3">
            <div className="text-xs uppercase tracking-wider text-[color:var(--color-fg-soft)] font-semibold mb-2">
              Redes conectadas
            </div>
            <div className="flex items-center gap-2">
              <SocialBtn label="Instagram" tint="text-[#e1306c]"><IconInstagram size={14} /></SocialBtn>
              <SocialBtn label="Facebook" tint="text-[#1877f2]"><IconFacebook size={14} /></SocialBtn>
              <SocialBtn label="TikTok" tint="text-[color:var(--color-fg)]"><IconTikTok size={14} /></SocialBtn>
              <SocialBtn label="WhatsApp" tint="text-[#25d366]"><IconWhatsapp size={14} /></SocialBtn>
              <SocialBtn label="X" tint="text-[color:var(--color-fg)]"><IconX size={12} /></SocialBtn>
              <SocialBtn label="Meta Ads" tint="text-[#1877f2]"><IconMeta size={14} /></SocialBtn>
            </div>
            <Link href="/asesor" onClick={() => setOpen(false)} className="text-[11px] text-[color:var(--color-brand-700)] hover:underline mt-2 inline-block">
              Configurar campañas →
            </Link>
          </div>

          {/* Logout */}
          <form action={signOutAction} className="border-t border-[color:var(--color-border)]">
            <button
              type="submit"
              className="w-full text-left px-4 py-2.5 text-sm text-[color:var(--color-danger)] hover:bg-[color:var(--color-bg)] flex items-center gap-3"
            >
              <IconLogout size={18} />
              Cerrar sesión
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  onClick,
  icon,
  children,
}: {
  href: string;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2 text-[color:var(--color-fg)] hover:bg-[color:var(--color-brand-50)] transition"
    >
      <span className="size-5 text-[color:var(--color-brand-700)] grid place-items-center">{icon}</span>
      <span>{children}</span>
    </Link>
  );
}

function SocialBtn({
  label,
  tint,
  children,
}: {
  label: string;
  tint: string;
  children: React.ReactNode;
}) {
  return (
    <span
      title={label}
      className={`size-7 rounded-md grid place-items-center bg-[color:var(--color-bg)] border border-[color:var(--color-border)] ${tint}`}
    >
      {children}
    </span>
  );
}
