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
} from "./social-icons";

type Role = "inquilino" | "asesor" | "propietario";

const ROLE_LABEL: Record<Role, string> = {
  inquilino: "Inquilino",
  asesor: "Asesor",
  propietario: "Propietario",
};

const ROLE_SHORT: Record<Role, string> = {
  inquilino: "Inq",
  asesor: "Ase",
  propietario: "Pro",
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
    setActiveRole(nextRole);
    startTransition(async () => {
      const res = await switchRoleAction(nextRole);
      if (!res?.ok) {
        setActiveRole(role);
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
        className="flex items-center gap-2 rounded-full pl-1 pr-2.5 py-1 hover:bg-[color:var(--color-bg)] transition border border-[color:var(--color-border)]"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="size-7 rounded-full bg-[color:var(--color-brand-500)] text-white text-[11px] font-bold flex items-center justify-center">
          {initials || "L"}
        </span>
        <span className="hidden md:block text-sm font-medium text-[color:var(--color-fg)] max-w-[7rem] truncate">
          {fullName?.split(" ")[0] ?? "Mi Llave"}
        </span>
        <IconChevronDown size={12} className="text-[color:var(--color-fg-soft)]" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-[18rem] rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-white shadow-[var(--shadow-pop)] overflow-hidden z-50"
        >
          {/* Identidad compacta */}
          <div className="px-3 py-3 flex items-center gap-3 border-b border-[color:var(--color-border)]">
            <span className="size-10 rounded-full bg-[color:var(--color-brand-500)] text-white text-sm font-bold flex items-center justify-center shrink-0">
              {initials || "L"}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-[color:var(--color-fg)] truncate leading-tight">
                {fullName ?? "Sin nombre"}
              </div>
              <div className="text-[11px] text-[color:var(--color-fg-soft)] truncate leading-tight">{email}</div>
              <span className="inline-flex items-center gap-1 mt-1 text-[10px] uppercase tracking-wider text-[color:var(--color-brand-700)] font-semibold px-1.5 py-0.5 rounded bg-[color:var(--color-brand-100)]">
                {ROLE_LABEL[activeRole]}
              </span>
            </div>
          </div>

          {/* Atajos en grid 2x2 */}
          <div className="grid grid-cols-2 gap-1 p-2">
            <ShortcutCell href={ROLE_HOME[activeRole]} onClick={() => setOpen(false)} icon={<IconHome size={16} />} label="Dashboard" />
            <ShortcutCell href="/buscar" onClick={() => setOpen(false)} icon={<IconBuildings size={16} />} label="Inmuebles" />
            <ShortcutCell href="/chat" onClick={() => setOpen(false)} icon={<IconKey size={16} />} label="Llavero" />
            <ShortcutCell href="/onboarding?edit=1" onClick={() => setOpen(false)} icon={<IconPencil size={16} />} label="Editar perfil" />
          </div>

          {/* Role switcher compacto */}
          <div className="border-t border-[color:var(--color-border)] px-3 py-2 bg-[color:var(--color-brand-50)]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase tracking-wider text-[color:var(--color-brand-700)] font-semibold">
                Vista demo
              </span>
              {pending && <span className="text-[9px] text-[color:var(--color-fg-soft)]">cambiando…</span>}
            </div>
            <div className="grid grid-cols-3 gap-1">
              {(["inquilino", "asesor", "propietario"] as Role[]).map((r) => {
                const active = r === activeRole;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleSwitch(r)}
                    disabled={active || pending}
                    aria-pressed={active}
                    title={ROLE_LABEL[r]}
                    className={`rounded-full px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider border transition ${
                      active
                        ? "bg-[color:var(--color-brand-500)] text-white border-[color:var(--color-brand-500)] cursor-default"
                        : "bg-white text-[color:var(--color-fg)] border-[color:var(--color-border-strong)] hover:border-[color:var(--color-brand-500)] hover:text-[color:var(--color-brand-700)]"
                    } ${pending && !active ? "opacity-60" : ""}`}
                  >
                    <span className="sm:hidden">{ROLE_SHORT[r]}</span>
                    <span className="hidden sm:inline">{ROLE_LABEL[r]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Redes en una línea */}
          <div className="border-t border-[color:var(--color-border)] px-3 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <SocialBtn label="Instagram" tint="text-[#e1306c]" bg="bg-[#e1306c]/10"><IconInstagram size={13} /></SocialBtn>
              <SocialBtn label="Facebook" tint="text-[#1877f2]" bg="bg-[#1877f2]/10"><IconFacebook size={13} /></SocialBtn>
              <SocialBtn label="TikTok" tint="text-[color:var(--color-fg)]" bg="bg-[color:var(--color-fg)]/10"><IconTikTok size={13} /></SocialBtn>
              <SocialBtn label="WhatsApp" tint="text-[#25d366]" bg="bg-[#25d366]/10"><IconWhatsapp size={13} /></SocialBtn>
              <SocialBtn label="X" tint="text-[color:var(--color-fg)]" bg="bg-[color:var(--color-fg)]/10"><IconX size={11} /></SocialBtn>
            </div>
            <Link
              href="/asesor/marketing"
              onClick={() => setOpen(false)}
              className="text-[10px] text-[color:var(--color-brand-700)] hover:underline font-semibold"
              title="Configurar campañas"
            >
              Ads →
            </Link>
          </div>

          {/* Logout */}
          <form action={signOutAction} className="border-t border-[color:var(--color-border)]">
            <button
              type="submit"
              className="w-full text-left px-3 py-2 text-xs font-semibold text-[color:var(--color-danger)] hover:bg-[color:var(--color-bg)] flex items-center gap-2"
            >
              <IconLogout size={14} />
              Cerrar sesión
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function ShortcutCell({
  href,
  onClick,
  icon,
  label,
}: {
  href: string;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2 rounded-md px-2 py-2 text-xs font-medium text-[color:var(--color-fg)] hover:bg-[color:var(--color-brand-50)] transition border border-transparent hover:border-[color:var(--color-brand-100)]"
    >
      <span className="size-6 rounded-md bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] grid place-items-center">
        {icon}
      </span>
      <span className="truncate">{label}</span>
    </Link>
  );
}

function SocialBtn({
  label,
  tint,
  bg,
  children,
}: {
  label: string;
  tint: string;
  bg: string;
  children: React.ReactNode;
}) {
  return (
    <span
      title={label}
      aria-label={label}
      className={`size-7 rounded-full grid place-items-center ${bg} ${tint} transition`}
    >
      {children}
    </span>
  );
}
