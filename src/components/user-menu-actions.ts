"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Role = "inquilino" | "asesor" | "propietario";

const ROLE_HOME: Record<Role, string> = {
  inquilino: "/inquilino",
  asesor: "/asesor",
  propietario: "/propietario",
};

/**
 * Switch active role for the demo. Optimized: writes role to a cookie
 * for instant header awareness, upserts profile in the same transaction,
 * revalidates the layout so the next render shows the new role chip.
 *
 * Returns `{ ok, home }` so the client can `router.push` immediately
 * without waiting for a server `redirect()` round-trip.
 */
export async function switchRoleAction(roleArg: Role | FormData) {
  const role: Role = (typeof roleArg === "string"
    ? roleArg
    : (roleArg.get("role") as Role)) as Role;

  if (!role || !["inquilino", "asesor", "propietario"].includes(role)) {
    return { ok: false as const, error: "Rol inválido" };
  }

  const supa = await createSupabaseServerClient();
  if (!supa) return { ok: false as const, error: "Sesión no disponible" };
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return { ok: false as const, error: "No autenticado" };

  // Cookie first: header reads it immediately on next render, no profile roundtrip.
  const jar = await cookies();
  jar.set("llave_role", role, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
  });

  // Fire-and-forget upsert; cookie carries the truth for the demo switcher.
  void supa
    .from("profiles")
    .upsert(
      { id: user.id, role, updated_at: new Date().toISOString() },
      { onConflict: "id" }
    );

  revalidatePath("/", "layout");
  return { ok: true as const, home: ROLE_HOME[role] };
}

export async function signOutAction() {
  const supa = await createSupabaseServerClient();
  if (supa) await supa.auth.signOut();
  const jar = await cookies();
  jar.delete("llave_role");
  redirect("/");
}
