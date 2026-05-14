"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Role = "inquilino" | "asesor" | "propietario";

const ROLE_HOME: Record<Role, string> = {
  inquilino: "/inquilino",
  asesor: "/asesor",
  propietario: "/propietario",
};

export async function switchRoleAction(formData: FormData) {
  const role = formData.get("role") as Role | null;
  if (!role || !["inquilino", "asesor", "propietario"].includes(role)) return;

  const supa = await createSupabaseServerClient();
  if (!supa) return;
  const { data: { user } } = await supa.auth.getUser();
  if (!user) redirect("/login");

  await supa
    .from("profiles")
    .upsert(
      { id: user.id, role, updated_at: new Date().toISOString() },
      { onConflict: "id" }
    );

  redirect(ROLE_HOME[role]);
}

export async function signOutAction() {
  const supa = await createSupabaseServerClient();
  if (supa) await supa.auth.signOut();
  redirect("/");
}
