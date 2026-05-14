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

      {/* Conversational alternative */}
      <div className="card p-4 mb-8 bg-[color:var(--color-brand-50)] border-[color:var(--color-brand-100)] flex flex-col sm:flex-row items-center gap-4 justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-[color:var(--color-brand-100)] flex items-center justify-center text-xl">🗝️</div>
          <div>
            <div className="font-semibold text-sm">¿Prefieres conversar?</div>
            <div className="text-xs text-[color:var(--color-fg-muted)]">Llavero IA te configura el perfil en 60 segundos. Sin formularios.</div>
          </div>
        </div>
        <a
          href="/chat?context=Hola%20Llavero%2C%20quiero%20configurar%20mi%20cuenta%20en%20Llave.%20Por%20favor%20preg%C3%BAntame%20si%20soy%20inquilino%2C%20asesor%20o%20propietario%2C%20mi%20nombre%20completo%20y%20un%20tel%C3%A9fono.%20Cuando%20tengas%20los%20tres%20datos%20llama%20a%20la%20herramienta%20setupMyProfile%20y%20cu%C3%A9ntame%20a%20d%C3%B3nde%20me%20rediriges."
          className="btn btn-primary"
        >
          Hablar con Llavero
        </a>
      </div>

      <OnboardingForm defaultName={profile?.full_name ?? ""} email={user.email ?? ""} />
    </div>
  );
}
