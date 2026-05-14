import Link from "next/link";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SUPABASE_ENABLED } from "@/lib/supabase/env";
import { UserMenu } from "./user-menu";
import { NotificationBell } from "./notifications/notification-bell";
import { MobileNav } from "./mobile-nav";

type Role = "inquilino" | "asesor" | "propietario";

async function getViewer() {
  if (!SUPABASE_ENABLED) return null;
  const supa = await createSupabaseServerClient();
  if (!supa) return null;
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supa
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle();
  // Cookie wins for the demo switcher: avoids a full profile re-read race
  // after switchRoleAction. Falls back to the stored profile role.
  const jar = await cookies();
  const cookieRole = jar.get("llave_role")?.value as Role | undefined;
  const role: Role =
    cookieRole && ["inquilino", "asesor", "propietario"].includes(cookieRole)
      ? cookieRole
      : ((profile?.role as Role) ?? "inquilino");
  return {
    id: user.id,
    email: user.email ?? "",
    fullName: (profile?.full_name as string | null) ?? null,
    role,
  };
}

const PUBLIC_NAV = [
  { href: "/#problema", label: "El problema" },
  { href: "/#manifiesto", label: "Manifiesto" },
  { href: "/#llavero", label: "Llavero IA" },
  { href: "/#asesores", label: "Para asesores" },
];

const ROLE_NAV: Record<Role, Array<{ href: string; label: string }>> = {
  inquilino: [
    { href: "/inquilino", label: "Mi Llave" },
    { href: "/buscar", label: "Inmuebles" },
    { href: "/chat", label: "Llavero" },
    { href: "/inquilino/mensajes", label: "Mensajes" },
  ],
  asesor: [
    { href: "/asesor", label: "Dashboard" },
    { href: "/asesor/captacion", label: "Captación" },
    { href: "/asesor/leads", label: "Leads" },
    { href: "/asesor/publicar", label: "Publicar IA" },
  ],
  propietario: [
    { href: "/propietario", label: "Mis inmuebles" },
    { href: "/buscar", label: "Mercado" },
    { href: "/chat", label: "Llavero" },
    { href: "/asesor/captacion", label: "Publicar" },
  ],
};

const ROLE_LABEL: Record<Role, string> = {
  inquilino: "INQUILINO",
  asesor: "ASESOR",
  propietario: "PROPIETARIO",
};

export async function SiteHeader() {
  const viewer = await getViewer();
  const nav = viewer ? ROLE_NAV[viewer.role] : PUBLIC_NAV;

  return (
    <header className="sticky top-0 z-40 glass border-b">
      <div className="container-x flex h-16 items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <MobileNav items={nav} />
          <Link href="/" className="flex items-center gap-2 font-display text-lg sm:text-xl font-bold min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo.png" alt="Llave" className="size-7 sm:size-8 shrink-0" />
            <span className="truncate">Llave</span>
            {viewer && (
              <span className="ml-1 hidden sm:inline text-[10px] uppercase tracking-wider text-[color:var(--color-brand-700)] font-semibold px-1.5 py-0.5 rounded bg-[color:var(--color-brand-100)]">
                {ROLE_LABEL[viewer.role]}
              </span>
            )}
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-5 lg:gap-6 text-sm font-medium text-[color:var(--color-fg-muted)]">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-[color:var(--color-fg)] transition whitespace-nowrap">
              {item.label}
            </Link>
          ))}
        </nav>

        {viewer ? (
          <div className="flex items-center gap-2 shrink-0">
            <NotificationBell userId={viewer.id} role={viewer.role} />
            <UserMenu fullName={viewer.fullName} email={viewer.email} role={viewer.role} />
          </div>
        ) : (
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/login" className="btn btn-ghost text-sm !px-3">Mi Llave</Link>
            <Link href="/buscar" className="btn btn-primary text-sm !px-3 hidden sm:inline-flex">Ver Llave</Link>
          </div>
        )}
      </div>
    </header>
  );
}
