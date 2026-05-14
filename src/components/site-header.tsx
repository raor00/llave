import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SUPABASE_ENABLED } from "@/lib/supabase/env";
import { UserMenu } from "./user-menu";

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
  const role: Role = (profile?.role as Role) ?? "inquilino";
  return {
    email: user.email ?? "",
    fullName: (profile?.full_name as string | null) ?? null,
    role,
  };
}

export async function SiteHeader() {
  const viewer = await getViewer();

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

        {viewer ? (
          <div className="flex items-center gap-2">
            <Link href="/buscar" className="hidden sm:inline-flex btn btn-ghost">
              Ver inmuebles
            </Link>
            <UserMenu fullName={viewer.fullName} email={viewer.email} role={viewer.role} />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn btn-ghost">Mi Llave</Link>
            <Link href="/buscar" className="btn btn-primary">Ver Llave</Link>
          </div>
        )}
      </div>
    </header>
  );
}
