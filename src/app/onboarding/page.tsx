import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { OnboardingForm } from "./onboarding-form";

export const dynamic = "force-dynamic";

const ROLE_HOME: Record<string, string> = {
  inquilino: "/inquilino",
  asesor: "/asesor",
  propietario: "/propietario",
};

export default async function OnboardingPage() {
  const supa = await createSupabaseServerClient();
  if (!supa) redirect("/login");

  const { data: { user } } = await supa.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supa
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  // Returning user with role already set goes straight to their dashboard.
  if (profile?.role && profile?.full_name && ROLE_HOME[profile.role]) {
    redirect(ROLE_HOME[profile.role]);
  }

  return (
    <div className="container-x py-16 max-w-3xl">
      <div className="text-center mb-10">
        <span className="chip mb-3">Mi Llave · Onboarding</span>
        <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight">
          ¿Cómo quieres usar Llave?
        </h1>
        <p className="mt-4 text-lg text-[color:var(--color-fg-muted)] max-w-xl mx-auto">
          Elige tu rol y adaptamos la plataforma a lo que vas a hacer. Puedes cambiar después desde tu perfil.
        </p>
      </div>
      <OnboardingForm defaultName={profile?.full_name ?? ""} email={user.email ?? ""} />
    </div>
  );
}
