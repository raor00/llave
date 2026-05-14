"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Role = "inquilino" | "asesor" | "propietario";

const ROLE_HOME: Record<Role, string> = {
  inquilino: "/inquilino",
  asesor: "/asesor",
  propietario: "/propietario",
};

export async function setupProfile(formData: FormData) {
  const role = formData.get("role") as Role | null;
  const name = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;

  if (!role || !["inquilino", "asesor", "propietario"].includes(role)) {
    return { ok: false, error: "Elige un rol válido" };
  }
  if (!name || name.length < 2) {
    return { ok: false, error: "Ingresa tu nombre completo" };
  }

  const supa = await createSupabaseServerClient();
  if (!supa) return { ok: false, error: "Supabase no configurado" };

  const { data: { user }, error: userErr } = await supa.auth.getUser();
  if (userErr || !user) return { ok: false, error: "Sesión no válida. Inicia sesión otra vez." };

  const { error } = await supa
    .from("profiles")
    .upsert(
      { id: user.id, role, full_name: name, phone, updated_at: new Date().toISOString() },
      { onConflict: "id" }
    );

  if (error) return { ok: false, error: error.message };

  redirect(ROLE_HOME[role]);
}
