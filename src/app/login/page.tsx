import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SUPABASE_ENABLED } from "@/lib/supabase/env";
import LoginForm from "./login-form";

export const dynamic = "force-dynamic";

const ROLE_HOME: Record<string, string> = {
  inquilino: "/inquilino",
  asesor: "/asesor",
  propietario: "/propietario",
};

export default async function LoginPage() {
  if (SUPABASE_ENABLED) {
    const supa = await createSupabaseServerClient();
    if (supa) {
      const { data: { user } } = await supa.auth.getUser();
      if (user) {
        const { data: profile } = await supa
          .from("profiles")
          .select("role, full_name")
          .eq("id", user.id)
          .maybeSingle();
        if (profile?.role && profile?.full_name && ROLE_HOME[profile.role]) {
          redirect(ROLE_HOME[profile.role]);
        }
        redirect("/onboarding");
      }
    }
  }
  return <LoginForm />;
}
